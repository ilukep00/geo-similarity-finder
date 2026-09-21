import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import store from "../store";
import callToService from "../utils/utilityMethods";

const GOOGLE_MAPS_URL =
  "https://www.google.cn/maps/vt?lyrs=s@189&gl=cr&x={x}&y={y}&z={z}";
const GEOPROCESS_SELECTED_REGION_URL =
  "http://127.0.0.1:8000/geoProcessSelectedRegion/";

// Method for converting (x, y, z) in a tile L.latLngBounds
function getTileLatLngBounds(x, y, z) {
  // number of tiles
  const tileCount = Math.pow(2, z);

  // west border
  const lng1 = (x / tileCount) * 360 - 180;
  // east border
  const lng2 = ((x + 1) / tileCount) * 360 - 180;

  // south border
  const lat1Rad = Math.atan(
    Math.sinh(Math.PI * (1 - (2 * (y + 1)) / tileCount)),
  );
  // northern border
  const lat2Rad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / tileCount)));

  // degrees conversion
  const lat1 = (lat1Rad * 180) / Math.PI;
  const lat2 = (lat2Rad * 180) / Math.PI;

  return L.latLngBounds([lat1, lng1], [lat2, lng2]);
}

function prepareTilesCoordinates(layers, drawnLayer) {
  const baseLayerKey = Object.keys(layers).find((layerKey) => {
    return layers[layerKey]._url === GOOGLE_MAPS_URL;
  });

  if (!baseLayerKey) return [];

  const baseLayerTiles = layers[baseLayerKey]._tiles;
  const geometryBounds = drawnLayer.getBounds();

  const filteredTiles = [];

  Object.keys(baseLayerTiles).forEach((baseLayerTileKey) => {
    const tile = baseLayerTiles[baseLayerTileKey];
    const tileBounds = getTileLatLngBounds(tile.coords.x, tile.coords.y, tile.coords.z);

    if (geometryBounds.intersects(tileBounds)) {
      filteredTiles.push({
        x: tile.coords.x,
        y: tile.coords.y,
        z: tile.coords.z,
      });
    }
  });

  return filteredTiles;
}
async function processGeometry(regionJSON, tilesCoords, fileName) {
  const body = JSON.stringify({
    r_geometry: JSON.stringify(regionJSON),
    r_tilesCoords: tilesCoords,
    r_fileName: fileName,
  });
  const response = await callToService(GEOPROCESS_SELECTED_REGION_URL, body);
  return response;
}

function manageDrawControl(
  map,
  drawnItems,
  updateAreaToPredict,
  updateRegionOfInterest,
  updateIsProcessing,
  updateStepGeometries,
) {
  map.on(L.Draw.Event.CREATED, async function (e) {
    const state = store.getState();
    const { layer, target = { _layers: {} } } = e;
    const layerJSON = layer.toGeoJSON();
    const tilesCoords = prepareTilesCoordinates(target._layers, layer);

    updateIsProcessing(true);
    const result = await processGeometry(
      layerJSON,
      tilesCoords,
      state.step === 1 ? "regionToPredict" : "regionOfInterest",
    );
    updateIsProcessing(false);

    if (result === false) {
      console.log("error");
      return;
    }
    drawnItems.clearLayers();
    drawnItems.addLayer(layer);
    updateStepGeometries(state.step - 1, layerJSON);
    if (state.step === 1) {
      updateAreaToPredict(true);
    }
    if (state.step === 2) {
      updateRegionOfInterest(true);
    }
  });

  map.on(L.Draw.Event.DELETED, async function (e) {
    const state = store.getState();
    if (state.step === 1) {
      updateAreaToPredict(false);
    }
    if (state.step === 2) {
      updateRegionOfInterest(false);
    }
    updateStepGeometries(state.step - 1, null);
  });
}

export default manageDrawControl;
