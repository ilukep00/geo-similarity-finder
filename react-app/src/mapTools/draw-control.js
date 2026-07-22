import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import store from "../store";
import callToService from "../utils/utilityMethods";

const GOOGLE_MAPS_URL =
  "https://www.google.cn/maps/vt?lyrs=s@189&gl=cr&x={x}&y={y}&z={z}";
const GEOPROCESS_SELECTED_REGION_URL =
  "http://127.0.0.1:8000/geoProcessSelectedRegion/";

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
  updateAreaToPredict,
  updateRegionOfInterest,
  updateIsProcessing,
) {
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
    const state = store.getState();
    const { layer, target = { _layers: {} } } = e;
    const layerJSON = layer.toGeoJSON();
    const tilesCoords = prepareTilesCoordinates(target._layers);

    updateIsProcessing(true);
    const result = await processGeometry(
      layerJSON,
      tilesCoords,
      state.step === 1 ? "regionToPredict" : "regionOfInterest",
    );
    updateIsProcessing(false);

    if (!result) {
      console.log("error");
      return;
    }
    drawnItems.addLayer(layer);
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
  });
}

export default manageDrawControl;
