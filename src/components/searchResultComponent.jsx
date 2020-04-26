import React, { useContext } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap'
import './searchResultComponent.css'

export class SearchResultComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRow: null
    };
  }

  onClickTableRow(rowIndex, pokemonIds) {
    if (this.state.selectedRow === rowIndex) {
      this.setState({ selectedRow: null });
      this.props.onSelectChange(null);
    } else {
      this.setState({ selectedRow: rowIndex })
      this.props.onSelectChange(pokemonIds);
    }

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
          <Col className='table-area'>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th key='h-i'>#</th>
                {this.props.searchResult.length===0?
                  <th key={`h-p0`}>Pokemon</th>:
                  this.props.searchResult[0].pokemonIds.map((x, i) => <th key={`h-p${i}`}>Pokemon</th>)
                }
                <th key='h-v'>Value</th>
              </tr>
            </thead>
            <tbody>
              {this.props.searchResult.map((result, index) => (
                <tr key={index} onClick={() => this.onClickTableRow(index, result.pokemonIds)} 
                  className={this.state.selectedRow===index?'cursor-pointer selected-row':'cursor-pointer'}>
                  <td key={`${index}-i`}>{index + 1}</td>
                  {result.pokemonNames.map((x, i) => <td key={`${index}-p${i}`}>{x}</td>)}
                  <td key={`${index}-v`}>{result.value.toFixed(4)}</td>
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
