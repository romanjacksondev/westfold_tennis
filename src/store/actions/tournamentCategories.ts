import * as types from 'store/actionTypes'

const getTournamentCategories = async (dispatch) => {
  const response = await fetch('/api/tournamentCategories')
  const json = await response.json();
  dispatch({
    type: types.SET_TOURNAMENT_CATEGORIES_DATA,
    payload: json || [],
  })
  
  return json
}

export { getTournamentCategories }
