import { useAppContext } from 'store'

const useSelectors = () => {
  const { state } = useAppContext()

  return {
    //State
    state: state,
    // Config
    config: state.config,
    // Tournament
    tournaments: state.tournaments,
    players: state.players
  }
}

export { useSelectors }
