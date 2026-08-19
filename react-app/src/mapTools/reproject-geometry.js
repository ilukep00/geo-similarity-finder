import proj4 from "proj4";

const reprojectGeometry = (geometry) => {
  const transformCoords = (coords) => {
    if (typeof coords[0] === "number") {
      return proj4("EPSG:3857", "EPSG:4326", coords);
    }
    return coords.map(transformCoords);
  };

  return {
    ...geometry,
    coordinates: transformCoords(geometry.coordinates),
  };
};

export default reprojectGeometry
