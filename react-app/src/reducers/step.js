const initialState = {
    step: 1
}

const step = (state = initialState, action) => {
  switch (action.type) {
    case "NEXT":
      return {
        ...state,
        step: state.step + 1,
      };
    case "BACK":
      return {
        ...state,
        step: state.step - 1,
      };

    default:
      return state;
  }
};

export default step;
