import { call, put, takeLatest } from 'redux-saga/effects'
import { LOAD_MASTER_DATA_FAILED, LOAD_MASTER_DATA_REQUESTED, LOAD_MASTER_DATA_SUCCEEDED, FETCH_TARGET_POKEMON_NAMES } from './actionTypes';
import { masterDataService } from '../services/masterDataService';

function* loadMasterData(action) {
   try {
      yield call(masterDataService.loadMasterData.bind(masterDataService), null)
      const pokemonStrategies = masterDataService.getAllPokemonStrategies();
      const targetPokemonNames = masterDataService.getAllTargetPokemonNames();  
      yield put({type: LOAD_MASTER_DATA_SUCCEEDED, payload: {
          pokemonStrategies, targetPokemonNames
      }});
   } catch (e) {
      yield put({type: LOAD_MASTER_DATA_FAILED, message: e.message});
   }
}

function* watchSaga() {
  yield takeLatest(LOAD_MASTER_DATA_REQUESTED, loadMasterData);
}

export default watchSaga;