import React from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap'
import { SearchComponent } from './searchComponent';
import { GraphComponent } from './graphComponent';
import { TeamComponent } from './TeamComponent';
import { CombinationService } from '../services/combination-service';
import { SearchResultComponent } from './searchResultComponent';
import { getPokemonStrategies } from '../api/pokemonStrategiesApi';
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';

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

  static contextType = I18nContext;

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
    const t = this.context.i18n.t.bind(this.context.i18n);

    if (this.state.loading) {
      return <span>Loading...</span>
    } else {  
      const teamStrengthValues = this.combinationService.strValuesOfTeam(this.state.teamPokemonIndices);
      const graphDatasets = [
        {
          dataLabel: t('graph.teamStrengthValue'),
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
            dataLabel: t('graph.selectedPokemonStrengthValue'),
            values: searchResultPokemonStrengthValues,
            colorRGB: [0, 99, 132]
        })
      }

      return (
        <>
          <Container fluid className="mt-3">
            <Row>
              <Col>
                <Container>
                  <Row>
                    <Col>
                      <h4>{t('overview.title')}</h4>
                      <p>{t('overview.textline1')}</p>
                      <p>{t('overview.textline2')}</p>
                    </Col>
                  </Row>
              </Container>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <TeamComponent num={6} pokemonList={this.state.teamPokemonList} onChange={(indices) => this.onChangeTeamPokemons(indices)}></TeamComponent>
              </Col>
            </Row>
            <Row>
              <Col>
                <Tabs defaultActiveKey="graph" className="mt-3">
                  <Tab eventKey="graph" title={t('tab.titleGraph')}>
                    <GraphComponent labels={this.state.strVectorColumns.map(x => translateSpeciesIfPossible(x, t))} datasets={graphDatasets}/>
                  </Tab>
                  <Tab eventKey="search" title={t('tab.titleSearch')}>
                    <SearchComponent onChange={(settings) => this.onSearchSettingsChange(settings)}></SearchComponent>
                    <SearchResultComponent searchResult={results} onSelectChange={(indices) => this.onSelectSearchResultRow(indices)}/>
                  </Tab>
                </Tabs>    
              </Col>
            </Row>
          </Container>
        </>
    )};    
  }
}
