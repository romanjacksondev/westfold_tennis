import * as types from 'store/actionTypes'

const setTournamentData = (dispatch, data) => {
  dispatch({
    type: types.SET_TOURNAMENT_DATA,
    payload: data,
  })
}

const clearTournamentData = (dispatch) => {
  dispatch({
    type: types.CLEAR_TOURNAMENT_DATA,
  })
}

export { setTournamentData, clearTournamentData }
