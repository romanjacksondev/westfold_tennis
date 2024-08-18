import * as types from '../actionTypes'
// import { getUserAttributes } from 'lib/utils/helpers'

export const userReducer = (state, action) => {
  const reducers = {
    [types.CLEAR_USER_DATA]: () => ({
      ...state,
      user: {},
    }),
    [types.SET_USER_DATA]: () => ({
      ...state,
      user: {
        ...state.user,
        attributes: {
          ...state.user.attributes,
          ...state,   //revisar 
        },
        session: action.payload.session,
      },
    }),
  }
  return reducers[action.type] ? reducers[action.type]() : state
}
