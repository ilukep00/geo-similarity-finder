from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List


class TileCoords(BaseModel):
    x: int
    y: int
    z: int
class Region(BaseModel):
    r_geometry: str
    r_tilesCoords:  List[TileCoords]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/findSimilarRegions/")
async def find_similar_regions(item: Region):
    print(item.r_geometry)
    print(item.r_tilesCoords)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)