import store from "../store";
const downloadAreaPredicted = (fileName = "download.geojson") => {
  const { areaPredicted } = store.getState();

  const jsonString = JSON.stringify(areaPredicted, null, 2);
  const blob = new Blob([jsonString], { type: "application/geo+json" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".geojson")
    ? fileName
    : `${fileName}.geojson`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default downloadAreaPredicted;
