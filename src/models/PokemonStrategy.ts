import Gender from "./Gender";
import Nature from "./Nature";
import Shiny from "./Shiny";

type PokemonStrategy =  {
  id: string,
  species_id: string,
  species: string,
  dex_number: number,
  item: string,
  ability: string,
  nature: Nature,
  move1: string,
  move2: string,
  move3: string,
  move4: string,
  ev_hp: number,
  ev_atk: number,
  ev_def: number,
  ev_spa: number,
  ev_spd: number,
  ev_spe: number,
  nickname: string,
  gender: Gender,
  iv_hp: number,
  iv_atk: number,
  iv_def: number,
  iv_spa: number,
  iv_spd: number,
  iv_spe: number,
  level: number,
  happiness: number,
  shiny: Shiny
} 

export default PokemonStrategy;