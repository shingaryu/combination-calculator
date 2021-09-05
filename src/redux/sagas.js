import { call, put, select, takeLatest } from 'redux-saga/effects'
import { LOAD_MASTER_DATA_FAILED, LOAD_MASTER_DATA_REQUESTED, LOAD_MASTER_DATA_SUCCEEDED, FETCH_TARGET_POKEMON_NAMES, SET_TEAM_POKEMONS } from './actionTypes';
import { masterDataService } from '../services/masterDataService';
import { getTeamPokemons } from './selectors';
import { defaultTeam, teamFromLocalStrage } from '../defaultList';
import { setTeamPokemons, setTeamPokemonsSucceeded } from './actions';

function* loadMasterData(action) {
   try {
      yield call(masterDataService.loadMasterData.bind(masterDataService), null)
      const pokemonStrategies = masterDataService.getAllPokemonStrategies();
      const targetPokemonNames = masterDataService.getAllTargetPokemonNames();  
      yield put({type: LOAD_MASTER_DATA_SUCCEEDED, payload: {
          pokemonStrategies, targetPokemonNames
      }});
      const teamPokemons = yield select(getTeamPokemons);
      if (teamPokemons.length === 0) {
        const defaults = teamFromLocalStrage(pokemonStrategies) || defaultTeam(pokemonStrategies);
        yield put(setTeamPokemons(defaults))
      }
   } catch (e) {
      yield put({type: LOAD_MASTER_DATA_FAILED, message: e.message});
   }
}

function* setTeamPokemonsSaga(action) {
    const pokemons = action.payload.value;
    localStorage.setItem('teamPokemonId', JSON.stringify(pokemons.map(p => p.id)))
    yield put(setTeamPokemonsSucceeded(pokemons))
}

function* watchSaga() {
  yield takeLatest(LOAD_MASTER_DATA_REQUESTED, loadMasterData);
  yield takeLatest(SET_TEAM_POKEMONS, setTeamPokemonsSaga);
}

export default watchSaga;