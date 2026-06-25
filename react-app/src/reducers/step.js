import { BACK, NEXT } from "../actions/actionTypes";

const initialState = 1

const step = (stateStep = initialState, action) => {
  switch (action.type) {
    case NEXT:
      return stateStep + 1;

    case BACK:
      return stateStep - 1;

    default:
      return stateStep;
  }
};

export default step;
