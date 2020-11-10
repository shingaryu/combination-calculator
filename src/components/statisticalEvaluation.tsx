import React from 'react';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import { GraphComponent } from './graphComponent';
import PokemonStrategy from '../models/PokemonStrategy';
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

  render() {   
    const t = this.props.t;
    const mmopCalculator = new MMOPCalculator();

    const opponentMaximums = mmopCalculator.evaluateTeamToTargetIndividuals(this.props.myTeam, this.props.sortedPokemonList);
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
        dataLabel: t('graph.selectionUnit.legend'),
        values: opponentMaximums.matchups.map(x => parseInt(x.value.toFixed(0))),
        colorRGB: [76, 34, 32]
      }
    ];

    let graphLabelsExp: string[] = [];
    let graphDataSetsExp: any[] = [];
    let toolTipOptionsExp: (isVertical: boolean) => any = (isVertical: boolean) => {};

    let graphLabelsIndExp: string[] = [];
    let graphDataSetsIndExp: any[] = [];
    
    if (this.props.myTeam.length >= 3) {
      const statisticsExp = mmopCalculator.evaluateTeamSelections(this.props.myTeam, this.props.sortedPokemonList, t);
      graphLabelsExp = statisticsExp.map(x => x.selectionShortName);
      const fullStrListExp = statisticsExp.map(x => x.selectionFullName);
      graphDataSetsExp = [
        {
          dataLabel: t('graph.selectionEvaluation.legend'),
          values: statisticsExp.map(x => parseInt(x.value.toFixed(0))),
          colorRGB: [200, 99, 132]
        }
      ];
  
      toolTipOptionsExp = (isVertical: boolean) => ({
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
  
      const staticticsIndExp = mmopCalculator.evaluateTeamIndividuals(this.props.myTeam, this.props.sortedPokemonList);
      graphLabelsIndExp = staticticsIndExp.map(x => translateSpeciesIfPossible(x.pokemon.species, t));
      graphDataSetsIndExp = [
        {
          dataLabel: t('graph.individualEvaluation.legend'),
          values: staticticsIndExp.map(x => parseInt(x.value.toFixed(0))),
          colorRGB: [32, 99, 132]
        }
      ];
    }

    return (
      <>
        <Row>
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
        { this.props.myTeam.length >= 3 &&
          <>
            <Row className="mt-5">
              <Col>
                <h4>{t('graph.selectionEvaluation.title')}</h4>
                <div className="description-box mb-4" >
                  <div dangerouslySetInnerHTML={{__html: t('graph.selectionEvaluation.description')}} />
                  <div className="tips">・{t('graph.selectionEvaluation.tips1')}</div>
                  <div className="tips">・{t('graph.selectionEvaluation.tips2')}</div>
                </div>
                <GraphComponent labels={graphLabelsExp} datasets={graphDataSetsExp} heightVertical={300} widthVertical={800}
                  valueMin={-32} valueMax={64} valueStep={32} optionsBar={toolTipOptionsExp(true)} optionsHorizontal={toolTipOptionsExp(false)} />
              </Col>
            </Row>        
            <Row className="mt-5">
              <Col>
                <h4>{t('graph.individualEvaluation.title')}</h4>
                <div className="description-box mb-4" >
                  <div dangerouslySetInnerHTML={{__html: t('graph.individualEvaluation.description')}} />
                  <div className="tips">・{t('graph.individualEvaluation.tips1')}</div>
                </div>
                <GraphComponent labels={graphLabelsIndExp} datasets={graphDataSetsIndExp} heightVertical={300} widthVertical={800} 
                  valueMin={-128} valueMax={256} valueStep={128} xTicksRotation={0}/>
              </Col>
            </Row>       
          </> 
        }
      </>
    )

  }
}

export const StatisticalEvaluation = withTranslation()(StatisticalEvaluationRaw);
