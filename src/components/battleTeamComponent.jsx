import React from 'react';
import { Container, Row, Col, InputGroup, FormControl, Table } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import { TeamComponent } from './TeamComponent';

export class BattleTeamComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      myPokemonIndices: this.props.teamPokemonIndices,
      oppPokemonIndices: [18, 11, 23, 25, 2, 21]
    };
  }

  static contextType = I18nContext;

  onChangeMyPokemons(indices) {
    this.setState({ myPokemonIndices: indices });
  }

  onChangeOppPokemons(indices) {
    this.setState({ oppPokemonIndices: indices.map(x => parseInt(x)) });
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);
    const results = this.props.combinationService.calcTeamCombinationsOnWeakest(this.state.myPokemonIndices, this.state.oppPokemonIndices);

    return (
    <>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <h4>My Team</h4>
            <TeamComponent num={6} pokemonList={this.props.sortedPokemonList} onChange={(indices) => this.onChangeMyPokemons(this.props.toOriginalIndices(indices))}></TeamComponent>
          </Col>
          <Col>
            <h4>Opponent's Team</h4>
            <TeamComponent num={6} pokemonList={this.props.sortedPokemonList} onChange={(indices) => this.onChangeOppPokemons(this.props.toOriginalIndices(indices))}></TeamComponent>
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
