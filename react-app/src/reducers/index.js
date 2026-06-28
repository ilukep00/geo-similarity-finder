import step from "./step";
import areaToPredict from "./areaToPredict";
import regionOfInterest from "./regionOfInterest";
import isProcessing from "./isProcessing";
import { combineReducers } from "redux";

const reducers = combineReducers({
  step,
  areaToPredict,
  regionOfInterest,
  isProcessing
});

export default reducers;
