import { useAppContext } from 'store'
import * as actions from './actions/index'

const useActions = () => {
  const { dispatch } = useAppContext()

  // Tournament data
  const getTournaments = async () => actions.getTournaments(dispatch)
  const setTournamentData = (payload) => actions.setTournamentData(dispatch, payload)
  const addTournament = async (payload, extraData) => actions.addTournament(dispatch, payload, extraData)

  //Player data
  const getPlayers = async () => actions.getPlayers(dispatch)
  const addPlayer = async (payload) => actions.addPlayer(dispatch, payload)

  //Venue data
  const getVenues = async () => actions.getVenues(dispatch)
  const addVenue = async (payload) => actions.addVenue(dispatch, payload)

  //Match data
  const getMatches = async (payload) => actions.getMatches(dispatch, payload)
  const addMatch = async (payload) => actions.addMatch(dispatch, payload)
  const clearMatches = async () => actions.clearMatches(dispatch)

  //Leaderboard Data
  const getLeaderboard = async () => actions.getLeaderboard(dispatch)

  //Tournament Types
  const getTournamentTypes = async () => actions.getTournamentTypes(dispatch)


  return {
    setTournamentData,
    getTournaments,
    addTournament,
    getPlayers,
    addPlayer,
    getVenues,
    addVenue,
    getMatches,
    addMatch,
    clearMatches,
    getLeaderboard,
    getTournamentTypes
  }
}

export { useActions }
