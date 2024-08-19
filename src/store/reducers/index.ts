// import { errorReducer } from './error'
import { tournamentReducer } from './tournament'
// import { adminReducer } from './admin'

const reduceReducers = (...reducers) => {
  return (state, action) =>
    reducers.reduce((acc, nextReducer) => nextReducer(acc, action), state)
}

export const rootReducer = reduceReducers(
  tournamentReducer,
  // errorReducer,
  // adminReducer
)
