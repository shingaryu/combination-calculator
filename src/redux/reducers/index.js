import { combineReducers } from "redux";
import teamBuilder from "./teamBuilder";
import domain from "./domain"

export default combineReducers({ teamBuilder: teamBuilder, domain: domain });
