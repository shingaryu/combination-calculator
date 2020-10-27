import React from 'react';
import { Container, Row, Col, Table, Tabs, Tab, Modal, Button } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';
// import { masterDataService } from '../services/masterDataService';
import { GraphComponent } from './graphComponent';
import { defaultTeam } from '../defaultList';
import { BattleTeamDetailsComponent } from './battleTeamDetailsComponent';
import { SimpleTeamComponent } from './simpleTeamComponent';
import { MROSCalculator } from '../services/MROSCalculator';
import { CVNECalculator } from '../services/CVNECalculator';
import { MMOPDetails } from './MMOPDetails';
import { MMOPResults } from './MMOPResults';
import { MAOPResults } from './MAOPResults';
import { CVRGResults } from './CVRGResults';
import { EventEmitter } from 'events';
import { MMOPCalculator } from '../services/MMOPCalculator';
import BattleTeamSearchResult from '../models/BattleTeamSearchResult';

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

  private shuffleEvent = new EventEmitter();

  static contextType = I18nContext;

  onChangeOppPokemons(pokemons: PokemonStrategy[]) {
    this.setState({ oppTeam: pokemons });
  }

  onShuffleClick() {
    this.shuffleEvent.emit('event');
  }

  // randomOppTeam() {
  //   const pokeList = this.props.sortedPokemonList.concat();
  //   const teamNum = 6;
  //   const storedIndices: number[] = [];
  //   for (let i = 0; i < teamNum; i++) {
  //     let duplicated = true;
  //     let randomIndex = -1;
  //     while (duplicated && (pokeList.length - storedIndices.length > 0)) {
  //       randomIndex = Math.floor(Math.random() * pokeList.length);
  //       duplicated = storedIndices.indexOf(randomIndex) >= 0;
  //     }
      
  //     if (randomIndex > 0) {
  //       storedIndices.push(randomIndex);
  //     }      
  //   }

  //   if (storedIndices.length !== 6) {
  //     throw new Error("Error: Failed to generate random indices");
  //   }

  //   const team = storedIndices.map(x => pokeList[x]);

  //   return team;
  // }

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
    const cvneCalculator = new CVNECalculator();
    
    const resultsAC = mrosCalculator.evaluate(this.props.myTeam, this.state.oppTeam);
    const resultsNA = cvneCalculator.evaluate(this.props.myTeam, this.state.oppTeam);

    const myTeamToString = this.state.selectedMyTeamIndex !== -1 ? resultsAC.myTeamResults[this.state.selectedMyTeamIndex].myTeam.map(x => translateSpeciesIfPossible(x.species, t)).join(', '): '';

    const mmopCalculator = new MMOPCalculator();
    const repetition = 1000;
    const mmopResults: BattleTeamSearchResult[][] = [];
    // const randomOpp = this.randomOppTeam();
    for (let i = 0; i < repetition; i++) {
      const randomOpp = this.randomOppTeam();
      const mmopResult = mmopCalculator.evaluate(this.props.myTeam, randomOpp);
      mmopResults.push(mmopResult);
    }

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
      const mySelectionStr = pokemons.map(x => translateSpeciesIfPossible(x.species, t)).join(', ');
      statistics.push({mySelection: pokemons, mySelectionStr: mySelectionStr, average: average});
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

    const graphLabels = statistics.map(x => x.mySelectionStr);
    const graphDataSets = [
      {
        dataLabel: "Average",
        values: statistics.map(x => x.average),
        colorRGB: [128, 99, 132]
      }
    ];

    const chartOptionsBar = {
      scales: {
        xAxes: [{
          ticks: {
            minRotation: 90,
            maxRotation: 90
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

    const battleTeamMapInd = new Map<string, battleTeamResult[]>();

    const staticticsInd: any[] = [];
    const mapInd = new Map

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

      staticticsInd.push({myPoke: myPoke, average: average});
    })


    const graphLabelsInd = staticticsInd.map(x => translateSpeciesIfPossible(x.myPoke.species, t));
    const graphDataSetsInd = [
      {
        dataLabel: "Average",
        values: staticticsInd.map(x => x.average),
        colorRGB: [76, 99, 132]
      }
    ];

    const chartOptionsBarInd = {
      scales: {
        xAxes: [{
          ticks: {
            minRotation: 0,
            maxRotation: 0
          }
        }],
        yAxes: [{
          ticks: {
            min: -128,
            max: 128,
            stepSize: 32
          }
        }]
      }
    }


    return (
    <>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <h4>Average evaluate values for each selection</h4>
            <GraphComponent labels={graphLabels} datasets={graphDataSets} heightVertical={600} widthVertical={800} optionsBar={chartOptionsBar} />
            <h4>Average evaluate values for each Pokemon</h4>
            <GraphComponent labels={graphLabelsInd} datasets={graphDataSetsInd} heightVertical={300} widthVertical={800} optionsBar={chartOptionsBarInd} />
          </Col>
        </Row>
        <Row>
          <Col>
            <h4>{t('battleTeam.selectOpponentTeam')}</h4>
            <SimpleTeamComponent num={6} pokemonList={this.props.sortedPokemonList} onChange={(pokemons) => this.onChangeOppPokemons(pokemons)}
              shuffleEvent={this.shuffleEvent}></SimpleTeamComponent>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button variant="outline-dark" size="sm" style={{ marginLeft: 80 }} onClick={() => this.onShuffleClick()}>Shuffle</Button>
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
            <Tab eventKey="average-minimum" title={t('battleTeam.tab.titleMAOP')}>
              <h4 className="mt-3">{t('battleTeam.MAOP.title')}</h4>
              <MAOPResults myTeam={this.props.myTeam} oppTeam={this.state.oppTeam}/>
            </Tab>
            <Tab eventKey="maximum-minimum" title={t('battleTeam.tab.titleMMOP')}>
              <h4 className="mt-3">{t('battleTeam.MMOP.title')}</h4>
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
            <Tab eventKey="coverage" title={t('battleTeam.tab.titleCVRG')}>
              <h4 className="mt-3">{t('battleTeam.CVRG.title')}</h4>
              <CVRGResults myTeam={this.props.myTeam} oppTeam={this.state.oppTeam} />
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
