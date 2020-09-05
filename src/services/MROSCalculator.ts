import { SelectionEvaluator } from "./selectionEvaluator";
import * as Utils from './utils';
import PokemonStrategy from "../models/PokemonStrategy";
import { ResultAC, MyTeamResult, OppTeamResult } from "../models/ResultAc";
import TacticsPattern from "../models/TacticsPattern";
import Matchup from "../models/Matchup";

// Minimum Remaining hp to all Opponent Selections
export class MROSCalculator extends SelectionEvaluator {
  evaluate(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    const myTeamCombinations = Utils.threeOfSixCombinations(teamPokemons);
    const oppTeamCombinations = Utils.threeOfSixCombinations(opponentPokemons);

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