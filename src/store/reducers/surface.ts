import * as types from "../actionTypes";

export const surfaceReducer = (state, action) => {
  const reducers = {
    [types.SET_SURFACES_DATA]: () => ({
      ...state,
      surfaces: action.payload,
    })
  };
  return reducers[action.type] ? reducers[action.type]() : state;
};
