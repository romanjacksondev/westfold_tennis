import { errorReducer } from './error'
import { userReducer } from './user'
import { adminReducer } from './admin'

const reduceReducers = (...reducers) => {
  return (state, action) =>
    reducers.reduce((acc, nextReducer) => nextReducer(acc, action), state)
}

export const rootReducer = reduceReducers(
  userReducer,
  errorReducer,
  adminReducer
)
