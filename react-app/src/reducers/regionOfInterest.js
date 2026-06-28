import { REGIONOFINTERESTADDED } from "../actions/actionTypes";

const initialState = false;

const regionOfInterest = (state = initialState, action) => {
  switch (action.type) {
    case REGIONOFINTERESTADDED:
      return action.payload;
    default:
      return state;
  }
};

export default regionOfInterest;
