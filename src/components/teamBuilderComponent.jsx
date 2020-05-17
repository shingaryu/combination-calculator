import React from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import { SearchComponent } from './searchComponent';
import { GraphComponent } from './graphComponent';
import { TeamComponent } from './TeamComponent';
import { CombinationService } from '../services/combination-service';
import { SearchResultComponent } from './searchResultComponent';
import { getPokemonStrategies } from '../api/pokemonStrategiesApi';

export class TeamBuilderComponent extends React.Component {
  constructor(props) {
    super(props);
    this.combinationService = new CombinationService();
    this.state = { 
      loading: true,
      teamPokemonIndices: ["18", "11", "23", "25", "2", "21"], // default in teamComponent
      searchSettings: { evaluationMethod: 0 },
      selectedSearchResultPokemonIndices: null
    };

    Promise.all([
      this.combinationService.loadMasterData(),
      getPokemonStrategies()
    ]).then(returns => {
      const pokemonStrategies = returns[1].data;
      this.setState({ 
        loading: false, 
        strVectorColumns: this.combinationService.getAllTargetPokemonNames(),
        teamPokemonList: pokemonStrategies,
      });      
    }, error => {
      this.setState({ loading: false });
      console.log(error);
      throw new Error('Error: failed to init teamBuilderComponent');
    });
  }

  onChangeTeamPokemons(indices) {
    this.setState({ teamPokemonIndices: indices });
  }

  onSearchSettingsChange(settings) {
    this.setState({ searchSettings: settings, selectedSearchResultPokemonIndices: null });
  }

  onSelectSearchResultRow(indices) {
    this.setState({ selectedSearchResultPokemonIndices: indices });
  }

  render() {
    if (this.state.loading) {
      return <span>Loading...</span>
    } else {  
      const teamStrengthValues = this.combinationService.strValuesOfTeam(this.state.teamPokemonIndices);
      const graphDatasets = [
        {
          dataLabel: 'Team strength value',
          values: teamStrengthValues,
          colorRGB: [255, 99, 132]
        }
      ]

      let results = [];
      if (this.state.searchSettings.evaluationMethod === 0) {
        results = this.combinationService.calcTargetStrengthsComplement(this.state.teamPokemonIndices, ['Sweeper', 'Tank', 'Wall']);
      }

      if (this.state.selectedSearchResultPokemonIndices) {
        const searchResultPokemonStrengthValues = this.combinationService.strValuesOfTeam(this.state.selectedSearchResultPokemonIndices);
        graphDatasets.push({
            dataLabel: 'Selected pokemon strength value',
            values: searchResultPokemonStrengthValues,
            colorRGB: [0, 99, 132]
        })
      }

      return (
        <>
          <Container fluid className="mt-3">
            <Row>
              <Col md={3}>
                <TeamComponent num={6} pokemonList={this.state.teamPokemonList} onChange={(indices) => this.onChangeTeamPokemons(indices)}></TeamComponent>
              </Col>
              <Col md={3}>
                <SearchComponent onChange={(settings) => this.onSearchSettingsChange(settings)}></SearchComponent>
              </Col>
              <Col md={6}>
                <SearchResultComponent searchResult={results} onSelectChange={(indices) => this.onSelectSearchResultRow(indices)}/>
              </Col>
            </Row>
            <Row>
              <Col>
    
              </Col>
              <Col>
              </Col>
            </Row>
          </Container>
          <GraphComponent labels={this.state.strVectorColumns} datasets={graphDatasets}/>
        </>
    )};    
  }
}
