import * as types from 'store/actionTypes'

const getVenues = async (dispatch) => {
  const response = await fetch('api/venues')
  const json = await response.json();
  dispatch({
    type: types.SET_VENUES_DATA,
    payload: json || [],
  })
}

const setVenuesData = (dispatch, data) => {
  dispatch({
    type: types.SET_VENUES_DATA,
    payload: data,
  })
}

const addVenue = (dispatch, data) => {
//logica para enviar nuevo venue a la base
  dispatch({
    type: types.ADD_VENUE,
    payload: data,
  })
}


export { getVenues, setVenuesData, addVenue }
