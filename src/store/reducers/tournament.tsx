export const tournamentReducer = (state, action) => {


const reducers = {
    [ 'ADD_TOURNAMENT']: () => ({
        ...state,
        tournament: {}
    })
}
return reducers[action.type] ? reducers[action.type]() : state
} 
