import SearchResult from '../models/searchResult';
import PokemonStrategy from '../models/PokemonStrategy';
import StrengthTableLoader from './strengthTableLoader';
import StrengthRow from './StrengthRow';
import * as Utils from './utils';

export class CombinationService {
  private strengthRows: StrengthRow[];
  private targetPokeNames: string[];
  private targetPokeIds: string[];

  constructor() {
    this.strengthRows = [];
    this.targetPokeNames = [];
    this.targetPokeIds = [];
  }

  async loadMasterData() {
    const loader = new StrengthTableLoader();
    await loader.loadMasterData();
    this.strengthRows = loader.getStrengthRows();
    this.targetPokeNames = loader.getTargetPokeNames();
    this.targetPokeIds = loader.getTargetPokeIds();
  }
  
  getStrengthRows() {
    return this.strengthRows;
  }

  getAllTeamPokemonNames() {
    // we can get all team (candidate) pokemon names also from the strategy info
    // which is better?

    return this.strengthRows.map(row => row.species);
  }

  getAllTargetPokemonNames() {
    return this.targetPokeNames;
  }

  strValuesOfTeamStrategies(teamPokemons: PokemonStrategy[], selectedTargets: PokemonStrategy[]) {
    if (!teamPokemons || teamPokemons.length === 0) {
      const allZero = [];
      for (let i = 0; i < selectedTargets.length; i++) {
        allZero.push(0);
      }
      return allZero;
    }

    const pokemonVectors = teamPokemons.map(pokeStrategy => {
      const row = this.strengthRows.find(x => x.strategyId === pokeStrategy.id);
      if (!row) {
        throw new Error('Error: team pokemon does not exist in strength rows');
      }

      const filteredVector = this.filterAndSortStrVectorByTargets(row.vector, selectedTargets);
      
      return filteredVector;
    });
    
    const combinedVector = Utils.addVectors(...pokemonVectors);

    return combinedVector;
  }

  calcTargetStrengthsComplement(teamPokemons: PokemonStrategy[], selectedTargets: PokemonStrategy[], compatibleStrTypes: string[]) {
    if (!teamPokemons || teamPokemons.length === 0) {
      return [];
    }

    const combinedVector = this.strValuesOfTeamStrategies(teamPokemons, selectedTargets);

    let targetStrengthRows = this.strengthRows.filter(x => !teamPokemons.find(y => y.id === x.strategyId));

    const results: SearchResult[] = [];
    targetStrengthRows.forEach(row => {
      const filteredVector = this.filterAndSortStrVectorByTargets(row.vector, selectedTargets);
      results.push({
        pokemonIds: [ row.index.toString() ],
        pokemonNames: [ row.species ],
        value: -1 * Utils.cosineSimilarity(combinedVector, filteredVector) // smaller cosine similarities have bigger complements
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;
  }

  calcWeakestPointImmunity(teamPokemons: PokemonStrategy[], selectedTargets: PokemonStrategy[]) {
    if (!teamPokemons || teamPokemons.length === 0) {
      return [];
    }

    const combinedVector = this.strValuesOfTeamStrategies(teamPokemons, selectedTargets);
    let targetStrengthRows = this.strengthRows.filter(x => !teamPokemons.find(y => y.id === x.strategyId));

    const weakestSpot = combinedVector.indexOf(Math.min(...combinedVector));
    console.log(`weakest spot: ${weakestSpot} (${selectedTargets[weakestSpot].species})`);

    const results: SearchResult[] = [];
    targetStrengthRows.forEach(row => {
      const filteredVector = this.filterAndSortStrVectorByTargets(row.vector, selectedTargets);
      results.push({
        pokemonIds: [ row.index.toString() ],
        pokemonNames: [ row.species ],
        value: filteredVector[weakestSpot],
        targetPokemonName: selectedTargets[weakestSpot].species // temporary
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;    
  }

  calcImmunityToCustomTargets(teamPokemons: PokemonStrategy[], selectedTargets: PokemonStrategy[], targetIds: string[]) {
    if (!teamPokemons || teamPokemons.length === 0) {
      return [];
    }

    if (!targetIds || targetIds.length === 0) {
      return [];
    }

    let targetStrengthRows = this.strengthRows.filter(x => !teamPokemons.find(y => y.id === x.strategyId));

    const results: SearchResult[] = [];
    targetStrengthRows.forEach(row => {
      const vectorWithId: any[] = [];
      row.vector.forEach((val, i) => {
        vectorWithId.push({targetId: this.targetPokeIds[i], value: val});
      })

      const filteredVector = vectorWithId.filter((x) => targetIds.indexOf(x.targetId) >= 0);

      let sum = 0;
      filteredVector.forEach(vec => sum += vec.value);

      results.push({
        pokemonIds: [ row.index.toString() ],
        pokemonNames: [ row.species ],
        value: sum,
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;    
  }

  calcOverallMinus(teamPokemons: PokemonStrategy[], selectedTargets: PokemonStrategy[]) {
    if (!teamPokemons || teamPokemons.length === 0) {
      return [];
    }

    const combinedVector = this.strValuesOfTeamStrategies(teamPokemons, selectedTargets);
    let targetStrengthRows = this.strengthRows.filter(x => !teamPokemons.find(y => y.id === x.strategyId));

    const results: SearchResult[] = [];
    targetStrengthRows.forEach(row => {
      const filteredVector = this.filterAndSortStrVectorByTargets(row.vector, selectedTargets);
      const overallVector = Utils.addVectors(combinedVector, filteredVector);
      let minusSum = 0.0;
      overallVector.filter(val => val < 0).forEach(val => minusSum += val);

      results.push({
        pokemonIds: [ row.index.toString() ],
        pokemonNames: [ row.species ],
        value: minusSum,
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;     
  }

  filterAndSortStrVectorByTargets(vector: number[], targets: PokemonStrategy[]) {
    const newVector = targets.map(tar => {
      const columnIndex = this.targetPokeIds.findIndex(x => x === tar.id);
      if (columnIndex === -1) {
        throw new Error('Error: Target pokemon not found');
      }

      return vector[columnIndex];
    });

    return newVector;
  }
}