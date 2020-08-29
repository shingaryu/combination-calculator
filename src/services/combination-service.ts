import SearchResult from '../models/searchResult';
import BattleTeamSearchResult from '../models/BattleTeamSearchResult';
import PokemonStrategy from '../models/PokemonStrategy';
import StrengthTableLoader from './strengthTableLoader';
import StrengthRow from './StrengthRow';
import * as Utils from './utils';
import Matchup from '../models/Matchup';
import TacticsPattern from '../models/TacticsPattern';

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

  calcTeamCombinationsOnAverageWeakest(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    const battleTeamCombinations = Utils.threeOfSixCombinations(teamPokemons);

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
    const battleTeamCombinations = Utils.threeOfSixCombinations(teamPokemons);

    const results: BattleTeamSearchResult[] = [];
    battleTeamCombinations.forEach(pokemons => {
      const matchups = this.allMatchupValues(pokemons, opponentPokemons);
      const tactics = this.maximumImmunitiesTactics(matchups);
      const minimumIndex = Utils.minimumIndex(tactics.matchups, (item) => item.value);
      const minimumValue = tactics.matchups[minimumIndex].value;
      const minimumValueOppPoke = tactics.matchups[minimumIndex].opponent;
      const overused = this.DetectOverused(tactics);
      let overusedMinimum = 0;
      overused.forEach(o => {
        if (o.total < overusedMinimum) {
          overusedMinimum = o.total;
        }
      });
      results.push({
        pokemons: pokemons,        
        value: minimumValue,
        minimumValueTargetPoke: minimumValueOppPoke,
        tacticsPattern: tactics,
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

  calcTeamCombinationsToAllOpppnentsCombinations(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    const myTeamCombinations = Utils.threeOfSixCombinations(teamPokemons);
    const oppTeamCombinations = Utils.threeOfSixCombinations(opponentPokemons);

    type ResultAC = {
      myTeamResults: MyTeamResult[],
      strongestMyTeamIndex: number, 
      value: number
    };

    type MyTeamResult = {
      myTeam: PokemonStrategy[],
      oppTeamResults: OppTeamResult[],
      strongestOppTeamIndex: number, 
      value: number
    }

    type OppTeamResult = {
      oppTeam: PokemonStrategy[],
      tacticsResults: TacticsResult[],
      bestTacticsIndex: number, 
      value: number
    }

    type TacticsResult = {
      tactics: TacticsPattern, 
      remainingHpSet: {player: PokemonStrategy, total: number}[], 
      remainingHpMinimumValue: number
      remainingHpMinumumPoke: PokemonStrategy 
    }

    let result: ResultAC = { myTeamResults: [], strongestMyTeamIndex: -1, value: 0};
    myTeamCombinations.forEach(myTeam => {
      let myTeamResult: MyTeamResult = { myTeam, oppTeamResults: [], strongestOppTeamIndex: -1, value: 0};
      oppTeamCombinations.forEach(oppTeam => {
        let oppTeamResult:OppTeamResult = { oppTeam, tacticsResults:[], bestTacticsIndex: -1, value: 0 };
        const allMatchups = this.allMatchupValues(myTeam, oppTeam);
        const allTactics = this.allTacticsCombinations(allMatchups);
        allTactics.forEach(tactics => {
          const remainingHpSet = this.remainingHp(tactics);
          const remainingHpMinimumIndex = Utils.minimumIndex(remainingHpSet, x => x.total);
          const remainingHpMinimumValue = remainingHpSet[remainingHpMinimumIndex].total;
          const remainingHpMinumumPoke = remainingHpSet[remainingHpMinimumIndex].player;
          
          const tacticsResult = { tactics, remainingHpSet, remainingHpMinimumValue, remainingHpMinumumPoke };
          oppTeamResult.tacticsResults.push(tacticsResult);
        });
        
        const bestTacticsIndex = Utils.maximumIndex<any>(oppTeamResult.tacticsResults, x => x.remainingHpMinimumValue);
        // const bestTactics = oppTeamResult.tacticsResults[bestTacticsIndex];
        const value = oppTeamResult.tacticsResults[bestTacticsIndex].remainingHpMinimumValue;
        oppTeamResult = Object.assign(oppTeamResult, {bestTacticsIndex, value});
        myTeamResult.oppTeamResults.push(oppTeamResult);
      });

      const strongestOppTeamIndex = Utils.minimumIndex<any>(myTeamResult.oppTeamResults, x => x.value);
      // const strongestOpp = myTeamResult.oppTeamResults[strongestOppTeamIndex];
      const value = myTeamResult.oppTeamResults[strongestOppTeamIndex].value;
      myTeamResult = Object.assign(myTeamResult, {strongestOppTeamIndex, value});
      result.myTeamResults.push(myTeamResult);
    });

    const strongestMyTeamIndex = Utils.maximumIndex<any>(result.myTeamResults, x => x.value);
    // const strongestMyTeam = result.myTeamResults[strongestMyTeamIndex];
    const value = result.myTeamResults[strongestMyTeamIndex].value;
    result = Object.assign(result, {strongestMyTeamIndex, value});

    result.myTeamResults.sort((a, b) => b.value - a.value); // higher values come first

    return result;
  }

  private filterAndSortStrVectorByTargets(vector: number[], targets: PokemonStrategy[]) {
    const newVector = targets.map(tar => {
      const columnIndex = this.targetPokeIds.findIndex(x => x === tar.id);
      if (columnIndex === -1) {
        throw new Error('Error: Target pokemon not found');
      }

      return vector[columnIndex];
    });

    return newVector;
  }

  private DetectOverused(tactics: TacticsPattern) {
    const remainingHpArray = this.remainingHp(tactics);
    const overused = remainingHpArray.filter(x => x.total < 0);
    return overused;
  }

  private remainingHp(tactics: TacticsPattern) {
    const remainingHpArray: Map<PokemonStrategy, number> = new Map();
    for (let i = 0; i < tactics.matchups.length; i++) {
      const maxi = tactics.matchups[i];
      if (remainingHpArray.get(maxi.player) === undefined) {
        remainingHpArray.set(maxi.player, 1024);
      }

      let currentHp = remainingHpArray.get(maxi.player);
      if (currentHp === undefined) {
        currentHp = 1024;
      }
      const updatedHp = currentHp - (1024 - maxi.value);
      remainingHpArray.set(maxi.player, updatedHp);
    }

    const overused: {player: PokemonStrategy, total: number}[] = [];
    remainingHpArray.forEach((value, key) => {
      overused.push({player: key, total: value});
    });

    return overused;
  }

  private allMatchupValues(teamPokemons: PokemonStrategy[], targetPokemons: PokemonStrategy[]): Matchup[] {
    const pokemonVectors = teamPokemons.map(pokeStrategy => {
      const row = this.strengthRows.find(x => x.strategyId === pokeStrategy.id);
      if (!row) {
        throw new Error('Error: team pokemon does not exist in strength rows');
      }

      const filteredVector = this.filterAndSortStrVectorByTargets(row.vector, targetPokemons);
      
      return filteredVector;
    });
    
    const matchups: Matchup[] = [];
    for (let i = 0; i < teamPokemons.length; i++) {
      for (let j = 0; j < targetPokemons.length; j++) {
        const matchup = {
          player: teamPokemons[i],
          opponent: targetPokemons[j],
          value: pokemonVectors[i][j]
        }    
        matchups.push(matchup);
      }      
    }

    return matchups;
  }

  private maximumImmunitiesTactics(matchups: Matchup[]): TacticsPattern {
    const tacticsMatchups: Matchup[] = [];

    const maximumMatchups = new Map<PokemonStrategy, Matchup>();
    matchups.forEach(matchup => {
      const currentMaximum = maximumMatchups.get(matchup.opponent);
      if (!currentMaximum) {
        maximumMatchups.set(matchup.opponent, matchup);
      } else {
        if (currentMaximum.value < matchup.value) {
          maximumMatchups.set(matchup.opponent, matchup);
        }
      }
    });

    maximumMatchups.forEach(value => {
      tacticsMatchups.push(value);
    })

    return { matchups: tacticsMatchups};
  }

  private allTacticsCombinations(matchups: Matchup[]): TacticsPattern[] {
    const oppPokemons: PokemonStrategy[] = [];
    matchups.forEach(x => {
      if (!oppPokemons.find(y => x.opponent.id === y.id)) {
        oppPokemons.push(x.opponent);
      }
    });

    let tacticsMatchups: Matchup[][] = [];
    oppPokemons.forEach(oppPokemon => {      
      const candidateMatchups = matchups.filter(x => x.opponent.id === oppPokemon.id);
      if (tacticsMatchups.length === 0) {
        tacticsMatchups = candidateMatchups.map(x => [x]);
      } else {
        tacticsMatchups = this.newDimensionalCombinations(tacticsMatchups, candidateMatchups);
      }
    });
    
    const tacticsCombinations = tacticsMatchups.map(x => ({ matchups: x }));
    return tacticsCombinations;
  }

  private newDimensionalCombinations<T>(currentCombinations: T[][], newDimension: T[]): T[][] {
    const newCombinations: T[][] = [];
    currentCombinations.forEach(x => {
      newDimension.forEach(y => {
        const newArray = x.concat();
        newArray.push(y);
        newCombinations.push(newArray);
      })
    });

    return newCombinations;   
  }
}