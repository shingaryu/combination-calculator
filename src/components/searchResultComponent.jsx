import React, { useContext } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap'
import './searchResultComponent.css'
import { I18nContext } from 'react-i18next';

export class SearchResultComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRow: null
    };
  }

  static contextType = I18nContext;

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
    const t = this.context.i18n.t.bind(this.context.i18n);

    return (
    <>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <h4>{t('search.resultTitle')}</h4>
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
                  this.props.searchResult[0].pokemonIds.map((x, i) => <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)
                }
                <th key='h-v'>{t('search.columnValue')}</th>
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
