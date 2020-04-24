import React from 'react';
// import './App.css';
// import { combinationCalculator } from './combination-calculator';
import { Container, Row, Col } from 'react-bootstrap'

export class SearchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
    <>
      <Container fluid>
        <Row>
          <Col>
            <h1>New Search</h1>
          </Col>
        </Row>
      </Container>
    </>
    )};
}
