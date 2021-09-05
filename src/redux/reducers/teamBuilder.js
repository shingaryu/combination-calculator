import { SET_SEARCH_SETTINGS } from "../actionTypes";

const initialState = {
  searchSettings: { evaluationMethod: 0 },
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
    default:
      return state;
  }
}