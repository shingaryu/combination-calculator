type SearchResult = {
  pokemonIds: string[]
  pokemonNames: string[],
  value: number,
  targetPokemonName?: string
  strValues?: number[],
  minimumValueTargetId?: string,
  minimumValueTargetName?: string,
  eachMaximums?: { to: number, from: number, value: number}[],
  overused?: any,
  overusedMinimum?: number
}

export default SearchResult;