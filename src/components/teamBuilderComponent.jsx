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
import './teamBuilderComponent.css'
import { TargetSelectComponent } from './targetSelectComponent';

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
      const targetPokemonNames = this.combinationService.getAllTargetPokemonNames();
      this.setState({ 
        loading: false, 
        strVectorColumns: targetPokemonNames,
        selectedTargetIndices: [0,1,2,3,4,7,8,9,10,11,13,14,15,16,17,20,21,22,25,26,27,31,32,33,34,37,39,40,42,43,44,45,47,48,49,51,52,53,54,56,57,58,59,60,61],
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

  onChangeSelectedTargetIndices(indices) {
    this.setState({ selectedTargetIndices: indices });
  }

  pokemonListSortRefIndices(t) {
    const sortedPokemonList = this.state.teamPokemonList.concat();
    sortedPokemonList.sort((a, b) => {
      if (translateSpeciesIfPossible(a.species, t) < translateSpeciesIfPossible(b.species, t)) {
        return -1;
      } else if (translateSpeciesIfPossible(b.species, t) < translateSpeciesIfPossible(a.species, t)) {
        return 1;
      } else {
        return 0;
      }
    });

    const originalIndices = [];
    sortedPokemonList.forEach((sortedPoke) => {
      const index = this.state.teamPokemonList.findIndex(originalPoke => originalPoke.id === sortedPoke.id);
      originalIndices.push(index);
    });
    
    return originalIndices;
  }

  filteredTargetSortRefIndices(t) {
    const filtered = this.state.strVectorColumns.filter((x, i) => this.state.selectedTargetIndices.indexOf(i) >= 0)
      .map((x, i) => ({index: i, name: x}));
    filtered.sort((a, b) => {
      if (translateSpeciesIfPossible(a.name, t) < translateSpeciesIfPossible(b.name, t)) {
        return -1;
      } else if (translateSpeciesIfPossible(b.name, t) < translateSpeciesIfPossible(a.name, t)) {
        return 1;
      } else {
        return 0;
      }
    });

    const filteredOriginalIndices = filtered.map(x => x.index);
    return filteredOriginalIndices;
  }

  toOriginalIndices(indicesOnSorted, originalIndices) {
    const originals = indicesOnSorted.map(i => originalIndices[i]);
    originals.sort((a, b) => {
      if (a < b) {
        return -1;
      } else if (b < a) {
        return 1;
      } else {
        return 0;
      }
    });

    return originals;
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    if (this.state.loading) {
      return <span>Loading...</span>
    } else {
      // for sort
      const originalIndices = this.pokemonListSortRefIndices(t);
      const origIndAfterTargetFilter = this.filteredTargetSortRefIndices(t);
      
      const sortedPokemonList = originalIndices.map(i => this.state.teamPokemonList[i]);
      const graphLabels = originalIndices.map(i => this.state.strVectorColumns[i])
        .filter((x, i) => this.state.selectedTargetIndices.indexOf(originalIndices[i]) >= 0)
        .map(x => translateSpeciesIfPossible(x, t));

      let teamStrengthValues = this.combinationService.strValuesOfTeam(this.state.teamPokemonIndices, this.state.selectedTargetIndices);
      teamStrengthValues = origIndAfterTargetFilter.map(i => teamStrengthValues[i]);
      const graphDatasets = [
        {
          dataLabel: t('graph.teamStrengthValue'),
          values: teamStrengthValues.map(x => Math.round(x)),
          colorRGB: [255, 99, 132]
        }
      ]

      let results = [];
      if (this.state.searchSettings.evaluationMethod === 0) {
        results = this.combinationService.calcTargetStrengthsComplement(this.state.teamPokemonIndices, this.state.selectedTargetIndices, ['Sweeper', 'Tank', 'Wall']);
      } else if (this.state.searchSettings.evaluationMethod === 1) {
        results = this.combinationService.calcWeakestPointImmunity(this.state.teamPokemonIndices, this.state.selectedTargetIndices, ['Sweeper', 'Tank', 'Wall']);
      } else if (this.state.searchSettings.evaluationMethod === 2) {
        results = this.combinationService.calcImmunityToCustomTargets(this.state.teamPokemonIndices, this.state.selectedTargetIndices, 
          this.state.searchSettings.targets.filter(idStr => idStr));
      }

      const sortedTargetNames = originalIndices.map(i => this.state.strVectorColumns[i]);

      return (
        <>
          <Container fluid className="mt-3">
            <Row>
              <Col>
                <Container style={{marginLeft: 0}}>
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
                <TeamComponent num={6} pokemonList={sortedPokemonList} onChange={(indices) => this.onChangeTeamPokemons(this.toOriginalIndices(indices, originalIndices))}></TeamComponent>
              </Col>
            </Row>
            <Row>
              <Col>
                <Tabs defaultActiveKey="graph" className="mt-3">
                  <Tab eventKey="graph" title={t('tab.titleGraph')}>
                    <GraphComponent labels={graphLabels} datasets={graphDatasets}/>
                  </Tab>
                  <Tab eventKey="search" title={t('tab.titleSearch')}>
                    <SearchComponent pokemonList={sortedPokemonList} onChange={(settings) => this.onSearchSettingsChange(settings)}></SearchComponent>
                    <SearchResultComponent searchResult={results} />
                  </Tab>
                  <Tab eventKey="target-select" title={t('tab.titleTargetSelect')}>
                    <TargetSelectComponent allTargetNames={sortedTargetNames} onChange={(indices) => this.onChangeSelectedTargetIndices(this.toOriginalIndices(indices, originalIndices))} />
                  </Tab>
                </Tabs>    
              </Col>
            </Row>
            <Row className="reference-row">
              <Col>
                <Container style={{marginLeft: 0}}>
                  <Row>
                    <Col>
                      <h5>{t('reference.title')}</h5>
                      <span>{t('reference.blogTitle')}</span>
                      <p>
                        <a href="https://shingaryu.hatenablog.com/entry/2020/02/16/020640" target="_blank" rel="noopener noreferrer">
                          https://shingaryu.hatenablog.com/entry/2020/02/16/020640
                        </a>
                      </p>
                    </Col>
                  </Row>
              </Container>
              </Col>
            </Row>
          </Container>
        </>
    )};    
  }
}
