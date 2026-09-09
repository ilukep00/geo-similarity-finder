from google import genai
from pydantic import BaseModel, Field
from typing import List
import cv2
import numpy as np
import os
from sam3.model_builder import build_efficientsam3_image_model
from sam3.model.sam3_image_processor import Sam3Processor
import numpy as np
import cv2
from google import genai
import os
import base64

from PIL import Image
from shapely.geometry import Polygon
import geopandas as gpd
import time
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJ_DIR = os.path.join(SCRIPT_DIR, "..", "venv", "Lib", "site-packages", "rasterio", "proj_data")
os.environ["PROJ_LIB"] = PROJ_DIR

# This part is necessary Because PostgreSQL added its own path to the system's global environment variables,
# rasterio gets confused and looks in your PostgreSQL folder instead of its own.

import rasterio
from rasterio.transform import Affine

gemini_api_key = os.getenv("GEMINI_API_KEY", "your_api_key")
class BoundingBox(BaseModel):
    box_2d: List[int] = Field(description="The 2D bounding box of the item as [ymin, xmin, ymax, xmax] normalized to 0-1000.")
    mask: List[List[int]] = Field(description="The segmentation mask of the item as a polygon of [x,y] coordinates, normalized to 0-1000.")
    label: str = Field(description="A descriptive label for the item.")

class BoundingBoxes(BaseModel):
    boxes: List[BoundingBox]

FREE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
]

MAX_TRIES_PER_MODEL = 3

def call_to_google_gen_ai_service():
    client = genai.Client(api_key=gemini_api_key)

    with open("regionOfInterest.png", "rb") as f:
        roi_b64 = base64.b64encode(f.read()).decode("utf-8")

    with open("regionToPredict.png", "rb") as f:
        predict_b64 = base64.b64encode(f.read()).decode("utf-8")
    prompt = (
        "Given the first image, can you detect the parts of that image that are similar "
        "to the second part? The return object should be the box_2d as [ymin, xmin, ymax, xmax] "
        "normalized to 0-1000."
    )
    input_payload = [
            {"type": "text", "text": prompt},
            {"type": "image", "data": roi_b64, "mime_type": "image/png"},
            {"type": "image", "data": predict_b64, "mime_type": "image/png"},
        ]
    response_format = {
            "type": "text",
            "mime_type": "application/json",
            "schema": BoundingBoxes.model_json_schema()
        }

    for model in FREE_MODELS:
        for attempt in range(1,MAX_TRIES_PER_MODEL+1):
            try:
                interaction = client.interactions.create(
                    model=model,
                    input=input_payload,
                    response_format=response_format
                )
                items = BoundingBoxes.model_validate_json(interaction.output_text)
                return items
            except Exception as e:
                print(f"Attempt {attempt} failed for model: {model} due to this excecption {e}")
                if attempt < MAX_TRIES_PER_MODEL:
                    sleep_time = 2 ** (attempt)
                    time.sleep(sleep_time)
                else:
                    print(f"Model {model} has use his three attempts. Trying with the next model")

    raise RuntimeError("Error crítico: Todos los modelos de la lista fallaron tras múltiples intentos.")


def add_masks_to_image(image, boxes):
    img_height, img_width = image.shape[:2]
    overlay = image.copy()
    for box in boxes:
        mask_points = np.array(box.mask)
        mask_points = mask_points[:, [1, 0]]
        mask_points[:,0] = mask_points[:,0] * img_width / 1000
        mask_points[:,1] = mask_points[:,1] * img_height / 1000
        mask_points_1 = mask_points.reshape((-1, 1, 2))
        color = (255, 255, 0)
        thickness = 2
        cv2.polylines(overlay, [mask_points_1],True, color, thickness)

    cv2.imwrite('region_of_interest_with_predicted_mask.png', overlay)

def gemini_box_to_sam3_format(box_2d: list[int]) -> list[float]:
    """
    Convert [ymin, xmin, ymax, xmax] (0-1000)
    to [center_x, center_y, width, height] (0.0-1.0)
    """
    ymin_n, xmin_n, ymax_n, xmax_n = box_2d

    # 1. Normalizing to range [0.0, 1.0]
    ymin = ymin_n / 1000.0
    xmin = xmin_n / 1000.0
    ymax = ymax_n / 1000.0
    xmax = xmax_n / 1000.0

    # 2. Calculating the width and height
    width = xmax - xmin
    height = ymax - ymin

    # 3. Calculating the center coords
    center_x = xmin + (width / 2.0)
    center_y = ymin + (height / 2.0)

    return [center_x, center_y, width, height]

def prediction_with_sam3(box_2, regionOfInterest):
    box = gemini_box_to_sam3_format(box_2)

    model = build_efficientsam3_image_model(
        checkpoint_path="efficientsam3_tinyvit.pt",
        backbone_type="tinyvit",
        model_name="11m",
        text_encoder_type="MobileCLIP-S0",
        text_encoder_context_length=16,
        load_from_HF=False,
    )

    # Process image
    processor = Sam3Processor(model)

    state = processor.set_image(regionOfInterest)
    state = processor.set_confidence_threshold(threshold=0.20, state=state)
    state = processor.add_geometric_prompt(box, True, state)
    return state

def converting_mask_to_polygon(mask):
    mask_uint8 = mask.astype(np.uint8)
    contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    crop_x_offset = 0  # Initial pixel x
    crop_y_offset = 0  # Initial pixel y

    with rasterio.open("regionOfInterest.tif") as src:
        transform_original = src.transform
        crs_original = src.crs

    transform_crop = transform_original * Affine.translation(
        crop_x_offset, crop_y_offset
    )

    polygons = []

    for contour in contours:
        if len(contour) > 3:
            points = contour.reshape(-1, 2)
            geo_points = [transform_crop * (px, py) for px, py in points]
            polygon = Polygon(geo_points)
            polygons.append(polygon)

    if len(polygons) > 0:
        gdf = gpd.GeoDataFrame(geometry=polygons, crs="EPSG:3857")
        gdf.to_file("mask.geojson", driver="GeoJSON")
        return gdf.to_json()

def googleGenAIService():
   items = call_to_google_gen_ai_service()
   if items == None:
       return
   image = cv2.imread('regionOfInterest.png')
   add_masks_to_image(image, items.boxes)
   return items

def similarRegionsService():
    items = googleGenAIService()
    regionOfInterest = Image.open("regionOfInterest.png").convert("RGB");
    final_mask = np.zeros((regionOfInterest.size[1], regionOfInterest.size[0]))
    
    for item in items.boxes:
        state = prediction_with_sam3(item.box_2d, regionOfInterest)

        # Get masks
        masks = state["masks"]
        for mask in masks:
            mask_resized = mask.reshape((mask.shape[1], mask.shape[2]))
            mask_2d = np.squeeze(np.array(mask_resized)).astype(bool)
            final_mask[mask_2d] = 255

    return converting_mask_to_polygon(final_mask)