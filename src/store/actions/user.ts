import * as types from 'store/actionTypes'

const setUserData = (dispatch, data) => {
  dispatch({
    type: types.SET_USER_DATA,
    payload: data,
  })
}

const clearUserData = (dispatch) => {
  dispatch({
    type: types.CLEAR_USER_DATA,
  })
}

export { setUserData, clearUserData }
