import step from "./step";
import areaToPredict from "./areaToPredict";
import { combineReducers } from 'redux'

const reducers = combineReducers({
  step,
  areaToPredict
})

export default reducers
