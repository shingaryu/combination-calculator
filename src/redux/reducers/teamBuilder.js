import { SET_SEARCH_SETTINGS, SET_TEAM_POKEMONS, SET_TEAM_POKEMONS_SUCCEEDED } from "../actionTypes";

const initialState = {
  searchSettings: { evaluationMethod: 0 },
  teamPokemons: [],
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_SEARCH_SETTINGS: {
      const { value } = action.payload;
      return {
        ...state,
        searchSettings: value
      };
    }
    case SET_TEAM_POKEMONS_SUCCEEDED: {
      const { value } = action.payload;
      return {
        ...state,
        teamPokemons: value
      };
    }
    default:
      return state;
  }
}