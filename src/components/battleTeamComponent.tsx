import React from 'react';
import { Container, Row, Col, Table, Tabs, Tab, Modal, Button } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';
// import { masterDataService } from '../services/masterDataService';
// import { GraphComponent } from './graphComponent';
import { defaultTeam } from '../defaultList';
import { BattleTeamDetailsComponent } from './battleTeamDetailsComponent';
import { SimpleTeamComponent } from './simpleTeamComponent';
import { MROSCalculator } from '../services/MROSCalculator';
import { CVRGCalculator } from '../services/CVRGCalculator';
import { CVNECalculator } from '../services/CVNECalculator';
import { MMOPDetails } from './MMOPDetails';
import BattleTeamSearchResult from '../models/BattleTeamSearchResult';
import Matchup from '../models/Matchup';
import { MMOPResults } from './MMOPResults';
import { MAOPResults } from './MAOPResults';

type BattleTeamComponentProps = {
  myTeam: PokemonStrategy[],
  sortedPokemonList: PokemonStrategy[],
}

type BattleTeamComponentState = {
  oppTeam: PokemonStrategy[],
  modalShow: boolean,
  selectedMyTeamIndex: number,
  mmopModalShow: boolean,
  mmopModalIndex: number,
  mmopDetailsProps: any
}

export class BattleTeamComponent extends React.Component<BattleTeamComponentProps, BattleTeamComponentState> {
  constructor(props: BattleTeamComponentProps) {
    super(props);

    const pokeList = this.props.sortedPokemonList;

    this.state = { 
      oppTeam: defaultTeam(pokeList),
      modalShow: false,
      selectedMyTeamIndex: -1,
      mmopDetailsProps: {},
      mmopModalIndex: -1,
      mmopModalShow: false
    };
  }

  static contextType = I18nContext;

  onChangeOppPokemons(pokemons: PokemonStrategy[]) {
    this.setState({ oppTeam: pokemons });
  }

