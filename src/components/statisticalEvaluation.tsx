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

  render() {   
    const t = this.props.t;

    const mmopCalculator = new MMOPCalculator();
    const repetition = 1000;
    const mmopResults: BattleTeamSearchResult[][] = [];
    for (let i = 0; i < repetition; i++) {
      const randomOpp = mmopCalculator.randomOppTeam(this.props.sortedPokemonList);
      const mmopResult = mmopCalculator.evaluate(this.props.myTeam, randomOpp);
      mmopResults.push(mmopResult);
    }

    const statistics = mmopCalculator.averageRateOfMyTeamSelections(mmopResults, t);
    const graphLabels = statistics.map(x => x.mySelectionStr);
    const fullStrList = statistics.map(x => x.mySelectionFullStr);
    const graphDataSets = [
      {
        dataLabel: t('graph.averageValueAmongAllSelections'),
        values: statistics.map(x => x.average.toFixed(0)),
        colorRGB: [128, 99, 132]
      }
    ];

    const statisticsExp = mmopCalculator.expectationOfMyTeamSelections(mmopResults, t);
    const graphLabelsExp = statisticsExp.map(x => x.mySelectionStr);
    const fullStrListExp = statisticsExp.map(x => x.mySelectionFullStr);
    const graphDataSetsExp = [
      {
        dataLabel: t('graph.averageValueAmongAllSelections'),
        values: statisticsExp.map(x => x.expectation.toFixed(0)),
        colorRGB: [200, 99, 132]
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

    const toolTipOptionsExp = (isVertical: boolean) => ({
      tooltips: {
        callbacks: {
          label: (tooltipItem: any, data: any) => {
            const fullLabel = fullStrListExp[tooltipItem.index];
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

    const staticticsInd = mmopCalculator.averageRateOfMyTeamIndivisuals(this.props.myTeam, mmopResults);
    const graphLabelsInd = staticticsInd.map(x => translateSpeciesIfPossible(x.myPoke.species, t));
    const graphDataSetsInd = [
      {
        dataLabel: t('graph.averageValueAmongAllSelections'),
        values: staticticsInd.map(x => x.average.toFixed(0)),
        colorRGB: [76, 99, 132]
      }
    ];

    const staticticsIndExp = mmopCalculator.expectationOfMyTeamIndivisuals(this.props.myTeam, mmopResults);
    const graphLabelsIndExp = staticticsIndExp.map(x => translateSpeciesIfPossible(x.myPoke.species, t) + ` (${x.appears})`);
    const graphDataSetsIndExp = [
      {
        dataLabel: t('graph.averageValueAmongAllSelections'),
        values: staticticsIndExp.map(x => x.expectation.toFixed(0)),
        colorRGB: [32, 99, 132]
      }
    ];

    const opponentAverages = mmopCalculator.averageImmunitiesOfAllTargets(mmopResults, t);
    const opponentGraphlabels = opponentAverages.map((x: any) => translateSpeciesIfPossible(x.oppPoke.species, t));
    const opponentDatasets = [
      {
        dataLabel: t('graph.averageValueAmongAllSelections'),
        values: opponentAverages.map(x => x.average.toFixed(0)),
        colorRGB: [76, 99, 32]
      }
    ];

    const opponentMaximums = mmopCalculator.maximumImmunitiesListOfMyTeam(this.props.myTeam, this.props.sortedPokemonList);
    opponentMaximums.matchups.sort((a, b) => {
      const translatedA = translateSpeciesIfPossible(a.opponent.species, this.props.t);
      const translatedB = translateSpeciesIfPossible(b.opponent.species, this.props.t);
        if (translatedA < translatedB) {
          return -1;
        } else if (translatedB < translatedA) {
          return 1;
        } else {
          return 0;
        }
    })
    const maximumxGraphLabels = opponentMaximums.matchups.map(x => translateSpeciesIfPossible(x.opponent.species, t));
    const maximumDatasets = [
      {
        dataLabel: t('graph.averageValueAmongAllSelections'),
        values: opponentMaximums.matchups.map(x => parseInt(x.value.toFixed(0))),
        colorRGB: [76, 34, 32]
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
            <GraphComponent labels={maximumxGraphLabels} datasets={maximumDatasets}
              valueMin={-256} valueMax={1024} valueStep={256} />          
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
            <h4>{t('graph.selectionEvaluation.title')}</h4>
            <div className="description-box mb-4" >
              <div dangerouslySetInnerHTML={{__html: t('graph.selectionEvaluation.description')}} />
              <div className="tips">・{t('graph.selectionEvaluation.tips1')}</div>
              <div className="tips">・{t('graph.selectionEvaluation.tips2')}</div>
            </div>
            <GraphComponent labels={graphLabelsExp} datasets={graphDataSetsExp} heightVertical={300} widthVertical={800}
              valueMin={-64} valueMax={128} valueStep={64} optionsBar={toolTipOptionsExp(true)} optionsHorizontal={toolTipOptionsExp(false)} />
          </Col>
        </Row>        
        {/* <Row className="mt-5">
          <Col>
            <h4>{t('graph.individualEvaluation.title')}</h4>
            <div className="description-box mb-4" >
              <div dangerouslySetInnerHTML={{__html: t('graph.individualEvaluation.description')}} />
              <div className="tips">・{t('graph.individualEvaluation.tips1')}</div>
            </div>
            <GraphComponent labels={graphLabelsInd} datasets={graphDataSetsInd} heightVertical={300} widthVertical={800} 
              valueMin={-128} valueMax={128} valueStep={64} xTicksRotation={0}/>
          </Col>
        </Row> */}
        <Row className="mt-5">
          <Col>
            <h4>{t('graph.individualEvaluation.title')}</h4>
            <div className="description-box mb-4" >
              <div dangerouslySetInnerHTML={{__html: t('graph.individualEvaluation.description')}} />
              <div className="tips">・{t('graph.individualEvaluation.tips1')}</div>
            </div>
            <GraphComponent labels={graphLabelsIndExp} datasets={graphDataSetsIndExp} heightVertical={300} widthVertical={800} 
              valueMin={-128} valueMax={512} valueStep={128} xTicksRotation={0}/>
          </Col>
        </Row>        
      </>
    )

  }
}

export const StatisticalEvaluation = withTranslation()(StatisticalEvaluationRaw);
