import StrengthTable from '../models/StrengthTable';
import StrengthRow from './StrengthRow';
import { getStrengthVectorsByStrategies } from '../api/strengthVectorsApi';
// import axios from 'axios';
// import strategiesUrl from '../assets/strategies.csv';
// import usageUrl from '../assets/usage.csv';

export default class StrengthTableLoader {
  private strengthRows: StrengthRow[];
  private targetPokeNames: string[];
  private targetPokeIds: string[];

  constructor() {
    this.strengthRows = [];
    this.targetPokeNames = [];
    this.targetPokeIds = [];
  }

  getStrengthRows() {
    return this.strengthRows;
  }

  getTargetPokeNames() {
    return this.targetPokeNames;
  }
  
  getTargetPokeIds() {
    return this.targetPokeIds;
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

  isEmptyString(x: string) {
    return (x === '' || x === '\n' || x === '\r');
  }
}
