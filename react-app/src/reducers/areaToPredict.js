import { AREATOPREDICTADDED } from "../actions/actionTypes";

const initialState = false;

const areaToPredict = (state = initialState, action) => {
  switch (action.type) {
    case AREATOPREDICTADDED:
      return action.payload;
    default:
      return state;
  }
};

export default areaToPredict;
