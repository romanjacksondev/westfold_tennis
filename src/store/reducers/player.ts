import * as types from "../actionTypes";

export const playerReducer = (state, action) => {
  const reducers = {
    [types.SET_PLAYERS_DATA]: () => ({
      ...state,
      players: action.payload,
    }),
    [types.ADD_PLAYER]: () => ({
      ...state,
      players: state.players.concat(action.payload),
    }),
  };
  return reducers[action.type] ? reducers[action.type]() : state;
};
