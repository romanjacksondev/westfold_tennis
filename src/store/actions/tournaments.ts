import * as types from 'store/actionTypes'

const getTournaments = async (dispatch) => {
  const response = await fetch('api/tournaments')
  const json = await response.json();

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

const addTournament = async (dispatch, data) => {
  // console.log("en el action data: " + JSON.stringify(data));

  const response = await fetch('api/add-tournaments', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const content = await response.json();

  // console.log(content);

  dispatch({
    type: types.ADD_TOURNAMENT_DATA,
    payload: data,
  })
}


export { setTournamentData, getTournaments, addTournament }
