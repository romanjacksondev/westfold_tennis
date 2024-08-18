import { useAppContext } from 'store'
import * as actions from './actions/index'

const useActions = () => {
  const { dispatch } = useAppContext()

  // User data
  const setUserData = (payload) => actions.setUserData(dispatch, payload)
  const clearUserData = () => actions.clearUserData(dispatch)

  // Errors
  const setError = async (error) => actions.setError(dispatch, error)

  // Admin
  const getLoans = () => actions.getLoans(dispatch)

  return {
    setUserData,
    clearUserData,
    setError,
    getLoans,
  }
}

export { useActions }
