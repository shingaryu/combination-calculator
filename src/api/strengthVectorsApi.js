import axios from 'axios';

const baseUrl = process.env.REACT_APP_MATCHUP_CHART_API_URL;

export async function getStrengthVectorsByStrategies() {
  console.log(`${baseUrl}/strengthVectors/strategies`)
  return axios.get(`${baseUrl}/strengthVectors/strategies`);
}
