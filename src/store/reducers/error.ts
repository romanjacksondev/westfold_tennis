import * as types from 'store/actionTypes'

export const errorReducer = (state, action) => {
  const reducers = {
    [types.SET_ERROR]: () => ({
      ...state,
      error: action.payload,
    }),
  }
  return reducers[action.type] ? reducers[action.type]() : state
}
