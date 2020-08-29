import SearchResult from '../models/searchResult';
import BattleTeamSearchResult from '../models/BattleTeamSearchResult';
import PokemonStrategy from '../models/PokemonStrategy';
import StrengthTableLoader from './strengthTableLoader';
import StrengthRow from './StrengthRow';

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
  
  addVectors(...vectors: number[][]) {
    const length = vectors[0].length;
    for (let i = 0; i < vectors.length; i++) {
      if (length !== vectors[i].length) {
        throw new Error('the number of elements is not same');
      }
      
    }
  
    const newVec = [];
    for (let i = 0; i < length; i++) {
      let elementsSum = 0;
      for (let j = 0; j < vectors.length; j++) {
        elementsSum += vectors[j][i];
      }
      newVec.push(elementsSum);
    } 
  
    return newVec;
  }
  
  addVector(vector1: number[], vector2: number[]) {
    if (vector1.length !== vector2.length) {
      throw new Error('the number of elements is not same');
    }
  
    const newVec = [];
    for (let i = 0; i < vector1.length; i++) {
      newVec.push(vector1[i] + vector2[i]);
    } 
  
    return newVec;
  }
  
  cosineSimilarity(v1: number[], v2: number[]) {
    return this.dotProduct(v1, v2) / (this.l2norm(v1) * this.l2norm(v2));
  }
  
  dotProduct(vector1: number[], vector2: number[]) {
    if (vector1.length !== vector2.length) {
      throw new Error('the number of elements is not same');
    }
  
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      sum += vector1[i] * vector2[i];
    }
  
    return sum;
  }
  
  l2norm(vector: number[]) {
    let sum = 0;
    vector.forEach(x => {
      sum += x * x;
    });
  
    sum = Math.sqrt(sum);
    return sum;
  }

  compatibleTypes(strategyType: string) {
    let compatibleTypes: string[] = [];
  
    if (strategyType === 'Sweeper') {
      compatibleTypes = ['Sweeper', 'Tank'];
    } else if (strategyType === 'Tank') {
      compatibleTypes = ['Sweeper', 'Tank', 'Wall'];
    } else if (strategyType === 'Wall') {
      compatibleTypes = ['Tank', 'Wall'];
    }
  
    return compatibleTypes;
  }
  
  filterStrengthRows(acceptableTypes: string[], strengthRows: StrengthRow[]) {
    return strengthRows.filter(x => x.strategyType && acceptableTypes.indexOf(x.strategyType) >= 0);
  }

  getAllTeamPokemonNames() {
    // we can get all team (candidate) pokemon names also from the strategy info
    // which is better?

    return this.strengthRows.map(row => row.species);
  }

  getAllTargetPokemonNames() {
    return this.targetPokeNames;
  }

  calcTeamCombinationsOnWeakest(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    const battleTeamCombinations = [];
    for (let i = 0; i < teamPokemons.length; i++) {
      for (let j = i + 1; j < teamPokemons.length; j++) {
        for (let k = j + 1; k < teamPokemons.length; k++) {
          battleTeamCombinations.push([teamPokemons[i], teamPokemons[j], teamPokemons[k]]);
        }
      }
    }

    const results: BattleTeamSearchResult[] = [];
    battleTeamCombinations.forEach(pokemons => {
      const strValues = this.strValuesOfTeamStrategies(pokemons, opponentPokemons);
      const minimumValue = Math.min(...strValues);
      const minimumValueIndex = strValues.findIndex(x => x === minimumValue);
      const minimumValueOppPoke = opponentPokemons[minimumValueIndex];
      results.push({
        pokemons: pokemons,
        strValues: strValues,
        value: minimumValue,
        minimumValueTargetPoke: minimumValueOppPoke
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;
  }

  calcTeamCombinationsOnMaximumWeakest(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    const battleTeamCombinations = [];
    for (let i = 0; i < teamPokemons.length; i++) {
      for (let j = i + 1; j < teamPokemons.length; j++) {
        for (let k = j + 1; k < teamPokemons.length; k++) {
          battleTeamCombinations.push([teamPokemons[i], teamPokemons[j], teamPokemons[k]]);
        }
      }
    }

    const results: BattleTeamSearchResult[] = [];
    battleTeamCombinations.forEach(pokemons => {
      const maximums = this.strValuesOfTeamOnMaximum(pokemons, opponentPokemons);
      const strValues = maximums.map(x => x.value);
      const minimumValue = Math.min(...strValues);
      const minimumValueIndex = strValues.findIndex(x => x === minimumValue);
      const minimumValueOppPoke = opponentPokemons[minimumValueIndex];
      const overused = this.DetectOverused(maximums);
      let overusedMinimum = 0;
      overused.forEach(o => {
        if (o.total < overusedMinimum) {
          overusedMinimum = o.total;
        }
      });
      results.push({
        pokemons: pokemons,        
        strValues: strValues,
        value: minimumValue,
        minimumValueTargetPoke: minimumValueOppPoke,
        eachMaximums: maximums,
        overused: overused,
        overusedMinimum: overusedMinimum
      })
    });

    results.sort((a, b) => {
      if (b.value < a.value) {
        return -1;
      } else if (a.value < b.value) {
        return 1;
      } else {
        if (!a.overusedMinimum || !b.overusedMinimum) {
          return 0;
        } else {
          return b.overusedMinimum - a.overusedMinimum;
        }
      }

    }); // higher values come first

    return results;
  }

  DetectOverused(maximums: { to: PokemonStrategy, from: PokemonStrategy, value: number}[] ) {
    const remainingHpArray: Map<PokemonStrategy, number> = new Map();
    for (let i = 0; i < maximums.length; i++) {
      const maxi = maximums[i];
      if (remainingHpArray.get(maxi.from) === undefined) {
        remainingHpArray.set(maxi.from, 1024);
      }

      let currentHp = remainingHpArray.get(maxi.from);
      if (currentHp === undefined) {
        currentHp = 1024;
      }
      const updatedHp = currentHp - (1024 - maxi.value);
      remainingHpArray.set(maxi.from, updatedHp);
    }

    const overused: any[] = [];
    remainingHpArray.forEach((value, key) => {
      if (value < 0) {
        overused.push({from: key, total: value});
      }
    });

    return overused;
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
    
    const combinedVector = this.addVectors(...pokemonVectors);

    return combinedVector;
  }

  strValuesOfTeamOnMaximum(teamPokemons: PokemonStrategy[], selectedTargets: PokemonStrategy[]):
    { to: PokemonStrategy, from: PokemonStrategy, value: number}[] {
    // is it needed to remove duplications about team members?

    // if (!teamPokemonIndices || teamPokemonIndices.length === 0) {
    //   const allZero = [];
    //   for (let i = 0; i < selectedTargetIndices.length; i++) {
    //     allZero.push(0);
    //   }
    //   return allZero;
    // }

    const pokemonVectors = teamPokemons.map(pokeStrategy => {
      const row = this.strengthRows.find(x => x.strategyId === pokeStrategy.id);
      if (!row) {
        throw new Error('Error: team pokemon does not exist in strength rows');
      }

      const filteredVector = this.filterAndSortStrVectorByTargets(row.vector, selectedTargets);
      return filteredVector;
    });

    const maximums = [];
    for (let i = 0; i < selectedTargets.length; i++) {
      const valuesToThisTarget = [];
      for (let j = 0; j < teamPokemons.length; j++) {
        valuesToThisTarget.push(pokemonVectors[j][i]);
      }
      
      const maximumValue = Math.max(...valuesToThisTarget);
      const maximumIndex = valuesToThisTarget.findIndex(x => x === maximumValue);
      maximums.push({ to: selectedTargets[i], from: teamPokemons[maximumIndex], value: maximumValue});
    }

    return maximums;
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
        value: -1 * this.cosineSimilarity(combinedVector, filteredVector) // smaller cosine similarities have bigger complements
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
      const overallVector = this.addVectors(combinedVector, filteredVector);
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
}