import React from 'react';
import { Container, Row, Col, InputGroup, FormControl, Table, Tabs, Tab } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import { TeamComponent } from './TeamComponent';
import PokemonStrategy from '../models/PokemonStrategy';
import { CombinationService } from '../services/combination-service';
import { GraphComponent } from './graphComponent';

type BattleTeamComponentProps = {
  rawPokemonList: PokemonStrategy[],
  sortedPokemonList: PokemonStrategy[],
  combinationService: CombinationService,
  toTeamPokemonIndices: (pokemons: PokemonStrategy[]) => number[]
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
    const myTeamIndices = this.props.toTeamPokemonIndices(this.state.myTeam);
    const oppTeamIndices = this.props.toTeamPokemonIndices(this.state.oppTeam);

    const oppTeamOrderByAlphabets = this.state.oppTeam.concat();
    oppTeamOrderByAlphabets.sort((a, b) => {
      if (a.species < b.species) {
        return -1;
      } else if (b.species < a.species) {
        return 1;
      } else {
        return 0;
      }
    });

    const graphLabels = this.state.oppTeam.map(x => translateSpeciesIfPossible(x.species, t));

    const graphDataSets = this.state.myTeam.map((myPoke, i) => {
      const originalIndex = this.props.toTeamPokemonIndices([myPoke]);
      const strValues = this.props.combinationService.strValuesOfTeam(originalIndex, oppTeamIndices);
      const strValuesWithPoke = strValues.map((val, i) => ({val: val, poke: oppTeamOrderByAlphabets[i]}));
      const strValuesWithPokeSorted: any[] = [];
      this.state.oppTeam.forEach(poke => {
        const index = strValuesWithPoke.findIndex(x => x.poke.id === poke.id);
        strValuesWithPokeSorted.push(strValuesWithPoke[index]);
      })

      const graphDataset = {
        dataLabel: translateSpeciesIfPossible(myPoke.species, t),
        values: strValuesWithPokeSorted.map(x => Math.round(x.val)),
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

    const resultsAM = this.props.combinationService.calcTeamCombinationsOnWeakest(myTeamIndices, oppTeamIndices);
    const resultsMM = this.props.combinationService.calcTeamCombinationsOnMaximumWeakest(myTeamIndices, oppTeamIndices);

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
                      resultsAM[0].pokemonIds.map((x, i) => <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)
                    }
                    <th key='h-v'>Min. Value</th>
                    <th key='h-t'>On Target</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsAM.map((result, index) => (
                    <tr key={index}>
                      <td key={`${index}-i`}>{index + 1}</td>
                      {result.pokemonNames.map((x, i) => <td key={`${index}-p${i}`}>{translateSpeciesIfPossible(x, t)}</td>)}
                      <td key={`${index}-v`}>{result.value.toFixed(4)}</td>
                      <td key={`${index}-v`}>{translateSpeciesIfPossible(result.minimumValueTargetName, t)}</td>
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
                      resultsMM[0].pokemonIds.map((x, i) => <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)
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
                      {result.pokemonNames.map((x, i) => <td key={`${index}-p${i}`}>{translateSpeciesIfPossible(x, t)}</td>)}
                      <td key={`${index}-v`}>{result.value.toFixed(4)}</td>
                      <td key={`${index}-v`}>{translateSpeciesIfPossible(result.minimumValueTargetName, t)}</td>
                      <td>
                        {result.eachMaximums?.map(maximum => {
                          const toTarget = this.props.rawPokemonList[maximum.to];
                          const fromPokemon = this.props.rawPokemonList[maximum.from];
                          const valueInt = Math.round(maximum.value);
                          return (
                            <div>{`To: ${translateSpeciesIfPossible(toTarget.species, t)} From: ${translateSpeciesIfPossible(fromPokemon.species, t)} Value: ${valueInt}`}</div>
                          );
                        })}
                      </td>
                      <td>
                        {result.overused.map((info: any) => {
                          const fromPokemon = this.props.rawPokemonList[info.from];
                          const valueInt = Math.round(info.total);
                          return (
                            <div>{`${translateSpeciesIfPossible(fromPokemon.species, t)}: ${valueInt}`}</div>
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
