import * as types from 'store/actionTypes'
import * as api from 'lib/services/api'

export const getLoans = async (dispatch) => {
  const payload = await api.fetchLoans()

  dispatch({
    type: types.SET_ADMIN_LOANS,
    payload: payload.loans || [],
  })
}
