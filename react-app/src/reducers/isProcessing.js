import { ISPROCESSING } from "../actions/actionTypes";

const initialState = false

const isProcessing = (state = initialState, action) => {
  switch (action.type) {
    case ISPROCESSING:
      return action.payload;
    default:
      return state;
  }
};

export default isProcessing;