import { STEPGEOMETRIESMANAGMENT} from "../actions/actionTypes";
import L from "leaflet";

const initialState = [null, null];

const stepGeometries = (state = initialState, action) => {
  switch (action.type) {
    case STEPGEOMETRIESMANAGMENT:
      const payload = action.payload;
      state[payload.step] = payload.layerJSON;
      return state;
    default:
      return state;
  }
};

export default stepGeometries;
