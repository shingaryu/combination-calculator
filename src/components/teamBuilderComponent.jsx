import React from 'react';
// import './App.css';
// import { combinationCalculator } from './combination-calculator';
import { Container, Row, Col } from 'react-bootstrap'
import { SearchComponent } from './searchComponent';
import { GraphComponent } from './graphComponent';
import { TeamComponent } from './TeamComponent';

export class TeamBuilderComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }


  render() {
    const labelsMock = [
      "Aegislash"	,"Cinderace"	,"Cloyster"	,"Conkeldurr"	,"Corsola"	,"Corviknight"	,"Corviknight"	,"Darmanitan"	,"Diggersby"	,"Dracovish"	,"Dragapult"	,"Dragapult"	,"Durant"	,"Eiscue"
    ]

    const strengthValuesMock = [
        10	,238	,751	,496	,-15	,332	,164	,239	,-323	,81	,111	,179	,792	,859
    ];

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
      <GraphComponent labels={labelsMock} values={strengthValuesMock}/>
    </>
    )};
}
