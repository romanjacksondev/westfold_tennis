import { useAppContext } from 'store'

const useSelectors = () => {
  const { state } = useAppContext()

  return {
    //State
    state: state,
    // Config
    config: state.config,
    // Error
    error: state.error,
    // User
    user: state.user.attributes,
    session: state.user.session,
    // Admin
    loanList: state.admin.loans,
  }
}

export { useSelectors }
