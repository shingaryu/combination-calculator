import axios, { AxiosResponse } from 'axios';
import StrengthTable from '../models/StrengthTable';

const baseUrl = process.env.REACT_APP_MATCHUP_CHART_API_URL;

export async function getStrengthVectorsByStrategies(): Promise<AxiosResponse<StrengthTable>> {
  return axios.get(`${baseUrl}/strengthVectors/strategies`);
}
