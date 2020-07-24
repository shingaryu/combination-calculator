import React from 'react';
import { Container, Row, Col, InputGroup, FormControl, Table } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import { TeamComponent } from './TeamComponent';
import PokemonStrategy from '../models/PokemonStrategy';
import { CombinationService } from '../services/combination-service';

type BattleTeamComponentProps = {
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

    const results = this.props.combinationService.calcTeamCombinationsOnWeakest(myTeamIndices, oppTeamIndices);

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
            <h4>Selection</h4>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th key='h-i'>{t('search.columnRank')}</th>
                  {results.length===0?
                    <th key={`h-p0`}>Pokemon</th>:
                    results[0].pokemonIds.map((x, i) => <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)
                  }
                  <th key='h-v'>Min. Value</th>
                  <th key='h-t'>On Target</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <td key={`${index}-i`}>{index + 1}</td>
                    {result.pokemonNames.map((x, i) => <td key={`${index}-p${i}`}>{translateSpeciesIfPossible(x, t)}</td>)}
                    <td key={`${index}-v`}>{result.value.toFixed(4)}</td>
                    <td key={`${index}-v`}>{translateSpeciesIfPossible(result.minimumValueTargetName, t)}</td>
                  </tr>                
                ))}
              </tbody>
            </Table> 
          </Col>
        </Row>
      </Container>
    </>
  )};
}
