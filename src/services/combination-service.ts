// import strategiesUrl from '../assets/strategies.csv';
// import usageUrl from '../assets/usage.csv';
// import axios from 'axios';
import { getStrengthVectorsByStrategies } from '../api/strengthVectorsApi';
import StrengthTable from '../models/StrengthTable';
import SearchResult from '../models/searchResult';
import PokemonStrategy from '../models/PokemonStrategy';
// const strategiesUrl = require('../assets/strategies.csv');

type StrengthRow = {
  index: number,
  strategyId: string,
  species: string,
  originalVector: number[],
  vector: number[],
  strategyType?: string,
  hasBoost?: boolean;
}

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
    const loadStrTablePromise = new Promise(async (resolve, reject) => {
      try {
        const strengthVectorsRes = await getStrengthVectorsByStrategies();
        const loadStrTableResult = this.loadStrengthTable(strengthVectorsRes.data);
        this.strengthRows = loadStrTableResult.strengthRows;
        this.targetPokeNames = loadStrTableResult.targetPokeNames;
        this.targetPokeIds = loadStrTableResult.targetPokeIds;
        console.log(`strength table was successfully loaded`);
        resolve();
      } catch (error) {
        reject(error);
        throw new Error('Error: failed to get strength table data from URL')
      }
    });

    await Promise.resolve(loadStrTablePromise);

    const loadStrategiesPromise = new Promise(async (resolve, reject) => {
      try {
        // const strategiesTextRes = await axios.get(strategiesUrl);
        // this.loadStrategyInfoToStrTable(strategiesTextRes.data, this.strengthRows);
        // console.log(`strategy information was successfully loaded`);
        resolve();
      } catch (error) {
        reject(error);
        throw new Error('Error: failed to get strategy data from URL')
      }
    });

    // const loadUsageInfoPromise = new Promise(async (resolve, reject) => {
    //   try {
    //     const usageTextRes = await axios.get(usageUrl);
    //     this.loadUsageInfo(usageTextRes.data, this.columns, this.strengthRows);
    //     console.log(`usage information was successfully loaded`);
    //     resolve();
    //   } catch (error) {
    //     reject(error);
    //     throw new Error('Error: failed to get usage data from URL')
    //   }
    // });

    // await Promise.all([loadStrategiesPromise, loadUsageInfoPromise]);
    await Promise.all([loadStrategiesPromise]);
  }
  
  loadStrengthTable(json: StrengthTable): { targetPokeNames: string[], targetPokeIds: string[], strengthRows: StrengthRow[] } {
    const targetPokeNames = json.columns.map(x => x.species);
    const targetPokeIds = json.columns.map(x => x.strategyId);
    console.log(`strength table columns: ${targetPokeNames.length}`);

    let strengthRows: StrengthRow[] = []; 
    let index = 0;
    json.rows.forEach(row => {
      if (!row) {
        return;
      }

      const values = row.values;
      if (targetPokeNames.length !== values.length) {
        throw new Error('error: the number of column is not same among all rows');
      }

      const strengthRow: StrengthRow = {
        index: index++,
        strategyId: row.strategyId,
        species: row.species,
        originalVector: values,
        vector: values
      };

      strengthRows.push(strengthRow);
    });
  
    console.log(`valid strength table rows: ${strengthRows.length}`);
  
    return { targetPokeNames, targetPokeIds, strengthRows};
  }

  // load strategy info from text and add params to strength table
  loadStrategyInfoToStrTable(strategiesText: string, strengthRows: StrengthRow[]) {
    strategiesText = strategiesText.replace('\r\n', '\n');
    const strategiesRows = strategiesText.split('\n');
  
    strategiesRows.slice(1).forEach(strategiesRow => {
      if (strategiesRow.split(',').every(x => this.isEmptyString(x))) {
        return;
      }
  
      const records = strategiesRow.split(',');
      if (records.length < 3) {
        throw new Error('error: invalid strategies records');
      }
  
      const index = parseInt(records[0].trim());
      const name = records[1].trim();
      const type = records[2].trim();
      const hasBoost = (records.length > 3 && records[3].trim() === 'Yes');
  
      if (index > strengthRows.length - 1) {
        throw new Error(`error: index ${index} is out of range of strength table`);
      }
  
      const row = strengthRows[index];
  
      if (row.species !== name) {
        throw new Error(`error: species name ${name} is not match with the row [${index}] of the strength table`);
      }
  
      const validStrategiesType = [
        'Sweeper', 'Tank', 'Wall', 'Support'
      ];
      
      if (validStrategiesType.indexOf(type) < 0) {
        throw new Error(`error: invalid strategy type ${type}`);
      }
  
      row['strategyType'] = type;
      row['hasBoost'] = hasBoost;
    });
  
    if (!strengthRows.find(x => x.hasBoost)) {
      throw new Error('error: no boost attacker is found');
    }
  
    strengthRows.forEach(x => {
      if (!x.strategyType) {
        throw new Error(`error: strategy type of pokemon ${x.species} is not set`);
      }
    });
  }
  
  loadUsageInfo(usageText: string, columns: string[], strengthRows: StrengthRow[]) {
    usageText = usageText.replace('\r\n', '\n');
  
    const usageRows = usageText.split('\n');
    const usageInfo = [];
    const usageMap = new Map();
    usageRows.slice(1).forEach(row => {
      if (!row) {
        return;
      }
    
      if (row.split(',').every(x => this.isEmptyString(x))) {
        return;
      }
    
      const records = row.split(',');
      if (records.length < 2) {
        throw new Error('error: invalid usage records');
      }
    
      const name = records[0].trim();
      const usage = parseFloat(records[1].trim());
      usageMap.set(name, usage);
    
      usageInfo.push({name, usage});
    });
    
    const usageBaseRatio: number[] = [];
    for (let i = 0; i < columns.length; i++) {
      if (usageMap.get(columns[i]) === undefined) {
        throw new Error(`error: usage information for pokemon ${columns[i]} is not found`);
      }
  
      const duplicateCounts = columns.filter(x => x === columns[i]).length;
      usageBaseRatio[i] = usageMap.get(columns[i]) / duplicateCounts;
    }
  
    strengthRows.forEach(row => {
      for (let i = 0; i < columns.length; i++) {
        row.vector[i] *= (usageBaseRatio[i] / 100);
      }
    })
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
  
  isEmptyString(x: string) {
    return (x === '' || x === '\n' || x === '\r');
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

  calcTeamCombinationsOnWeakest(teamPokemonIndices: number[], opponentPokemonIndices: number[]) {
    const battleTeamIndices = [];
    for (let i = 0; i < teamPokemonIndices.length; i++) {
      for (let j = i + 1; j < teamPokemonIndices.length; j++) {
        for (let k = j + 1; k < teamPokemonIndices.length; k++) {
          const ind = teamPokemonIndices;
          battleTeamIndices.push([ind[i], ind[j], ind[k]]);
        }
      }
    }

    const results: SearchResult[] = [];
    battleTeamIndices.forEach(indices => {
      const strValues = this.strValuesOfTeam(indices, opponentPokemonIndices);
      const minimumValue = Math.min(...strValues);
      const minimumValueIndex = strValues.findIndex(x => x === minimumValue);
      const oppPokeOriginalIndex = opponentPokemonIndices[minimumValueIndex];
      results.push({
        pokemonIds: indices.map(x => x.toString()),
        pokemonNames: indices.map(i => this.strengthRows[i].species),
        strValues: strValues,
        value: minimumValue,
        minimumValueTargetId: this.targetPokeIds[oppPokeOriginalIndex],
        minimumValueTargetName: this.targetPokeNames[oppPokeOriginalIndex]
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;
  }

  calcTeamCombinationsOnMaximumWeakest(teamPokemonIndices: number[], opponentPokemonIndices: number[]) {
    const battleTeamIndices = [];
    for (let i = 0; i < teamPokemonIndices.length; i++) {
      for (let j = i + 1; j < teamPokemonIndices.length; j++) {
        for (let k = j + 1; k < teamPokemonIndices.length; k++) {
          const ind = teamPokemonIndices;
          battleTeamIndices.push([ind[i], ind[j], ind[k]]);
        }
      }
    }

    const results: SearchResult[] = [];
    battleTeamIndices.forEach(indices => {
      const maximums = this.strValuesOfTeamOnMaximum(indices, opponentPokemonIndices);
      const strValues = maximums.map(x => x.value);
      const minimumValue = Math.min(...strValues);
      const minimumValueIndex = strValues.findIndex(x => x === minimumValue);
      const oppPokeOriginalIndex = opponentPokemonIndices[minimumValueIndex];
      const overused = this.DetectOverused(maximums);
      let overusedMinimum = 0;
      overused.forEach(o => {
        if (o.total < overusedMinimum) {
          overusedMinimum = o.total;
        }
      });
      results.push({
        pokemonIds: indices.map(x => x.toString()),
        pokemonNames: indices.map(i => this.strengthRows[i].species),
        strValues: strValues,
        value: minimumValue,
        minimumValueTargetId: this.targetPokeIds[oppPokeOriginalIndex],
        minimumValueTargetName: this.targetPokeNames[oppPokeOriginalIndex],
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

  DetectOverused(maximums: { to: number, from: number, value: number}[] ) {
    const remainingHpArray: Map<number, number> = new Map();
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

  strValuesOfTeam(teamPokemonIndices: number[], selectedTargetIndices: number[]) {
    // is it needed to remove duplications about team members?

    if (!teamPokemonIndices || teamPokemonIndices.length === 0) {
      const allZero = [];
      for (let i = 0; i < selectedTargetIndices.length; i++) {
        allZero.push(0);
      }
      return allZero;
    }

    const pokemonVectors = teamPokemonIndices.map(pokeIndex => {
      if (!(0 <= pokeIndex && pokeIndex <= this.strengthRows.length - 1)) {
        throw new Error ('Error: pokemon index is out of the range');
      }

      const row = this.strengthRows[pokeIndex];
      const filteredVector = row.vector.filter((x, i) => selectedTargetIndices.indexOf(i) >= 0);
      return filteredVector;
    });

    const combinedVector = this.addVectors(...pokemonVectors);

    return combinedVector;
  }

  strValuesOfTeamOnMaximum(teamPokemonIndices: number[], selectedTargetIndices: number[]):
    { to: number, from: number, value: number}[] {
    // is it needed to remove duplications about team members?

    // if (!teamPokemonIndices || teamPokemonIndices.length === 0) {
    //   const allZero = [];
    //   for (let i = 0; i < selectedTargetIndices.length; i++) {
    //     allZero.push(0);
    //   }
    //   return allZero;
    // }

    const pokemonVectors = teamPokemonIndices.map(pokeIndex => {
      if (!(0 <= pokeIndex && pokeIndex <= this.strengthRows.length - 1)) {
        throw new Error ('Error: pokemon index is out of the range');
      }

      const row = this.strengthRows[pokeIndex];
      const filteredVector = row.vector.filter((x, i) => selectedTargetIndices.indexOf(i) >= 0);
      return filteredVector;
    });

    const maximums = [];
    for (let i = 0; i < selectedTargetIndices.length; i++) {
      const valuesToThisTarget = [];
      for (let j = 0; j < teamPokemonIndices.length; j++) {
        valuesToThisTarget.push(pokemonVectors[j][i]);
      }
      
      const maximumValue = Math.max(...valuesToThisTarget);
      const maximumIndex = valuesToThisTarget.findIndex(x => x === maximumValue);
      maximums.push({ to: selectedTargetIndices[i], from: teamPokemonIndices[maximumIndex], value: maximumValue});
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