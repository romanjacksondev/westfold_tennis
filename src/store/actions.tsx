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
  const addPlayer = async (payload) => actions.addPlayer(dispatch, payload)

  //Venue data
  const getVenues = async () => actions.getVenues(dispatch)
  const addVenue = async (payload) => actions.addVenue(dispatch, payload)

  //Match data
  const getMatches = async (payload) => actions.getMatches(dispatch, payload)
  const addMatch = async (payload) => actions.addMatch(dispatch, payload)
  const clearMatches = async () => actions.clearMatches(dispatch)

  //Leaderboard Data
  const getLeaderboard = async (rankingMode) => actions.getLeaderboard(rankingMode)

  //Tournament Types
  const getTournamentCategories = async () => actions.getTournamentCategories(dispatch)

  //Surface data
  const getSurfaces = async () => actions.getSurfaces(dispatch)

  //User data
  const clearUserData = () => actions.clearUserData(dispatch)
  const setUserData = (payload) => actions.setUserData(dispatch, payload)

  //Player Stats
  const getPlayerStats = async (payload) => actions.getPlayerStats(payload)

  //General Stats
  const getGeneralStats = async () => actions.getGeneralStats()

    //Match history Stats
    const getMatchHistory = async (payload) => actions.getMatchHistory(payload)
  
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
    getTournamentCategories,
    getSurfaces,
    clearUserData,
    setUserData,
    getPlayerStats,
    getGeneralStats,
    getMatchHistory
  }
}

export { useActions }
