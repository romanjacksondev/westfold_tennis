import * as types from 'store/actionTypes'

export const setError = async (dispatch, error) => {
  dispatch({
    type: types.SET_ERROR,
    payload: error,
  })
}
