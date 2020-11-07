import { SelectionEvaluator } from "./selectionEvaluator";
import * as Utils from './utils';
import PokemonStrategy from "../models/PokemonStrategy";
import BattleTeamSearchResult from "../models/BattleTeamSearchResult";
import Matchup from "../models/Matchup";
import TacticsPattern from "../models/TacticsPattern";
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import { TFunction } from "i18next";

// Minimum Maximum to Opponent Pokemon
export class MMOPCalculator extends SelectionEvaluator {

  private randomOppGeneration = 1000;

  evaluate(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
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

  evaluateTeamToTargetIndividuals(teamPokemons: PokemonStrategy[], allTargets: PokemonStrategy[]): TacticsPattern {
    const matchups = this.allMatchupValues(teamPokemons, allTargets);
    const tactics = this.maximumImmunitiesTactics(matchups);

    return tactics;
  }

  evaluateTeamSelections(teamPokemons: PokemonStrategy[], allTargets: PokemonStrategy[], t: TFunction) {
    type battleTeamResult = {
      mySelection: PokemonStrategy[],
      value: number
    }

    const mmopResults = this.resultsWithRandomOpp(teamPokemons, allTargets)

    const battleTeamMap = new Map<string, battleTeamResult[]>();
    mmopResults.forEach(thisRepetition => {
      const bestSelection = thisRepetition[0];

      const key = this.battleTeamKey(bestSelection.pokemons);
      const value = battleTeamMap.get(key)
      if (!value) {
        battleTeamMap.set(key, [{ mySelection: bestSelection.pokemons, value: bestSelection.value}]);
      } else {
        value.push({ mySelection: bestSelection.pokemons, value: bestSelection.value});
        battleTeamMap.set(key, value);
      }
    });

    const statistics: any[] = [];
    battleTeamMap.forEach((value, key) => {
      const pokemons = value[0].mySelection;
      let sum = 0.0;
      value.forEach(v => sum += v.value);
      const expectation = sum / mmopResults.length;
      const mySelectionStr = pokemons.map(x => translateSpeciesIfPossible(x.species, t).substring(0, 2)).join(', ');
      const mySelectionFullStr = pokemons.map(x => translateSpeciesIfPossible(x.species, t)).join(', ');
      statistics.push({mySelection: pokemons, mySelectionStr: mySelectionStr, mySelectionFullStr: mySelectionFullStr,  expectation: expectation, appears: value.length});
    })

    statistics.sort((a, b) => {
      if (b.mySelectionStr < a.mySelectionStr) {
        return -1;
      } else if (a.mySelectionStr < b.mySelectionStr) {
        return 1;
      } else {
        return 0;
      }
    });

    return statistics;
  }

  evaluateTeamIndividuals(teamPokemons: PokemonStrategy[], allTargets: PokemonStrategy[]) {
    const staticticsInd: any[] = [];

    const mmopResults = this.resultsWithRandomOpp(teamPokemons, allTargets)

    teamPokemons.forEach(myPoke => {
      const myPokeValues: number[] = [];
      mmopResults.forEach(thisRepetition => {
        // thisRepetition.sort((a, b) => {
        //   return b.value - a.value;
        // })

        const bestSelection = thisRepetition[0];
        if (bestSelection.tacticsPattern?.matchups.find(x => x.player.id === myPoke.id)) {
          myPokeValues.push(bestSelection.value);
        }
      });

      let sum = 0.0;
      myPokeValues.forEach(v => sum += v);
      const expectation = sum / mmopResults.length;

      staticticsInd.push({myPoke: myPoke, expectation: expectation, appears: myPokeValues.length});
    })

    return staticticsInd;
  }

  private resultsWithRandomOpp(myTeam: PokemonStrategy[], allTargets: PokemonStrategy[]) {
    const mmopResults: BattleTeamSearchResult[][] = [];
    for (let i = 0; i < this.randomOppGeneration; i++) {
      const randomOpp = this.randomOppTeam(allTargets);
      const mmopResult = this.evaluate(myTeam, randomOpp);
      mmopResults.push(mmopResult);
    }

    return mmopResults;
  }

  private randomOppTeam(allTargets: PokemonStrategy[]) {
    let pokeList = allTargets.concat();
    const teamNum = 6;
    const team = [];
    if (pokeList.length < teamNum) {
      throw new Error("Team length must be longer than slots");
    }

    for (let i = 0; i < teamNum; i++) {
      const randomIndex = Math.floor(Math.random() * pokeList.length);
      team.push(pokeList[randomIndex]);
      const pokeId = pokeList[randomIndex].id;
      pokeList = pokeList.filter(x => x.id !== pokeId);
    }

    return team;
  }

  private battleTeamKey(pokemons: PokemonStrategy[]) {
    pokemons.sort((a, b) => {
      if (b.id < a.id) {
        return -1;
      } else if (a.id < b.id) {
        return 1;
      } else {
        return 0;
      }
    });

    return pokemons.map(x => x.id).join(":");

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

}