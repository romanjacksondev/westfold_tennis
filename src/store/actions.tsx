import { useAppContext } from 'store'
import * as actions from './actions/index'

const useActions = () => {
  const { dispatch } = useAppContext()
  
  // Tournament data
  const getTournaments = async () => actions.getTournaments(dispatch) 
  const setTournamentData = (payload) => actions.setTournamentData(dispatch, payload)
  const clearTournamentData = () => actions.clearTournamentData(dispatch)

  return {
    setTournamentData,
    clearTournamentData,
    getTournaments
  }
}

export { useActions }
