type SearchResult = {
  pokemonIds: string[]
  pokemonNames: string[],
  value: number,
  targetPokemonName?: string
  strValues?: number[],
  minimumValueTargetId?: string,
  minimumValueTargetName?: string,
  eachMaximums?: { to: number, from: number, value: number}[]
}

export default SearchResult;