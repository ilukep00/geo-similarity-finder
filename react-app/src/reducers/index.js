import step from "./step";
import areaToPredict from "./areaToPredict";
import regionOfInterest from "./regionOfInterest";
import isProcessing from "./isProcessing";
import { combineReducers } from "redux";
import stepGeometries from "./stepGeometries";

const reducers = combineReducers({
  step,
  areaToPredict,
  regionOfInterest,
  isProcessing,
  stepGeometries
});

export default reducers;
