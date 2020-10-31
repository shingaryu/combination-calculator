import React from 'react';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import { GraphComponent } from './graphComponent';
import PokemonStrategy from '../models/PokemonStrategy';
import BattleTeamSearchResult from '../models/BattleTeamSearchResult';
import { MMOPCalculator } from '../services/MMOPCalculator';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Col, Row } from 'react-bootstrap';

type StatisticalEvaluationProps = {
  myTeam: PokemonStrategy[],
  sortedPokemonList: PokemonStrategy[],
} & WithTranslation

type StatisticalEvaluationState = {

}

class StatisticalEvaluationRaw extends React.Component<StatisticalEvaluationProps, StatisticalEvaluationState> {
  constructor(props: StatisticalEvaluationProps) {
    super(props);
  }

  randomOppTeam() {
    let pokeList = this.props.sortedPokemonList.concat();
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

  battleTeamKey(pokemons: PokemonStrategy[]) {
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

  averageRateOfMyTeamSelections(mmopResults: BattleTeamSearchResult[][]) {
    type battleTeamResult = {
      mySelection: PokemonStrategy[],
      value: number
    }

    const battleTeamMap = new Map<string, battleTeamResult[]>();
    mmopResults.forEach(thisRepetition => {
      thisRepetition.forEach(thisSelection => {
        const key = this.battleTeamKey(thisSelection.pokemons);
        const value = battleTeamMap.get(key)
        if (!value) {
          battleTeamMap.set(key, [{ mySelection: thisSelection.pokemons, value: thisSelection.value}]);
        } else {
          value.push({ mySelection: thisSelection.pokemons, value: thisSelection.value});
          battleTeamMap.set(key, value);
        }
      })
    });

    const statistics: any[] = [];
    battleTeamMap.forEach((value, key) => {
      const pokemons = value[0].mySelection;
      let sum = 0.0;
      value.forEach(v => sum += v.value);
      const average = sum / value.length;
      const mySelectionStr = pokemons.map(x => translateSpeciesIfPossible(x.species, this.props.t).substring(0, 2)).join(', ');
      const mySelectionFullStr = pokemons.map(x => translateSpeciesIfPossible(x.species, this.props.t)).join(', ');
      statistics.push({mySelection: pokemons, mySelectionStr: mySelectionStr, mySelectionFullStr: mySelectionFullStr,  average: average, appears: value.length});
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

  averageRateOfMyTeamIndivisuals(mmopResults: BattleTeamSearchResult[][]) {
    const staticticsInd: any[] = [];

    this.props.myTeam.forEach(myPoke => {
      const myPokeValues: number[] = [];
      mmopResults.forEach(thisRepetition => {
        thisRepetition.forEach(thisSelection => {
          // myPoke is contributing to this opponents team in this my team selection
          if (thisSelection.tacticsPattern?.matchups.find(x => x.player.id === myPoke.id)) {
            myPokeValues.push(thisSelection.value);
          }
        })
      });

      let sum = 0.0;
      myPokeValues.forEach(v => sum += v);
      const average = sum / myPokeValues.length;

      staticticsInd.push({myPoke: myPoke, average: average, appears: myPokeValues.length});
    })

    return staticticsInd;
  }

  averageImmunitiesOfAllTargets(results: BattleTeamSearchResult[][]) {
    // all results for each target = all battles the target appears in
    const allTargets = new Map<string, PokemonStrategy>(); 
    const allResultsByTargets = new Map<string, BattleTeamSearchResult[]>();
    results.forEach(thisOppTeam => {
      thisOppTeam.forEach(thisSelection => {
        thisSelection.tacticsPattern?.matchups.forEach(thisMatchup => {
          const key = thisMatchup.opponent.id;
          const value = allResultsByTargets.get(key);
          if (!value) {
            allResultsByTargets.set(key, [thisSelection]);
            allTargets.set(key, thisMatchup.opponent);
          } else {
            value.push(thisSelection);
            allResultsByTargets.set(key, value);
          }   
        })
      })
    });

    const averages: any[] = [];
    allResultsByTargets.forEach((value, key) => {
      const oppPoke = allTargets.get(key);
      if (!oppPoke) {
        throw new Error('opponent pokemon not found!');
      }

      let sum = 0.0;
      value.forEach(x => sum += x.value);
      const average = sum / value.length;
      averages.push({ oppPoke, average});
    })

    averages.sort((a, b) => {
      const translatedA = translateSpeciesIfPossible(a.oppPoke.species, this.props.t);
      const translatedB = translateSpeciesIfPossible(b.oppPoke.species, this.props.t);
        if (translatedA < translatedB) {
          return -1;
        } else if (translatedB < translatedA) {
          return 1;
        } else {
          return 0;
        }
    })

    return averages;
  }

  render() {   
    const t = this.props.t;

    const mmopCalculator = new MMOPCalculator();
    const repetition = 1000;
    const mmopResults: BattleTeamSearchResult[][] = [];
    for (let i = 0; i < repetition; i++) {
      const randomOpp = this.randomOppTeam();
      const mmopResult = mmopCalculator.evaluate(this.props.myTeam, randomOpp);
      mmopResults.push(mmopResult);
    }

    const statistics = this.averageRateOfMyTeamSelections(mmopResults);
    const graphLabels = statistics.map(x => x.mySelectionStr);
    const fullStrList = statistics.map(x => x.mySelectionFullStr);
    const graphDataSets = [
      {
        dataLabel: t('graph.averageValueAmongAllSelections'),
        values: statistics.map(x => x.average.toFixed(0)),
        colorRGB: [128, 99, 132]
      }
    ];

    const toolTipOptions = (isVertical: boolean) => ({
      tooltips: {
        callbacks: {
          label: (tooltipItem: any, data: any) => {
            const fullLabel = fullStrList[tooltipItem.index];
            var label = data.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
                label += ': ';
            }
            label += isVertical? tooltipItem.yLabel: tooltipItem.xLabel;
            return [fullLabel, label];
        }
        }
      }
    });

    const staticticsInd = this.averageRateOfMyTeamIndivisuals(mmopResults);
    const graphLabelsInd = staticticsInd.map(x => translateSpeciesIfPossible(x.myPoke.species, t));
    const graphDataSetsInd = [
      {
        dataLabel: t('graph.averageValueAmongAllSelections'),
        values: staticticsInd.map(x => x.average.toFixed(0)),
        colorRGB: [76, 99, 132]
      }
    ];

    const opponentAverages = this.averageImmunitiesOfAllTargets(mmopResults);
    const opponentGraphlabels = opponentAverages.map((x: any) => translateSpeciesIfPossible(x.oppPoke.species, t));
    const opponentDatasets = [
      {
        dataLabel: t('graph.averageValueAmongAllSelections'),
        values: opponentAverages.map(x => x.average.toFixed(0)),
        colorRGB: [76, 99, 32]
      }
    ];

    return (
      <>
        <Row className="mt-5">
          <Col>
            <h4>{t('graph.selectionUnit.title')}</h4>
            <div className="description-box mb-4" >
              <div dangerouslySetInnerHTML={{__html: t('graph.selectionUnit.description')}} />
              <div className="tips">・{t('graph.selectionUnit.tips1')}</div>
            </div>            
            <GraphComponent labels={opponentGraphlabels} datasets={opponentDatasets}
              valueMin={-128} valueMax={128} valueStep={64} />          
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <h4>{t('graph.selectionEvaluation.title')}</h4>
            <div className="description-box mb-4" >
              <div dangerouslySetInnerHTML={{__html: t('graph.selectionEvaluation.description')}} />
              <div className="tips">・{t('graph.selectionEvaluation.tips1')}</div>
              <div className="tips">・{t('graph.selectionEvaluation.tips2')}</div>
            </div>
            <GraphComponent labels={graphLabels} datasets={graphDataSets} heightVertical={300} widthVertical={800}
              valueMin={-256} valueMax={256} valueStep={128} optionsBar={toolTipOptions(true)} optionsHorizontal={toolTipOptions(false)} />
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <h4>{t('graph.individualEvaluation.title')}</h4>
            <div className="description-box mb-4" >
              <div dangerouslySetInnerHTML={{__html: t('graph.individualEvaluation.description')}} />
              <div className="tips">・{t('graph.individualEvaluation.tips1')}</div>
            </div>
            <GraphComponent labels={graphLabelsInd} datasets={graphDataSetsInd} heightVertical={300} widthVertical={800} 
              valueMin={-128} valueMax={128} valueStep={64} xTicksRotation={0}/>
          </Col>
        </Row>
      </>
    )

  }
}

export const StatisticalEvaluation = withTranslation()(StatisticalEvaluationRaw);
