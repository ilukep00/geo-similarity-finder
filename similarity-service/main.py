from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from geoProcessing.geoProcessing import geoProcessGeoJSONSend
from similarRegionsService.similarRegionsService import similarRegionsService


class TileCoords(BaseModel):
    x: int
    y: int
    z: int
class Region(BaseModel):
    r_geometry: str
    r_tilesCoords:  List[TileCoords]
    r_fileName: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/geoProcessSelectedRegion/")
async def geo_process_selected_region(item: Region):
    print(item.r_geometry)
    print(item.r_tilesCoords)
    print(item.r_fileName)
    geoProcessGeoJSONSend(item)

@app.post("/findSimilarRegions/")
async def find_similar_regions():
    similarRegionsService()
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)