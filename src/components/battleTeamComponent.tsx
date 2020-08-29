import React from 'react';
import { Container, Row, Col, Table, Tabs, Tab } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import { TeamComponent } from './TeamComponent';
import PokemonStrategy from '../models/PokemonStrategy';
import { CombinationService } from '../services/combination-service';
import { GraphComponent } from './graphComponent';

type BattleTeamComponentProps = {
  sortedPokemonList: PokemonStrategy[],
  combinationService: CombinationService,
}

type BattleTeamComponentState = {
  myTeam: PokemonStrategy[],
  oppTeam: PokemonStrategy[]
}

export class BattleTeamComponent extends React.Component<BattleTeamComponentProps, BattleTeamComponentState> {
  constructor(props: BattleTeamComponentProps) {
    super(props);

    const pokeList = this.props.sortedPokemonList;

    this.state = { 
      myTeam: [pokeList[0], pokeList[49], pokeList[33], pokeList[12], pokeList[43], pokeList[39]],
      oppTeam: [pokeList[0], pokeList[49], pokeList[33], pokeList[12], pokeList[43], pokeList[39]],
    };
  }

  static contextType = I18nContext;

  onChangeMyPokemons(pokemons: PokemonStrategy[]) {
    this.setState({ myTeam: pokemons });
  }

  onChangeOppPokemons(pokemons: PokemonStrategy[]) {
    this.setState({ oppTeam: pokemons });
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    const graphLabels = this.state.oppTeam.map(x => translateSpeciesIfPossible(x.species, t));
    const graphDataSets = this.state.myTeam.map((myPoke, i) => {
      const strValues = this.props.combinationService.strValuesOfTeamStrategies([myPoke], this.state.oppTeam);
      const graphDataset = {
        dataLabel: translateSpeciesIfPossible(myPoke.species, t),
        values: strValues,
        colorRGB: [255 / (this.state.myTeam.length - 1) * i, 99, 132]
      };

      return graphDataset;
    })

    const chartOptionsBar = {
      scales: {
        yAxes: [{
          ticks: {
            min: -1024,
            max: 1024,
            stepSize: 512
          }
        }]
      }
    }

    const resultsAM = this.props.combinationService.calcTeamCombinationsOnAverageWeakest(this.state.myTeam, this.state.oppTeam);
    const resultsMM = this.props.combinationService.calcTeamCombinationsOnMaximumWeakest(this.state.myTeam, this.state.oppTeam);

    return (
    <>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <h4>My Team</h4>
            <TeamComponent num={6} pokemonList={this.props.sortedPokemonList} onChange={(pokemons) => this.onChangeMyPokemons(pokemons)}></TeamComponent>
          </Col>
          <Col>
            <h4>Opponent's Team</h4>
            <TeamComponent num={6} pokemonList={this.props.sortedPokemonList} onChange={(pokemons) => this.onChangeOppPokemons(pokemons)}></TeamComponent>
          </Col>
        </Row>
        <Row>
          <Col>
            <h4>Individual strength values to the opponent team</h4>
            <GraphComponent labels={graphLabels} datasets={graphDataSets} heightVertical={200} widthVertical={800} optionsBar={chartOptionsBar} />
          </Col>
        </Row>
        <Row>
          <Col>
          <Tabs id="method-tabs" defaultActiveKey="maximum-minimum" className="mt-3">
            <Tab eventKey="average-minimum" title="Average Minimum">
              <h4 className="mt-3">Selections (Method: Average Minimum)</h4>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th key='h-i'>{t('search.columnRank')}</th>
                    {resultsAM.length===0?
                      <th key={`h-p0`}>Pokemon</th>:
                      resultsAM[0].pokemons.map((x, i) => <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)
                    }
                    <th key='h-v'>Min. Value</th>
                    <th key='h-t'>On Target</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsAM.map((result, index) => (
                    <tr key={index}>
                      <td key={`${index}-i`}>{index + 1}</td>
                      {result.pokemons.map((x, i) => <td key={`${index}-p${i}`}>{translateSpeciesIfPossible(x.species, t)}</td>)}
                      <td key={`${index}-v`}>{result.value.toFixed(4)}</td>
                      <td key={`${index}-tn`}>{translateSpeciesIfPossible(result.minimumValueTargetPoke.species ?? '', t)}</td>
                    </tr>                
                  ))}
                </tbody>
              </Table> 
            </Tab>
            <Tab eventKey="maximum-minimum" title="Maximum Minimum">
              <h4 className="mt-3">Selections (Method: Maximum Minimum)</h4>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th key='h-i'>{t('search.columnRank')}</th>
                    {resultsMM.length===0?
                      <th key={`h-p0`}>Pokemon</th>:
                      resultsMM[0].pokemons.map((x, i) => <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)
                    }
                    <th key='h-v'>Min. Value</th>
                    <th key='h-t'>On Target</th>
                    <th key='h-d'>Details</th>
                    <th key='h-o'>Overused</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsMM.map((result, index) => (
                    <tr key={index}>
                      <td key={`${index}-i`}>{index + 1}</td>
                      {result.pokemons.map((x, i) => <td key={`${index}-p${i}`}>{translateSpeciesIfPossible(x.species, t)}</td>)}
                      <td key={`${index}-v`}>{result.value.toFixed(4)}</td>
                      <td key={`${index}-tn`}>{translateSpeciesIfPossible(result.minimumValueTargetPoke.species ?? '', t)}</td>
                      <td>
                        {result.eachMaximums?.map((maximum, index) => {
                          const toTarget = maximum.to;
                          const fromPokemon = maximum.from;
                          const valueInt = Math.round(maximum.value);
                          return (
                            <div key={`em-${index}`}>{`To: ${translateSpeciesIfPossible(toTarget.species, t)} From: ${translateSpeciesIfPossible(fromPokemon.species, t)} Value: ${valueInt}`}</div>
                          );
                        })}
                      </td>
                      <td>
                        {result.overused?.map((info: any, index: number) => {
                          const fromPokemon = info.from;
                          const valueInt = Math.round(info.total);
                          return (
                            <div key={`ou-${index}`}>{`${translateSpeciesIfPossible(fromPokemon.species, t)}: ${valueInt}`}</div>
                          );
                        })}
                      </td>
                    </tr>                
                  ))}
                </tbody>
              </Table> 
            </Tab>
          </Tabs>
          </Col>
        </Row>
      </Container>
    </>
  )};
}
