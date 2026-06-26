import step from "./step";
import areaToPredict from "./areaToPredict";
import regionOfInterest from "./regionOfInterest";
import { combineReducers } from 'redux'

const reducers = combineReducers({
  step,
  areaToPredict,
regionOfInterest
})

export default reducers
