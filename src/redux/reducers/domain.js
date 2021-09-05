import { SET_SEARCH_SETTINGS } from "../actionTypes";
import { LOAD_MASTER_DATA_SUCCEEDED } from "../actionTypes"

const initialState = {
  allTargetPokemonNames: [],
  allPokemonStrategies: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case LOAD_MASTER_DATA_SUCCEEDED: {
      const { pokemonStrategies, targetPokemonNames } = action.payload;
      return {
        ...state,
        allTargetPokemonNames: targetPokemonNames,
        allPokemonStrategies: pokemonStrategies
      };
    }
    default:
      return state;
  }
}