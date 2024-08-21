import * as types from 'store/actionTypes'

const getPlayers = async (dispatch) => {
  const response = await fetch('api/players')
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

const addPlayer = (dispatch, data) => {
//logica para enviar nuevo player a la base
  dispatch({
    type: types.ADD_PLAYER,
    payload: data,
  })
}


export { getPlayers, setPlayersData, addPlayer }
