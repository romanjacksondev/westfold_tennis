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

const addVenue = async (dispatch, data) => {
  //logica para enviar nuevo venue a la base
  const response = await fetch('api/add-venue', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const content = await response.json();

  dispatch({
    type: types.ADD_VENUE,
    payload: data,
  })
}


export { getVenues, setVenuesData, addVenue }
