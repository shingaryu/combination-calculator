import { applyMiddleware, compose, createStore } from "redux";
import rootReducer from "./reducers";
import createSagaMiddleware from 'redux-saga'
import mySaga from "./sagas";

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default createStore(rootReducer, composeEnhancers(applyMiddleware(sagaMiddleware))
);

// then run the saga
sagaMiddleware.run(mySaga)