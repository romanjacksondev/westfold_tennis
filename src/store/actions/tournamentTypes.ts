import * as types from 'store/actionTypes'

const getTournamentTypes = async (dispatch) => {
  const response = await fetch('/api/tournamentTypes')
  const json = await response.json();
console.log(json)
  dispatch({
    type: types.SET_TOURNAMENT_TYPES_DATA,
    payload: json || [],
  })
  
  return json
}

export { getTournamentTypes }
