import { SelectionEvaluator } from "./selectionEvaluator";
import * as Utils from './utils';
import PokemonStrategy from "../models/PokemonStrategy";
import BattleTeamSearchResult from "../models/BattleTeamSearchResult";
import { masterDataService } from "./masterDataService";

// Minimum Average to Opponent Pokemon
export class MAOPCalculator extends SelectionEvaluator {
  evaluate(teamPokemons: PokemonStrategy[], opponentPokemons: PokemonStrategy[]) {
    const battleTeamCombinations = Utils.threeOfSixCombinations(teamPokemons);

    const results: BattleTeamSearchResult[] = [];
    battleTeamCombinations.forEach(pokemons => {
      const strValues = masterDataService.strValuesOfTeamStrategies(pokemons, opponentPokemons);
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

}