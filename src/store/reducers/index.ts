import { tournamentReducer } from './tournament'
import { playerReducer } from './player'
import { venueReducer } from './venue'
import { matchReducer } from './match'
import { tournamentTypesReducer } from './tournamentTypes'

const reduceReducers = (...reducers) => {
  return (state, action) =>
    reducers.reduce((acc, nextReducer) => nextReducer(acc, action), state)
}

export const rootReducer = reduceReducers(
  tournamentReducer,
  playerReducer,
  venueReducer,
  matchReducer,
  tournamentTypesReducer
)
