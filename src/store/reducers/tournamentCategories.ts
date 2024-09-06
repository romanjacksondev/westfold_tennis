import * as types from "../actionTypes";

export const tournamentCategoriesReducer = (state, action) => {
  const reducers = {
    [types.SET_TOURNAMENT_CATEGORIES_DATA]: () => ({
      ...state,
      tournamentCategories: action.payload,
    })
  };
  return reducers[action.type] ? reducers[action.type]() : state;
};
