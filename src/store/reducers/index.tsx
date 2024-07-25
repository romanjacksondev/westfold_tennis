import { tournamentReducer } from './tournament'


const reduceReducer = ( ...reducers ) => {
    return (state, action) => reducers.reduce((acc, nextReducer) => nextReducer(acc, action), state)
}

export const rootReducer = reduceReducer(
    tournamentReducer
)
