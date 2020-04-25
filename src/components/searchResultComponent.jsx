import React from 'react';
// import './App.css';
// import { combinationCalculator } from './combination-calculator';
import { Container, Row, Col, Table } from 'react-bootstrap'

export class SearchResultComponent extends React.Component {
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
            <h2>Search Result</h2>
          </Col>
        </Row>
        <Row>
          <Col style={{height: 300, overflowY: 'auto'}}>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                {this.props.searchResult[0].pokemonIds.map(x => <th>Pokemon</th>)}
                <th>Value</th>
                {/* <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th> */}
              </tr>
            </thead>
            <tbody>
              {this.props.searchResult.map((result, index) => (
                <tr>
                  <td>{index + 1}</td>
                  {result.pokemonNames.map(x => <td>{x}</td>)}
                  <td>{result.value.toFixed(4)}</td>
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
