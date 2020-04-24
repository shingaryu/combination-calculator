import React from 'react';
import { Container, Row, Col } from 'react-bootstrap'
import { SearchComponent } from './searchComponent';
import { GraphComponent } from './graphComponent';
import { TeamComponent } from './TeamComponent';
import { CombinationService } from '../services/combination-service';

export class TeamBuilderComponent extends React.Component {
  constructor(props) {
    super(props);
    this.combinationService = new CombinationService();
    this.state = { 
      loading: true,
      teamPokemonIndices: [ "4", "12", "2", "7", "0", "23" ] // sample
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

  render() {
    if (this.state.loading) {
      return <span>Loading...</span>
    } else {  
      const teamStrengthValues = this.combinationService.strValuesOfTeam(this.state.teamPokemonIndices);

      return (
        <>
          <Container fluid className="mt-5">
            <Row>
              <Col md={3}>
                <TeamComponent num={6} pokemonList={this.state.teamPokemonNameMap} onChange={(indices) => this.onChangeTeamPokemons(indices)}></TeamComponent>
              </Col>
              <Col md={3}>
                <SearchComponent></SearchComponent>
              </Col>
              <Col md={6}>
                <SearchComponent></SearchComponent>
              </Col>
            </Row>
            <Row>
              <Col>
    
              </Col>
              <Col>
              </Col>
            </Row>
          </Container>
          <GraphComponent labels={this.state.strVectorColumns} values={teamStrengthValues}/>
        </>
    )};    
  }
}
