import * as types from 'store/actionTypes'

const getMatches = async (dispatch, data) => {

  const params = new URLSearchParams({
    'id': data
  });
  // console.log("los params: " + params)
  const response = await fetch(`/api/matches?${params}`)
  const json = await response.json();
  dispatch({
    type: types.SET_MATCHES_DATA,
    payload: json || [],
  })
  return json
}

const setMatchesData = (dispatch, data) => {
  dispatch({
    type: types.SET_MATCHES_DATA,
    payload: data,
  })
}

const clearMatches = (dispatch) => {
  dispatch({
    type: types.CLEAR_MATCHES_DATA
  })
}


const addMatch = async (dispatch, data) => {
  //logica para enviar nuevo match a la base
  const response = await fetch('/api/add-match', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const content = await response.json();

  dispatch({
    type: types.ADD_MATCH,
    payload: data,
  })
}


export { getMatches, setMatchesData, addMatch, clearMatches }
