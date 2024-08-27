import * as types from "../actionTypes";

export const matchReducer = (state, action) => {
  const reducers = {
    [types.SET_MATCHES_DATA]: () => ({
      ...state,
      matches: action.payload,
    }),
    [types.ADD_MATCH]: () => ({
      ...state,
      matches: state.matches.concat(action.payload),
    }),

    [types.CLEAR_MATCHES_DATA]: () => ({
      ...state,
      matches: [],
    }),
  };
  return reducers[action.type] ? reducers[action.type]() : state;
};
