import { SelectionEvaluator } from "./selectionEvaluator";
import * as Utils from './utils';
import * as math from 'mathjs';
import PokemonStrategy from "../models/PokemonStrategy";

type CoverageMatrixRecord = {
  myTeam: PokemonStrategy[], 
  oppTeam: PokemonStrategy[], 
  myTeamCoverage: number, 
  oppTeamCoverage: number
  isMyTeamDominant: boolean,
  isOppTeamDominant: boolean
}

// CoVerage Nash Equilibrium
export class CVNECalculator extends SelectionEvaluator {
   evaluate(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    const coverageMatrix = this.calcCoverageMatrix(teamPokemons, opponentPokemons);
    // const myTeamCoefMatrix = this.calcMyTeamCoefficientMatrix(coverageMatrix);
    // const oppTeamCoefMatrix = this.calcOppTeamCoefficientMatrix(coverageMatrix);
    // try {
    //   const myTeamInverseMatrix = this.calcInverseMatrix(myTeamCoefMatrix);
    //   const oppTeamInverseMatrix = this.calcInverseMatrix(oppTeamCoefMatrix);

    //   const myTeamB = [];
    //   for (let i = 0; i < myTeamInverseMatrix.length -1; i++) {
    //     myTeamB.push(0);        
    //   }
    //   myTeamB.push(1);
    //   const myTeamProbablities = math.multiply(myTeamB, myTeamInverseMatrix);
    //   console.log(myTeamProbablities)
    //   return myTeamProbablities;

    // } catch (e) {
    //   console.log(e);
    // }

    return coverageMatrix;
  }

  private calcPureNashEquilibriums(gainMatrix: CoverageMatrixRecord[][]) {
    // mark player strategies
    for (let i = 0; i < gainMatrix[0].length; i++) {
      let maximum = Number.MIN_SAFE_INTEGER;
      for (let j = 0; j < gainMatrix.length; j++) {
        if (gainMatrix[j][i].myTeamCoverage > maximum) {
          maximum = gainMatrix[j][i].myTeamCoverage;
        }
      }

      for (let j = 0; j < gainMatrix.length; j++) {
        if (gainMatrix[j][i].myTeamCoverage === maximum) {
          gainMatrix[j][i].isMyTeamDominant = true;
        }
      }
    }

    // mark opponent strategies
    for (let i = 0; i < gainMatrix.length; i++) {
      let maximum = Number.MIN_SAFE_INTEGER;
      for (let j = 0; j < gainMatrix[i].length; j++) {
        if (gainMatrix[i][j].oppTeamCoverage > maximum) {
          maximum = gainMatrix[i][j].oppTeamCoverage;
        }
      }

      for (let j = 0; j < gainMatrix[i].length; j++) {
        if (gainMatrix[i][j].oppTeamCoverage === maximum) {
          gainMatrix[i][j].isOppTeamDominant = true;
        }
      }
    }
  }

  private calcCoverageMatrix(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    const matchupValueThreshold = 100;

    const myTeamCombinations = Utils.threeOfSixCombinations(teamPokemons).slice(0, 20);
    const oppTeamCombinations = Utils.threeOfSixCombinations(opponentPokemons).slice(0, 20);

    // const myTeamCombinations = Utils.threeOfSixCombinations(teamPokemons);
    // const oppTeamCombinations = Utils.threeOfSixCombinations(opponentPokemons);

    let result: CoverageMatrixRecord[][] = [];
    myTeamCombinations.forEach(myTeam => {
      const myTeamRecords: any[] = [];
      oppTeamCombinations.forEach(oppTeam => {
        const myTeamResultWCFromMySide = this.calcMyTeamResultWC(myTeam, oppTeam, matchupValueThreshold);
        const myTeamResultWCFromOppSide = this.calcMyTeamResultWC(oppTeam, myTeam, matchupValueThreshold);
       
        // const rand1 = Math.random() * 0.1 + 0.95;
        // const rand2 = Math.random() * 0.1 + 0.95;
        const record = { myTeam, oppTeam, myTeamCoverage: myTeamResultWCFromMySide.coverageNum, oppTeamCoverage: myTeamResultWCFromOppSide.coverageNum, 
          overallCoverageMyTeam: myTeamResultWCFromMySide.overallCoverage, overallCoverageOppTeam: myTeamResultWCFromOppSide.overallCoverage,
          isMyTeamDominant: false, isOppTeamDominant: false };
        myTeamRecords.push(record);
      });

      result.push(myTeamRecords);
    });

    this.calcPureNashEquilibriums(result);
    return result;
  }

  // to solve my team probabilities which make payoffs of all opp team selections equal
  private calcMyTeamCoefficientMatrix(cov: CoverageMatrixRecord[][]) {
    const matrix: number[][] = [];
    for (let i = 0; i < cov[0].length; i++) {
      const row: number[] = []
      for (let j = 0; j < cov.length; j++) {
        let coef: number = 0;
        if (i === cov[0].length - 1) {
          coef = 1;
        } else {
          coef = cov[j][i].oppTeamCoverage - cov[j][i + 1].oppTeamCoverage;
        }
        row.push(coef);
      }
      matrix.push(row);
    }

    return matrix;
  }

  // to solve opp team probabilities which make payoffs of all my team selections equal
  private calcOppTeamCoefficientMatrix(cov: CoverageMatrixRecord[][]) {
    const matrix: number[][] = [];
    for (let i = 0; i < cov.length; i++) {     
      const row: number[] = []
      for (let j = 0; j < cov[i].length; j++) {
        let coef: number = 0;
        if (i === cov.length - 1) {
          coef = 1;
        } else {
          coef = cov[i][j].myTeamCoverage - cov[i + 1][j].myTeamCoverage;
        }
        row.push(coef);
      }
      matrix.push(row);
    }

    return matrix;
  }

  // private calcInverseMatrix(mat: number[][]) {
  //   return math.inv(mat);
  // }

}