// import strategiesUrl from '../assets/strategies.csv';
// import usageUrl from '../assets/usage.csv';
import axios from 'axios';
import { getStrengthVectorsByStrategies } from '../api/strengthVectorsApi';
import StrengthTable from '../models/StrengthTable';
import SearchResult from '../models/searchResult';
const strategiesUrl = require('../assets/strategies.csv');

type StrengthRow = {
  index: number,
  id: string,
  name: string,
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
        const strategiesTextRes = await axios.get(strategiesUrl);
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
        id: row.strategyId,
        name: row.species,
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
  
      if (row.name !== name) {
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
        throw new Error(`error: strategy type of pokemon ${x.name} is not set`);
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

    return this.strengthRows.map(row => row.name);
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
        pokemonNames: indices.map(i => this.strengthRows[i].name),
        strValues: strValues,
        value: minimumValue,
        minimumValueTargetId: this.targetPokeIds[oppPokeOriginalIndex],
        minimumValueTargetName: this.targetPokeNames[oppPokeOriginalIndex]
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;
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

  calcTargetStrengthsComplement(teamPokemonIndices: number[], selectedTargetIndices: number[], compatibleStrTypes: string[]) {
    if (!teamPokemonIndices || teamPokemonIndices.length === 0) {
      return [];
    }

    const combinedVector = this.strValuesOfTeam(teamPokemonIndices, selectedTargetIndices);

    let targetStrengthRows = this.strengthRows.filter(x => teamPokemonIndices.indexOf(x.index) < 0);
    // targetStrengthRows = this.filterStrengthRows(compatibleStrTypes, targetStrengthRows);

    const results: SearchResult[] = [];
    targetStrengthRows.forEach(row => {
      const filteredVector = row.vector.filter((x, i) => selectedTargetIndices.indexOf(i) >= 0);
      results.push({
        pokemonIds: [ row.index.toString() ],
        pokemonNames: [ row.name ],
        value: -1 * this.cosineSimilarity(combinedVector, filteredVector) // smaller cosine similarities have bigger complements
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;
  }

  calcWeakestPointImmunity(teamPokemonIndices: number[], selectedTargetIndices: number[]) {
    if (!teamPokemonIndices || teamPokemonIndices.length === 0) {
      return [];
    }

    const combinedVector = this.strValuesOfTeam(teamPokemonIndices, selectedTargetIndices);
    let targetStrengthRows = this.strengthRows.filter(x => teamPokemonIndices.indexOf(x.index) < 0);

    const weakestSpot = combinedVector.indexOf(Math.min(...combinedVector));
    console.log(`weakest spot: ${weakestSpot} (${this.targetPokeNames[selectedTargetIndices[weakestSpot]]})`);

    const results: SearchResult[] = [];
    targetStrengthRows.forEach(row => {
      const filteredVector = row.vector.filter((x, i) => selectedTargetIndices.indexOf(i) >= 0);
      results.push({
        pokemonIds: [ row.index.toString() ],
        pokemonNames: [ row.name ],
        value: filteredVector[weakestSpot],
        targetPokemonName: this.targetPokeNames[selectedTargetIndices[weakestSpot]] // temporary
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;    
  }

  calcImmunityToCustomTargets(teamPokemonIndices: number[], selectedTargetIndices: number[], targetIds: string[]) {
    if (!teamPokemonIndices || teamPokemonIndices.length === 0) {
      return [];
    }

    if (!targetIds || targetIds.length === 0) {
      return [];
    }

    let targetStrengthRows = this.strengthRows.filter(x => teamPokemonIndices.indexOf(x.index) < 0);

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
        pokemonNames: [ row.name ],
        value: sum,
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;    
  }

  calcOverallMinus(teamPokemonIndices: number[], selectedTargetIndices: number[]) {
    if (!teamPokemonIndices || teamPokemonIndices.length === 0) {
      return [];
    }

    const combinedVector = this.strValuesOfTeam(teamPokemonIndices, selectedTargetIndices);
    let targetStrengthRows = this.strengthRows.filter(x => teamPokemonIndices.indexOf(x.index) < 0);

    const results: SearchResult[] = [];
    targetStrengthRows.forEach(row => {
      const filteredVector = row.vector.filter((x, i) => selectedTargetIndices.indexOf(i) >= 0);
      const overallVector = this.addVectors(combinedVector, filteredVector);
      let minusSum = 0.0;
      overallVector.filter(val => val < 0).forEach(val => minusSum += val);

      results.push({
        pokemonIds: [ row.index.toString() ],
        pokemonNames: [ row.name ],
        value: minusSum,
      })
    });

    results.sort((a, b) => b.value - a.value); // higher values come first

    return results;     
  }
}