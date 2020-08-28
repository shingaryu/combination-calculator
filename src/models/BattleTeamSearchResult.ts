import PokemonStrategy from "./PokemonStrategy";

type BattleTeamSearchResult = {
  pokemons: PokemonStrategy[],
  value: number,
  strValues?: number[],
  minimumValueTargetPoke: PokemonStrategy,
  eachMaximums?: { to: PokemonStrategy, from: PokemonStrategy, value: number}[],
  overused?: {from: PokemonStrategy, total: number}[],
  overusedMinimum?: number
}

export default BattleTeamSearchResult;