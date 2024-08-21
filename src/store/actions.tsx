import { useAppContext } from 'store'
import * as actions from './actions/index'

const useActions = () => {
  const { dispatch } = useAppContext()
  
  // Tournament data
  const getTournaments = async () => actions.getTournaments(dispatch) 
  const setTournamentData = (payload) => actions.setTournamentData(dispatch, payload)
  const addTournament = async (payload) => actions.addTournament(dispatch, payload)

  //Player data
  const getPlayers = async () => actions.getPlayers(dispatch)
  const addPlayer = (payload) => actions.addPlayer(dispatch, payload)

  //Player data
  const getVenues = async () => actions.getVenues(dispatch)
  const addVenue = (payload) => actions.addVenue(dispatch, payload)

  return {
    setTournamentData,
    getTournaments,
    addTournament,
    getPlayers,
    addPlayer,
    getVenues,
    addVenue
  }
}

export { useActions }
