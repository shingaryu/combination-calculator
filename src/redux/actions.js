import { SET_SEARCH_SETTINGS } from "./actionTypes";

export const setSearchSettings = value => ({
  type: SET_SEARCH_SETTINGS,
  payload: { value }
})
