import { useAppContext } from 'store'
import * as actions from './actions/index'

const useActions = () => {
  const { dispatch } = useAppContext()
  // Tournament data
  const setTournamentData = (payload) => actions.setTournamentData(dispatch, payload)
  const clearTournamentData = () => actions.clearTournamentData(dispatch)

  return {
    setTournamentData,
    clearTournamentData
  }
}

export { useActions }
