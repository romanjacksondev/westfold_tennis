import * as types from 'store/actionTypes'

const getTournaments = async (dispatch) => {
  const response = await fetch('api/tournaments')
  const json = await response.json();

console.log("ACAAAAA")

  dispatch({
    type: types.SET_TOURNAMENTS_DATA,
    payload: json || [],
  })
}

const setTournamentData = (dispatch, data) => {
  dispatch({
    type: types.SET_TOURNAMENTS_DATA,
    payload: data,
  })
}

const addTournament = (dispatch, data) => {

//logica para enviar nuevo torneo a la base

  dispatch({
    type: types.ADD_TOURNAMENT_DATA,
    payload: data,
  })
}


export { setTournamentData, getTournaments, addTournament }
