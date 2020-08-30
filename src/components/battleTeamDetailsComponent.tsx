import React from 'react';
import { ResultAC } from '../models/ResultAc';
import { GraphComponent } from './graphComponent';
import { Table } from 'react-bootstrap';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import { I18nContext } from 'react-i18next';

type BattleTeamDetailsProps = {
  resultAC: ResultAC,
  selectedMyTeamIndex: number
}

type BattleTeamDetailsState = {
  selectedOppTeamIndex: number,
}

export class BattleTeamDetailsComponent extends React.Component<BattleTeamDetailsProps, BattleTeamDetailsState> {
  constructor(props: BattleTeamDetailsProps) {
    super(props);

    this.state = { 
      selectedOppTeamIndex: this.props.resultAC.myTeamResults[this.props.selectedMyTeamIndex].strongestOppTeamIndex
    };
  }

  static contextType = I18nContext;

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    const selectedMyTeamResult = this.props.resultAC.myTeamResults[this.props.selectedMyTeamIndex];
    // const allOppTeamLabels = selectedMyTeamResult.oppTeamResults.map(x => x.oppTeam.map(y => y.species).join(', '));
    const allOppTeamLabels = selectedMyTeamResult.oppTeamResults.map((x, i) => `Selection ${i + 1}`);
    const allOppTeamDatasets = [
      {
        dataLabel: 'Minimum remaining HP',
        values: selectedMyTeamResult.oppTeamResults.map(x => Math.round(x.value)),
        colorRGB: [255, 99, 132]
      }
    ]

    const graphOptions = {
      scales: {
        xAxes: [{
          ticks: {
            minRotation: 60,
            maxRotation: 60
          }
        }],
        yAxes: [{
          ticks: {
            min: -1024,
            max: 1024,
            stepSize: 512
          }
        }]
      }
    }
    return (
      <>
        <h4>Minimum Remaining HP for Each Opponent Selection</h4>
        <GraphComponent labels={allOppTeamLabels} datasets={allOppTeamDatasets} optionsBar={graphOptions}
          widthVertical={700} heightVertical={250} />
        {/* <GraphComponent labels={allTacticsLabels} datasets={allTacticsDatasets} optionsBar={graphOptions}/> */}
        <h4 className="mt-3">Tactics for Each Opponent Selection</h4>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th key='h-i'>Index</th>
                {selectedMyTeamResult.oppTeamResults[0].oppTeam.map((x, i) => 
                <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)}
              <th key='h-v'>Min.</th>
              <th key='h-dt'>Tactics</th>
            </tr>
          </thead>
          <tbody>
            {selectedMyTeamResult.oppTeamResults.map((result, index) => (
              <tr key={index}>
                <td key={`${index}-i`}>{index + 1}</td>
                {result.oppTeam.map((x, i) => <td key={`${index}-p${i}`}>{translateSpeciesIfPossible(x.species, t)}</td>)}
                <td key={`${index}-v`}>{result.value.toFixed(4)}</td>
                <td key={`${index}-dt`} style={{fontSize: "small"}}>
                  {result.tacticsResults[result.bestTacticsIndex].tactics.matchups.map((x, i) => {
                    const playerSpecies = translateSpeciesIfPossible(x.player.species, t);
                    const opponentSpecies = translateSpeciesIfPossible(x.opponent.species, t);

                    return <div key={`${index}-dt-${i}`}>{`${playerSpecies} -> ${opponentSpecies}: ${x.value.toFixed(0)}`}</div>
                  })}
                </td>
              </tr>                
            ))}
          </tbody>
        </Table> 
      </>
    )
  }
}