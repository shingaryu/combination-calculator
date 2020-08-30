import React from 'react';
import { Container, Row, Col, Table, Tabs, Tab, Modal, Button, Form, InputGroup } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';
import { CombinationService } from '../services/combination-service';
import { GraphComponent } from './graphComponent';
import { defaultTeam } from '../defaultList';
import { BattleTeamDetailsComponent } from './battleTeamDetailsComponent';

type BattleTeamComponentProps = {
  sortedPokemonList: PokemonStrategy[],
  combinationService: CombinationService,
}

type BattleTeamComponentState = {
  myTeam: PokemonStrategy[],
  oppTeam: PokemonStrategy[],
  modalShow: boolean,
  selectedMyTeamIndex: number
}

export class BattleTeamComponent extends React.Component<BattleTeamComponentProps, BattleTeamComponentState> {
  constructor(props: BattleTeamComponentProps) {
    super(props);

    const pokeList = this.props.sortedPokemonList;

    this.state = { 
      myTeam: defaultTeam(pokeList),
      oppTeam: defaultTeam(pokeList),
      modalShow: false,
      selectedMyTeamIndex: -1
    };
  }

  static contextType = I18nContext;

  onSelectMyPokemons(index: number, pokemonId: string) {
    const myTeam = this.state.myTeam.concat();
    const poke = this.props.sortedPokemonList.find(x => x.id === pokemonId) || myTeam[index];
    myTeam[index] = poke;
    this.setState( { myTeam: myTeam});
  }

  onSelectOppPokemons(index: number, pokemonId: string) {
    const oppTeam = this.state.oppTeam.concat();
    const poke = this.props.sortedPokemonList.find(x => x.id === pokemonId) || oppTeam[index];
    oppTeam[index] = poke;
    this.setState( { oppTeam: oppTeam});
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
    const resultsAC = this.props.combinationService.calcTeamCombinationsToAllOpppnentsCombinations(this.state.myTeam, this.state.oppTeam);

    return (
    <>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <h4>My Team</h4>
            {
              this.state.myTeam.map((x, i) => (
                <InputGroup className="mb-2 mr-2" key={`sl-my-${i}`} style={{width: 190}}>
                  <Form.Control as="select" value={this.state.myTeam[i].id} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onSelectMyPokemons(i, e.target.value)}>
                    { this.props.sortedPokemonList.map(poke => (
                      <option key={`op-my-${poke.id}`} 
                        value={poke.id}>{translateSpeciesIfPossible(poke.species, t)}</option>
                    ))}
                  </Form.Control>
                </InputGroup>
              ))
            }
          </Col>
          <Col>
            <h4>Opponent's Team</h4>
            {
              this.state.oppTeam.map((x, i) => (
                <InputGroup className="mb-2 mr-2" key={`sl-opp-${i}`} style={{width: 190}}>
                  <Form.Control as="select" value={this.state.oppTeam[i].id}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onSelectOppPokemons(i, e.target.value)}>
                    { this.props.sortedPokemonList.map(poke => (
                      <option key={`op-opp-${poke.id}`} 
                        value={poke.id}>{translateSpeciesIfPossible(poke.species, t)}</option>
                    ))}
                  </Form.Control>
                </InputGroup>
              ))
            }
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
          <Tabs id="method-tabs" defaultActiveKey="tactics-minimax" className="mt-3">
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
                        {result.tacticsPattern?.matchups?.map((maximum, index) => {
                          const toTarget = maximum.opponent;
                          const fromPokemon = maximum.player;
                          const valueInt = Math.round(maximum.value);
                          return (
                            <div key={`em-${index}`}>{`To: ${translateSpeciesIfPossible(toTarget.species, t)} From: ${translateSpeciesIfPossible(fromPokemon.species, t)} Value: ${valueInt}`}</div>
                          );
                        })}
                      </td>
                      <td>
                        {result.overused?.map((info: any, index: number) => {
                          const fromPokemon = info.player;
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
            <Tab eventKey="tactics-minimax" title="Tactics Minimax">
              <h4 className="mt-3">Selections (Method: Tactics Minimax)</h4>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th key='h-i'>{t('search.columnRank')}</th>
                    {resultsAC.myTeamResults[0].myTeam.map((x, i) => 
                      <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)}
                    <th key='h-v'>Min. Value</th>
                    {/* <th key='h-t'>On Target</th> */}
                    {/* <th key='h-d'>Details</th> */}
                    {/* <th key='h-o'>Overused</th> */}
                    <th key='h-dt'>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsAC.myTeamResults.map((result, index) => (
                    <tr key={index}>
                      <td key={`${index}-i`}>{index + 1}</td>
                      {result.myTeam.map((x, i) => <td key={`${index}-p${i}`}>{translateSpeciesIfPossible(x.species, t)}</td>)}
                      <td key={`${index}-v`}>{result.value.toFixed(4)}</td>
                      <td key={`${index}-dt`}>
                        <Button variant="outline-dark" size="sm" onClick={() => this.setState({modalShow: true, selectedMyTeamIndex: index})}>Show</Button>
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
      <Modal size="lg" show={this.state.modalShow} onHide={() => this.setState({modalShow: false})}>
        <Modal.Header closeButton>
          <Modal.Title>Details: {this.state.selectedMyTeamIndex}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BattleTeamDetailsComponent resultAC={resultsAC} selectedMyTeamIndex={this.state.selectedMyTeamIndex} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => this.setState({modalShow: false})}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )};
}
