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
    players: state.players,
    venues: state.venues,
    matches: state.matches,
    tournamentCategories: state.tournamentCategories,
    surfaces: state.surfaces
  }
}

export { useSelectors }
