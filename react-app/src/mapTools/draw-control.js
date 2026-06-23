import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

const GOOGLE_MAPS_URL =
  "https://www.google.cn/maps/vt?lyrs=s@189&gl=cr&x={x}&y={y}&z={z}";
const FIND_SIMILAR_REGIONS_URL = "http://127.0.0.1:8000/findSimilarRegions/";

const DRAW_VECTORTYPES_SETTINGS = {
  polyline: false,
  polygon: {
    shapeOptions: {
      color: "#bada55",
    },
  },
  circle: false,
  rectangle: false,
  marker: false,
  circlemarker: false,
};

function prepareTilesCoordinates(layers) {
  const baseLayerKey = Object.keys(layers).find((layerKey) => {
    return layers[layerKey]._url === GOOGLE_MAPS_URL;
  });

  const baseLayerTiles = layers[baseLayerKey]._tiles;

  const tilesCoords = Object.keys(baseLayerTiles).map((baseLayerTileKey) => {
    const baseLayerTile = baseLayerTiles[baseLayerTileKey];
    return {
      x: baseLayerTile.coords.x,
      y: baseLayerTile.coords.y,
      z: baseLayerTile.coords.z,
    };
  });

  return tilesCoords;
}
async function findSimilarRegions(regionJSON, tilesCoords) {
  const queryBody = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      r_geometry: JSON.stringify(regionJSON),
      r_tilesCoords: tilesCoords,
    }),
  };

  const response = await fetch(FIND_SIMILAR_REGIONS_URL, queryBody).then(
    (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    },
  );
}

function manageDrawControl(map, step) {
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  const drawControlOptions = {
    position: "topleft",
    draw: {
      ...DRAW_VECTORTYPES_SETTINGS,
    },
    edit: {
      featureGroup: drawnItems,
    },
  };
  var drawControl = new L.Control.Draw(drawControlOptions);
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, async function (e) {
    const { layer, target = { _layers: {} } } = e;
    const layerJSON = layer.toGeoJSON();
    const tilesCoords = prepareTilesCoordinates(target._layers);
    drawnItems.addLayer(layer);
    await findSimilarRegions(layerJSON, tilesCoords);
  });
}

export default manageDrawControl;
