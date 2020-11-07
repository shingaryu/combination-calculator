import { SelectionEvaluator } from "./selectionEvaluator";
import * as Utils from './utils';
import PokemonStrategy from "../models/PokemonStrategy";
import BattleTeamSearchResult from "../models/BattleTeamSearchResult";
import Matchup from "../models/Matchup";
import TacticsPattern from "../models/TacticsPattern";

// Minimum Maximum to Opponent Pokemon
export class MMOPCalculator extends SelectionEvaluator {
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

  public maximumImmunitiesListOfMyTeam(teamPokemons: PokemonStrategy[], allTargets: PokemonStrategy[]): TacticsPattern {
    const matchups = this.allMatchupValues(teamPokemons, allTargets);
    const tactics = this.maximumImmunitiesTactics(matchups);

    return tactics;
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