import React from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import { SearchComponent } from './searchComponent';
import { GraphComponent } from './graphComponent';
import { TeamComponent } from './TeamComponent';
import { CombinationService } from '../services/combination-service';
import { SearchResultComponent } from './searchResultComponent';

export class TeamBuilderComponent extends React.Component {
  constructor(props) {
    super(props);
    this.combinationService = new CombinationService();
    this.state = { 
      loading: true,
      teamPokemonIndices: ["18", "11", "23", "25", "2", "21"], // default in teamComponent
      selectedSearchResultPokemonIndices: null
    };
    this.combinationService.loadMasterData().then(data => {
      const allTeamPokemonNames = this.combinationService.getAllTeamPokemonNames();
      const teamPokemonNameMap = allTeamPokemonNames.map((name, index) => ({id: index.toString(), name: name}));
      this.setState({ 
        loading: false, 
        strVectorColumns: this.combinationService.getAllTargetPokemonNames(),
        teamPokemonNameMap: teamPokemonNameMap 
      });
    }, error => {
      this.setState({ loading: false });
      console.log(error);
      throw new Error('Error: failed to init combinationService');
    });
  }

  onChangeTeamPokemons(indices) {
    this.setState({ teamPokemonIndices: indices });
  }

  onSelectSearchResultRow(indices) {
    this.setState({ selectedSearchResultPokemonIndices: indices });
  }

  render() {
    if (this.state.loading) {
      return <span>Loading...</span>
    } else {  
      const teamStrengthValues = this.combinationService.strValuesOfTeam(this.state.teamPokemonIndices);
      const results = this.combinationService.searchSmallCosineSimilarity(this.state.teamPokemonIndices, ['Sweeper', 'Tank', 'Wall']);

      const graphDatasets = [
        {
          dataLabel: 'Team strength value',
          values: teamStrengthValues,
          colorRGB: [255, 99, 132]
        }
      ]

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
                <TeamComponent num={6} pokemonList={this.state.teamPokemonNameMap} onChange={(indices) => this.onChangeTeamPokemons(indices)}></TeamComponent>
              </Col>
              {/* <Col md={3}>
                <SearchComponent></SearchComponent>
              </Col> */}
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
