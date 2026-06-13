import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

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

async function findSimilarRegions(regionJSON) {
  const queryBody = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      r_geometry: JSON.stringify(regionJSON),
    }),
  };

  const response = await fetch(
    "http://127.0.0.1:8000/findSimilarRegions/",
    queryBody,
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  });
}

function manageDrawControl(map) {
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
    const { layer } = e;
    const layerJSON = layer.toGeoJSON();

    await findSimilarRegions(layerJSON);

    drawnItems.addLayer(layer);
  });
}

export default manageDrawControl;

/*

*/