  onMMOPDetailClick(index: number, result: BattleTeamSearchResult, matchups: Matchup[]) {
    const mmopDetailsProps: any = {
      index: index,
      result: result,
      myTeam: this.props.myTeam,
      oppTeam: this.state.oppTeam,
      matchups: matchups
    }
    this.setState({ mmopModalIndex: index, mmopModalShow: true, mmopDetailsProps: mmopDetailsProps});
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    // const graphLabels = this.state.oppTeam.map(x => translateSpeciesIfPossible(x.species, t));
    // const graphDataSets = this.props.myTeam.map((myPoke, i) => {
    //   const strValues = masterDataService.strValuesOfTeamStrategies([myPoke], this.state.oppTeam);
    //   const graphDataset = {
    //     dataLabel: translateSpeciesIfPossible(myPoke.species, t),
    //     values: strValues,
    //     colorRGB: [255 / (this.props.myTeam.length - 1) * i, 99, 132]
    //   };

    //   return graphDataset;
    // })

    // const chartOptionsBar = {
    //   scales: {
    //     yAxes: [{
    //       ticks: {
    //         min: -1024,
    //         max: 1024,
    //         stepSize: 512
    //       }
    //     }]
    //   }
    // }

    const mrosCalculator = new MROSCalculator();
    const cvrgCalculator = new CVRGCalculator();
    const cvneCalculator = new CVNECalculator();
    
    const resultsAC = mrosCalculator.evaluate(this.props.myTeam, this.state.oppTeam);
    const resultsWC = cvrgCalculator.evaluate(this.props.myTeam, this.state.oppTeam);
    const resultsNA = cvneCalculator.evaluate(this.props.myTeam, this.state.oppTeam);

    const myTeamToString = this.state.selectedMyTeamIndex !== -1 ? resultsAC.myTeamResults[this.state.selectedMyTeamIndex].myTeam.map(x => translateSpeciesIfPossible(x.species, t)).join(', '): '';

    return (
    <>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <h4>Opponent's Team</h4>
            <SimpleTeamComponent num={6} pokemonList={this.props.sortedPokemonList} onChange={(pokemons) => this.onChangeOppPokemons(pokemons)}></SimpleTeamComponent>
          </Col>
        </Row>
        {/* <Row>
          <Col>
            <h4>Individual strength values to the opponent team</h4>
            <GraphComponent labels={graphLabels} datasets={graphDataSets} heightVertical={200} widthVertical={800} optionsBar={chartOptionsBar} />
          </Col>
        </Row> */}
        <Row>
          <Col>
          <Tabs id="method-tabs" defaultActiveKey="maximum-minimum" className="mt-3">
            <Tab eventKey="average-minimum" title="Average Minimum">
              <h4 className="mt-3">Selections (Method: Average Minimum)</h4>
              <MAOPResults myTeam={this.props.myTeam} oppTeam={this.state.oppTeam}/>
            </Tab>
            <Tab eventKey="maximum-minimum" title="Maximum Minimum">
              <h4 className="mt-3">Selections (Method: Maximum Minimum)</h4>
              <MMOPResults myTeam={this.props.myTeam} oppTeam={this.state.oppTeam}/>
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
            <Tab eventKey="coverage" title="Coverage">
              <h4 className="mt-3">Selections (Method: Coverage)</h4>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th key='h-i'>{t('search.columnRank')}</th>
                    {resultsWC.myTeamResults[0].myTeam.map((x, i) => 
                      <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)}
                    <th key='h-oc'>Overall Coverage</th>
                    <th key='h-nc'>Num of Coverage</th>
                    <th key='h-mcp'>M.C. Pokemon</th>
                    <th key='h-mc'>Maximum Coverage</th>
                    <th key='h-dt'>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsWC.myTeamResults.map((result, index) => (
                    <tr key={index}>
                      <td key={`${index}-i`}>{index + 1}</td>
                      {result.myTeam.map((x, i) => <td key={`${index}-p${i}`}>{translateSpeciesIfPossible(x.species, t)}</td>)}
                      <td key={`${index}-oc`}>{result.overallCoverage.toFixed(3)}</td>
                      <td key={`${index}-nc`}>{result.coverageNum.toFixed(0)}</td>
                      <td key={`${index}-mcp`}>{translateSpeciesIfPossible(result.myTeam[result.maximumCoveragePokemonIndex].species, t)}</td>
                      <td key={`${index}-mc`}>{result.maximumCoverage.toFixed(0)}</td>
                      <td key={`${index}-dt`} style={{fontSize: "small"}}>
                        {result.advantageousMatchups.map((x, i) => {
                          const inner = x.matchups.map((y, j) => {
                            const playerSpecies = translateSpeciesIfPossible(y.player.species, t);
                            const opponentSpecies = translateSpeciesIfPossible(y.opponent.species, t);  
                            return <div key={`${index}-dt-${i}-${j}`}>{`${playerSpecies} -> ${opponentSpecies}: ${y.value.toFixed(0)}`}</div>
                          })

                          return inner;
                        })}
                      </td>
                    </tr>                
                  ))}
                </tbody>
              </Table> 
            </Tab>
            <Tab eventKey="nash-equilibrium" title="Nash Equilibrium">
              <h4 className="mt-3">Selections (Method: Coverage)</h4>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th></th>
                    {resultsNA[0].map((x, i) => 
                      <th key={`h-p${i}`}>{i + 1}
                        {resultsNA[0][i].oppTeam.map((y, j) => (<div style={{fontSize: "small"}} key={`h-p${i}-${j}`}>{translateSpeciesIfPossible(y.species, t)}</div>))}
                      </th>)}
                  </tr>
                </thead>
                <tbody>
                  {resultsNA.map((result, index) => (
                    <tr key={index}>
                      <td key={`${index}-i`}>{index + 1}
                        {result[0].myTeam.map((x, i) => <div style={{fontSize: "small"}} key={`${index}-p${i}`}>{translateSpeciesIfPossible(x.species, t)}</div>)}
                      </td>
                      {result.map((x, i) => 
                        <td style={{backgroundColor: (x.isMyTeamDominant&&x.isOppTeamDominant)?'lightskyblue': 'initial'}} key={`${index}-mm${i}`}>{`(${x.isMyTeamDominant?'!': ''}${x.myTeamCoverage}, ${x.isOppTeamDominant?'!':''}${x.oppTeamCoverage})`}</td>
                      )}
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
          <Modal.Title>Details: {this.state.selectedMyTeamIndex+1} ({myTeamToString})</Modal.Title>
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
      <Modal size="lg" show={this.state.mmopModalShow} onHide={() => this.setState({mmopModalShow: false})}>
        <Modal.Header closeButton>
          <Modal.Title>Details: {this.state.mmopModalIndex + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MMOPDetails index={this.state.mmopDetailsProps.index} result={this.state.mmopDetailsProps.result} 
            myTeam={this.state.mmopDetailsProps.myTeam} oppTeam={this.state.mmopDetailsProps.oppTeam}
            matchups={this.state.mmopDetailsProps.matchups} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => this.setState({mmopModalShow: false})}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )};
}
