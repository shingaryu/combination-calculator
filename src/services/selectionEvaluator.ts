import { masterDataService } from "./masterDataService";
import PokemonStrategy from "../models/PokemonStrategy";
import Matchup from "../models/Matchup";
import StrengthRow from "./StrengthRow";
import * as Utils from './utils';
import TacticsPattern from "../models/TacticsPattern";

export class SelectionEvaluator {
  protected strengthRows: StrengthRow[]

  constructor() {
    this.strengthRows = masterDataService.getStrengthRows();
  }

  evaluate(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    throw new Error('Method must be overidden by a sub class');
  }

  public allMatchupValues(teamPokemons: PokemonStrategy[], targetPokemons: PokemonStrategy[]): Matchup[] {
    const pokemonVectors = teamPokemons.map(pokeStrategy => {
      const row = this.strengthRows.find(x => x.strategyId === pokeStrategy.id);
      if (!row) {
        throw new Error('Error: team pokemon does not exist in strength rows');
      }

      const filteredVector = masterDataService.filterAndSortStrVectorByTargets(row.vector, targetPokemons);
      
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

  protected DetectOverused(tactics: TacticsPattern) {
    const remainingHpArray = this.remainingHp(tactics);
    const overused = remainingHpArray.filter(x => x.total < 0);
    return overused;
  }

  protected remainingHp(tactics: TacticsPattern) {
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

  protected calcMyTeamResultWC(myTeam: PokemonStrategy[], opponentPokemons: PokemonStrategy[], matchupValueThreshold: number) {
    const allMatchups = this.allMatchupValues(myTeam, opponentPokemons);
    // const advantageousMatchups = this.calcAdvantageousMatchups(allMatchups, matchupValueThreshold);
    let advantageousMatchups: { poke: PokemonStrategy, matchups: Matchup[] }[] = [];

    const maps = new Map<PokemonStrategy, Matchup[]>();
    allMatchups.forEach(matchup => {
      if (matchup.value < matchupValueThreshold) {
        return;
      }

      const value = maps.get(matchup.player);
      if (!value) {
        maps.set(matchup.player, [matchup]);
      } else {
        const matchups = value.concat();
        matchups.push(matchup);
        maps.set(matchup.player, matchups);
      }
    });

    maps.forEach((value, key) => {
      advantageousMatchups.push({poke: key, matchups: value});
    })

    const allOpponents: PokemonStrategy[] = [];
    advantageousMatchups.forEach(x => x.matchups.forEach(y => allOpponents.push(y.opponent)));

    if (advantageousMatchups.length === 0) {
      const myTeamResultWC = { myTeam, advantageousMatchups, maximumCoveragePokemonIndex: 0, maximumCoverage: 0, 
        coverageNum: 0, overallCoverage: 0, evaluationValue: 0 };
      return myTeamResultWC;
    }

    const uniqueOpponents = Array.from(new Set(allOpponents));

    const overallCoverage = uniqueOpponents.length / opponentPokemons.length;
    const maximumCoveragePokemonIndex = Utils.maximumIndex(advantageousMatchups, x => x.matchups.length);
    // if (maximumCoveragePokemonIndex === -1) {
    //   throw new Error("Error: maximum coverage pokemon index cannot be calculated!")
    // }
    const maximumCoverage = advantageousMatchups[maximumCoveragePokemonIndex].matchups.length;
    let coverageNum = 0;
    advantageousMatchups.forEach(x => coverageNum += x.matchups.length);
    const evaluationValue = overallCoverage * 1000 + coverageNum * 10 + maximumCoverage * 1;
    const myTeamResultWC = { myTeam, advantageousMatchups, maximumCoveragePokemonIndex, maximumCoverage, coverageNum, overallCoverage, evaluationValue };

    // const myTeamResultWC = this.myTeamResultWCFromAdvantageousMatchups(myTeam, opponentPokemons, advantageousMatchups);

    return myTeamResultWC;
  }
}