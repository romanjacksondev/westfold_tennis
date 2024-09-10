import * as types from "../actionTypes";

export const userReducer = (state, action) => {
  const reducers = {
    [types.SET_USER_DATA]: () => ({
      ...state,
      user: {
        session: action.payload
      }
    }),
    [types.CLEAR_USER_DATA]: () => ({
      ...state,
      user: {}
    }),
  };
  return reducers[action.type] ? reducers[action.type]() : state;
};
