import { LOAD_MASTER_DATA_REQUESTED, LOAD_MASTER_DATA_SUCCEEDED, SET_SEARCH_SETTINGS, SET_TEAM_POKEMONS, SET_TEAM_POKEMONS_SUCCEEDED } from "./actionTypes";

export const setSearchSettings = value => ({
  type: SET_SEARCH_SETTINGS,
  payload: { value }
})

export const loadMasterData = () => ({
  type: LOAD_MASTER_DATA_REQUESTED,
  payload: {}
})

export const loadMasterDataSucceeded = value => ({
  type: LOAD_MASTER_DATA_SUCCEEDED,
  payload: { value }
})

export const setTeamPokemons = value => ({
  type: SET_TEAM_POKEMONS,
  payload: { value }
})

export const setTeamPokemonsSucceeded = value => ({
  type: SET_TEAM_POKEMONS_SUCCEEDED,
  payload: { value }
})
