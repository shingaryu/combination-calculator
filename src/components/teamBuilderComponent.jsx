import React from 'react';
// import './App.css';
// import { combinationCalculator } from './combination-calculator';
import { Container, Row, Col } from 'react-bootstrap'
import { SearchComponent } from './searchComponent';
import { GraphComponent } from './graphComponent';
import { TeamComponent } from './TeamComponent';
import { CombinationService } from '../services/combination-service';

export class TeamBuilderComponent extends React.Component {
  constructor(props) {
    super(props);
    this.combinationService = new CombinationService();
    this.state = { loading: true };
    this.combinationService.loadMasterData().then(data => {
      this.setState({ loading: false });
    }, error => {
      this.setState({ loading: false });
      console.log(error);
      throw new Error('Error: failed to init combinationService');
    });
  }

  render() {
    if (this.state.loading) {
      return <span>Loading...</span>
    } else {  
      const strVectorColumns = this.combinationService.getAllTargetPokemonNames();
      const strengthValuesMock = this.combinationService.strValuesOfTeam([0, 13, 4, 2, 23, 8])

      return (
        <>
          <Container fluid className="mt-5">
            <Row>
              <Col md={3}>
                <TeamComponent num={6}></TeamComponent>
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
          <GraphComponent labels={strVectorColumns} values={strengthValuesMock}/>
        </>
    )};    
  }
}
