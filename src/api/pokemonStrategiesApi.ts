import axios, { AxiosResponse } from 'axios';
import PokemonStrategy from '../models/PokemonStrategy';

const baseUrl = process.env.REACT_APP_MATCHUP_CHART_API_URL;

export async function getPokemonStrategies(): Promise<AxiosResponse<PokemonStrategy[]>> {
  return axios.get(`${baseUrl}/pokemonStrategies`, {
    params: {
      speciesInfo: true
    }
  });
}
