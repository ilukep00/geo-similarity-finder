import step from "./step";
import areaToPredict from "./areaToPredict";
import regionOfInterest from "./regionOfInterest";
import isProcessing from "./isProcessing";
import { combineReducers } from "redux";
import stepGeometries from "./stepGeometries";
import areaPredicted from "./areaPredicted";

const reducers = combineReducers({
  step,
  areaToPredict,
  regionOfInterest,
  isProcessing,
  stepGeometries,
  areaPredicted,
});

export default reducers;
