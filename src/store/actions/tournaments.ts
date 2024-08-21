import * as types from 'store/actionTypes'

const getTournaments = async (dispatch) => {

  // const payload = await api.fetchTournaments()
const response = await fetch('api/tournaments')
const json = await response.json();
    console.log(json);
// debugger
  dispatch({
    type: types.SET_TOURNAMENT_DATA,
    payload: json || [],
  })
}

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

export { setTournamentData, clearTournamentData, getTournaments }
