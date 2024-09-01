import * as types from "../actionTypes";

export const tournamentTypesReducer = (state, action) => {
  const reducers = {
    [types.SET_TOURNAMENT_TYPES_DATA]: () => ({
      ...state,
      tournamentTypes: action.payload,
    })
  };
  return reducers[action.type] ? reducers[action.type]() : state;
};
