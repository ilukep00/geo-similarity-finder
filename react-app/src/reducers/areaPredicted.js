import { STOREPREDICTION } from "../actions/actionTypes";

const initialState = {};

const areaPredicted = (state = initialState, action) => {
  switch (action.type) {
    case STOREPREDICTION:
      return action.payload;
    default:
      return state;
  }
};

export default areaPredicted;
