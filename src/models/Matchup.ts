import PokemonStrategy from "./PokemonStrategy";

type Matchup = {
  player: PokemonStrategy, 
  opponent: PokemonStrategy, 
  value: number
}

export default Matchup;