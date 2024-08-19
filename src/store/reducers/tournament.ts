import * as types from "../actionTypes";

export const tournamentReducer = (state, action) => {
  const reducers = {
    [types.CLEAR_TOURNAMENT_DATA]: () => ({
      ...state,
      tournaments: [],
    }),
    [types.SET_TOURNAMENT_DATA]: () => ({
      ...state,
      tournaments: [...state.tournaments, action.payload],
    }),
  };
  return reducers[action.type] ? reducers[action.type]() : state;
};
