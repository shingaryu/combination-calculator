import PokemonStrategy from "./PokemonStrategy";
import TacticsPattern from "./TacticsPattern";

type BattleTeamSearchResult = {
  pokemons: PokemonStrategy[],
  value: number,
  strValues?: number[],
  minimumValueTargetPoke: PokemonStrategy,
  tacticsPattern?: TacticsPattern,
  overused?: {player: PokemonStrategy, total: number}[],
  overusedMinimum?: number
}

export default BattleTeamSearchResult;