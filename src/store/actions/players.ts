import * as types from 'store/actionTypes'

const getPlayers = async (dispatch) => {
  const response = await fetch('/api/players')
  const json = await response.json();
  dispatch({
    type: types.SET_PLAYERS_DATA,
    payload: json || [],
  })
}

const setPlayersData = (dispatch, data) => {
  dispatch({
    type: types.SET_PLAYERS_DATA,
    payload: data,
  })
}

const addPlayer = async (dispatch, data) => {
  //logica para enviar nuevo player a la base
  const response = await fetch('/api/add-player', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const content = await response.json();


  dispatch({
    type: types.ADD_PLAYER,
    payload: data,
  })
}


export { getPlayers, setPlayersData, addPlayer }
