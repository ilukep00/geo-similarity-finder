from google import genai
from pydantic import BaseModel, Field
from typing import List
import cv2
import numpy as np
import os 

gemini_api_key = os.getenv("GEMINI_API_KEY", "your_api_key")
class BoundingBox(BaseModel):
    box_2d: List[int] = Field(description="The 2D bounding box of the item as [ymin, xmin, ymax, xmax] normalized to 0-1000.")
    mask: List[List[int]] = Field(description="The segmentation mask of the item as a polygon of [x,y] coordinates, normalized to 0-1000.")
    label: str = Field(description="A descriptive label for the item.")

class BoundingBoxes(BaseModel):
    boxes: List[BoundingBox]


def call_to_google_gen_ai_service():
    client = genai.Client(api_key=gemini_api_key)

    region_of_interest = client.files.upload(file="regionOfInterest.png")
    region_to_predict = client.files.upload(file="regionToPredict.png")

    interaction = client.interactions.create(
        model="gemini-3.5-flash",
        input=[
            {"type": "text", "text": "Given the first image, can you detect the parts of that image that are similar to the second part? The return object should be the box_2d should be [ymin, xmin, ymax, xmax] normalized to 0-1000."},
            {
                "type": "image",
                "uri": region_of_interest.uri,
                "mime_type": region_of_interest.mime_type
            },
            {
                "type": "image",
                "uri": region_to_predict.uri,
                "mime_type": region_to_predict.mime_type
            }
        ],
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": BoundingBoxes.model_json_schema()
        }
    )

    items = BoundingBoxes.model_validate_json(interaction.output_text)
    return items

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



def googleGenAIService():
   items = call_to_google_gen_ai_service()
   image = cv2.imread('regionOfInterest.png')
   add_masks_to_image(image, items.boxes)

def similarRegionsService():
    googleGenAIService()