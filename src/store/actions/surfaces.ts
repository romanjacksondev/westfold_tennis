import * as types from 'store/actionTypes'

const getSurfaces = async (dispatch) => {
  const response = await fetch('/api/surfaces')
  const json = await response.json();
  dispatch({
    type: types.SET_SURFACES_DATA,
    payload: json || [],
  })
}

const setSurfacesData = (dispatch, data) => {
  dispatch({
    type: types.SET_SURFACES_DATA,
    payload: data,
  })
}

export { getSurfaces, setSurfacesData }
