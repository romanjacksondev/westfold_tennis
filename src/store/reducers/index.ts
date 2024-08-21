import { tournamentReducer } from './tournament'
import { playerReducer } from './player'
import { venueReducer } from './venue'

const reduceReducers = (...reducers) => {
  return (state, action) =>
    reducers.reduce((acc, nextReducer) => nextReducer(acc, action), state)
}

export const rootReducer = reduceReducers(
  tournamentReducer,
  playerReducer,
  venueReducer
)
