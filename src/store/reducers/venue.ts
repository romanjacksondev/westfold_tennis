import * as types from "../actionTypes";

export const venueReducer = (state, action) => {
  const reducers = {
    [types.SET_VENUES_DATA]: () => ({
      ...state,
      venues: action.payload,
    }),
    [types.ADD_VENUE]: () => ({
      ...state,
      venues: state.venues.concat(action.payload),
    }),
  };
  return reducers[action.type] ? reducers[action.type]() : state;
};
