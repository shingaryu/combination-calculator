type SearchResult = {
  pokemonIds: string[]
  pokemonNames: string[],
  value: number,
  targetPokemonName?: string
  strValues?: number[],
  minimumValueTargetId?: string,
  minimumValueTargetName?: string
}

export default SearchResult;