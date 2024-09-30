import * as types from 'store/actionTypes'

const getTournaments = async (dispatch) => {
  const response = await fetch('api/tournaments')
  const json = await response.json();

  dispatch({
    type: types.SET_TOURNAMENTS_DATA,
    payload: json || [],
  })

  return json
}

const setTournamentData = (dispatch, data) => {
  dispatch({
    type: types.SET_TOURNAMENTS_DATA,
    payload: data,
  })
}

const addTournament = async (dispatch, payload) => {
  
  const response = await fetch('/api/add-tournament', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const json = await response.json();
  payload.id = json.id

  dispatch({
    type: types.ADD_TOURNAMENT_DATA,
    payload: payload,
  })

  return json;
}



export { setTournamentData, getTournaments, addTournament }
