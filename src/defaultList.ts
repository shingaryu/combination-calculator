import defaultJson from './default.json';
import PokemonStrategy from './models/PokemonStrategy';

export function defaultTeam(allPokemonList: PokemonStrategy[]) {
  const defaultTeam = defaultJson.defaultTeam.map(id => {
    const poke = allPokemonList.find(x => x.id === id);
    if (!poke) {
      throw new Error(`Error: strategy id ${id} does not exist in the list`);
    }

    return poke;
  });

  return defaultTeam;
}

export function defaultTeamList(allPokemonList: PokemonStrategy[]) {
  const defaultTeamList = defaultJson.defaultTeamList.map(id => {
    const poke = allPokemonList.find(x => x.id === id);
    if (!poke) {
      throw new Error(`Error: strategy id ${id} does not exist in the list`);
    }

    return poke;
  });

  return defaultTeamList;
}

export function defaultTargets(allPokemonList: PokemonStrategy[]) {
  const defaultTargets = defaultJson.defaultTargets.map(id => {
    const poke = allPokemonList.find(x => x.id === id);
    if (!poke) {
      throw new Error(`Error: strategy id ${id} does not exist in the list`);
    }

    return poke;
  });

  return defaultTargets;
}