import * as types from "../actionTypes";

export const tournamentReducer = (state, action) => {
  const reducers = {
    [types.SET_TOURNAMENTS_DATA]: () => ({
      ...state,
      tournaments: action.payload,
    }),
    [types.ADD_TOURNAMENT_DATA]: () => ({
      ...state,
      tournaments: state.tournaments.concat(action.payload),
    }),
  };
  return reducers[action.type] ? reducers[action.type]() : state;
};
