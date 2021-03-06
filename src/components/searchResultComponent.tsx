import React from 'react';
import { Row, Col, Table } from 'react-bootstrap'
import './searchResultComponent.css'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import SearchResult from '../models/searchResult';

type SearchResultComponentProps = {
  searchResult: SearchResult[]
}

type SearchResultComponentState = {

}

export class SearchResultComponent extends React.Component<SearchResultComponentProps, SearchResultComponentState> {

  static contextType = I18nContext;

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    return (
    <>
      <Row className="mt-3">
        <Col>
          <h4>{t('search.resultTitle')}</h4>
          { this.props.searchResult.length>0 && this.props.searchResult[0].targetPokemonName? 
            `(for: ${translateSpeciesIfPossible(this.props.searchResult[0].targetPokemonName, t)})`:''
          }
        </Col>
      </Row>
      <Row>
        <Col className='table-area'>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th key='h-i'>{t('search.columnRank')}</th>
              {this.props.searchResult.length===0?
                <th key={`h-p0`}>{t('search.columnPokemon')}</th>:
                this.props.searchResult[0].pokemonIds.map((x, i) => <th key={`h-p${i}`}>{t('search.columnPokemon')}</th>)
              }
              <th key='h-v'>{t('search.columnValue')}</th>
            </tr>
          </thead>
          <tbody>
            {this.props.searchResult.map((result, index) => (
              <tr key={index}>
                <td key={`${index}-i`}>{index + 1}</td>
                {result.pokemonNames.map((x, i) => <td key={`${index}-p${i}`}>{translateSpeciesIfPossible(x, t)}</td>)}
                <td key={`${index}-v`}>{result.value.toFixed(4)}</td>
              </tr>                
            ))}
          </tbody>
        </Table>         
        </Col>
      </Row>
    </>
    )};
}
