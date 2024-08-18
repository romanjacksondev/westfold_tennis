import * as types from 'store/actionTypes'

export const adminReducer = (state, action) => {
  const reducers = {
    [types.SET_ADMIN_LOANS]: () => ({
      ...state,
      admin: {
        ...state.admin,
        loans: action.payload,
      },
    }),
  }
  return reducers[action.type] ? reducers[action.type]() : state
}
