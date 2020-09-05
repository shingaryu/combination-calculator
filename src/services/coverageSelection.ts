import { SelectionEvaluator } from "./selectionEvaluator";
import * as Utils from './utils';
import PokemonStrategy from "../models/PokemonStrategy";
import { ResultWC, MyTeamResultWC } from "../models/ResultAc";

export class CoverageSelection extends SelectionEvaluator {

  evaluate(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    const matchupValueThreshold = 100;

    const myTeamCombinations = Utils.threeOfSixCombinations(teamPokemons);

    let result: ResultWC = { myTeamResults: [], strongestMyTeamIndex: -1, indivisualCoverage: 0};
    myTeamCombinations.forEach(myTeam => {
      const myTeamResultWC = this.calcMyTeamResultWC(myTeam, opponentPokemons, matchupValueThreshold);
      result.myTeamResults.push(myTeamResultWC);
    });

    const strongestMyTeamIndex = Utils.maximumIndex<MyTeamResultWC>(result.myTeamResults.filter(y => y.overallCoverage === 1), x => x.maximumCoverage);
    let indivisualCoverage = -1;
    if (strongestMyTeamIndex >= 0) {
      indivisualCoverage = result.myTeamResults[strongestMyTeamIndex].maximumCoverage;
      result = Object.assign(result, {strongestMyTeamIndex, indivisualCoverage});
    }

    result.myTeamResults.sort((a, b) => {
      if (b.overallCoverage < a.overallCoverage) {
        return -1;
      } else if (a.overallCoverage < b.overallCoverage) {
        return 1;
      } else {
        if (b.coverageNum < a.coverageNum) {
          return -1;
        } else if (a.coverageNum < b.coverageNum) {
          return 1;
        } else {
          if (b.maximumCoverage < a.maximumCoverage) {
            return -1;
          } else if (a.maximumCoverage < b.maximumCoverage) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    }); // higher values come first

    return result;
  }

}