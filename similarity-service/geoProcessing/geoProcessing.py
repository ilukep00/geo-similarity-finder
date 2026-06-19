import requests
import mercantile
import fiona
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJ_DIR = os.path.join(SCRIPT_DIR, "..", "venv", "Lib", "site-packages", "rasterio", "proj_data")
os.environ["PROJ_LIB"] = PROJ_DIR

# This part is necessary Because PostgreSQL added its own path to the system's global environment variables,
# rasterio gets confused and looks in your PostgreSQL folder instead of its own.

import rasterio
import rasterio.plot
import rasterio.mask
from rasterio.transform import from_bounds
from rasterio.merge import merge


def mergeTilesIntoASingleTif(tiles):
    i = 0
    image_rasters = []
    for tile in tiles:
        i += 1
        x = tile.x
        y = tile.y
        z = tile.z
        url = "https://www.google.cn/maps/vt?lyrs=s@189&gl=cr&x=" + str(x) + "&y=" + str(y) + "&z=" + str(z)
        response = requests.get(url)
        bounds = mercantile.bounds(x, y, z)
        with rasterio.MemoryFile(response.content) as memfile:
            with memfile.open() as img:
                img_transform = from_bounds(bounds.west, bounds.south, bounds.east, bounds.north, width=img.width,
                                            height=img.height)
                name = "response_" + str(i) + ".tif"
                img_tif = rasterio.MemoryFile().open(
                    driver="GTiff",
                    height=img.height,
                    width=img.width,
                    count=img.count,
                    crs="EPSG:3857",
                    dtype=img.dtypes[0],
                    transform=img_transform,
                )
                img_tif.write(img.read())
                image_rasters.append(img_tif)

    image_merged, transform_merged = merge(image_rasters)
    raster_merged = rasterio.MemoryFile().open(
            driver="GTiff",
            height=image_merged.shape[1],
            width=image_merged.shape[2],
            count=image_rasters[0].count,
            crs="EPSG:3857",
            dtype='uint8',
            transform=transform_merged,
        )
    raster_merged.write(image_merged)
    for image_raster in image_rasters:
        image_raster.close()
    return raster_merged

def getGeoJSONRasterRegion(raster_tif, geoJSON):
    with fiona.open(geoJSON, "r") as f:
        shapes = [feature["geometry"] for feature in f]

    out_image, out_transform = rasterio.mask.mask(raster_tif, shapes, crop=True)

    out_meta = raster_tif.meta
    out_meta.update(
        {
            "driver": "GTiff",
            "height": out_image.shape[1],
            "width": out_image.shape[2],
            "transform": out_transform,
        }
    )
    with rasterio.open("geoJSON_img.tif", "w", **out_meta) as dst:
        dst.write(out_image)

def geoProcessGeoJSONSend(region):
    geoJSON = region.r_geometry
    tiles = region.r_tilesCoords
    raster_merged = mergeTilesIntoASingleTif(tiles)
    getGeoJSONRasterRegion(raster_merged, geoJSON)
