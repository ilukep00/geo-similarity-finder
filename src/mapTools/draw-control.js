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

function manageDrawControl(map) {
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  const drawControlOptions = {
    position: "topleft",
    draw: {
      DRAW_VECTORTYPES_SETTINGS,
    },
    edit: {
      featureGroup: drawnItems,
    },
  };
  var drawControl = new L.Control.Draw(drawControlOptions);
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
      layer = e.layer;

    if (type === "marker") {
      layer.bindPopup("A popup!");
    }

    drawnItems.addLayer(layer);
  });
}

export default manageDrawControl;
