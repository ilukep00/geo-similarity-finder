import L from "leaflet";

function addDrawControl(map) {
  var drawControl = L.Control.extend({
    onAdd: function (map) {
      var container = L.DomUtil.create("div","draw-control");
      L.DomUtil.create("i","fa-regular fa-square",container);

      return container;
    },
    onRemove: function (map) {},
  });

  new drawControl({
      position: "topleft",
    }).addTo(map);
}

export default addDrawControl;
