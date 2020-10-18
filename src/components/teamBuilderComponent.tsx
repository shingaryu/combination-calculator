import React from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap'
import { SearchComponent } from './searchComponent';
import { GraphComponent } from './graphComponent';
import { TeamComponent } from './TeamComponent';
import { masterDataService } from '../services/masterDataService';
import { SearchResultComponent } from './searchResultComponent';
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import './teamBuilderComponent.css'
import { TargetSelectComponent } from './targetSelectComponent';
import { BattleTeamComponent } from './battleTeamComponent';
import SearchSettings from '../models/searchSettings';
import PokemonStrategy from '../models/PokemonStrategy';
import { TFunction } from 'i18next';
import SearchResult from '../models/searchResult';
import { defaultTeam, defaultTeamList, defaultTargets } from '../defaultList';

type TeamBuilderComponentProps = {

}

type TeamBuilderComponentState = {
  loading: boolean,
  teamPokemons: PokemonStrategy[],
  searchSettings: SearchSettings,
  strVectorColumns: string[],
  selectedTeamList: PokemonStrategy[],
  selectedTargets: PokemonStrategy[],
  allStrategies: PokemonStrategy[]
}

export class TeamBuilderComponent extends React.Component<TeamBuilderComponentProps, TeamBuilderComponentState> {
  constructor(props: TeamBuilderComponentProps) {
    super(props);
    this.state = { 
      loading: true,
      teamPokemons: [],
      searchSettings: { evaluationMethod: 0 },
      strVectorColumns: [],
      selectedTeamList: [],
      selectedTargets: [],
      allStrategies: []
    };

    masterDataService.loadMasterData().then(() => {
      const pokemonStrategies = masterDataService.getAllPokemonStrategies();
      const targetPokemonNames = masterDataService.getAllTargetPokemonNames();
      this.setState({ 
        loading: false,
        teamPokemons: defaultTeam(pokemonStrategies),
        selectedTeamList: defaultTeamList(pokemonStrategies),
        selectedTargets: defaultTargets(pokemonStrategies),
        strVectorColumns: targetPokemonNames,
        allStrategies: pokemonStrategies,
      });      
    }, error => {
      this.setState({ loading: false });
      console.log(error);
      throw new Error('Error: failed to init teamBuilderComponent');
    });
  }

  static contextType = I18nContext;

  onChangeTeamPokemons(pokemons: PokemonStrategy[]) {
    console.log('Team selection changed');
    console.log(pokemons.map(x => x.id));
    this.setState({ teamPokemons: pokemons });
  }

  onSearchSettingsChange(settings: SearchSettings) {
    this.setState({ searchSettings: settings });
  }

  onChangeSelectedTeamList(pokemons: PokemonStrategy[]) {
    console.log('Team list selection changed');
    console.log(pokemons.map(x => x.id));
    this.setState({ selectedTeamList: pokemons });
  }

  onChangeSelectedTargets(pokemons: PokemonStrategy[]) {
    console.log('Target selection changed');
    console.log(pokemons.map(x => x.id));
    this.setState({ selectedTargets: pokemons });
  }

  sortByTranslatedName(t: TFunction, pokemons: PokemonStrategy[]) {
    const sortedPokemonList = pokemons.concat();
    sortedPokemonList.sort((a, b) => {
      if (translateSpeciesIfPossible(a.species, t) < translateSpeciesIfPossible(b.species, t)) {
        return -1;
      } else if (translateSpeciesIfPossible(b.species, t) < translateSpeciesIfPossible(a.species, t)) {
        return 1;
      } else {
        return 0;
      }
    });

    return sortedPokemonList;
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    if (this.state.loading) {
      return <span>Loading...</span>
    } else {    
      const sortedAllStrategies = this.sortByTranslatedName(t, this.state.allStrategies);
      const sortedTeam = this.sortByTranslatedName(t, this.state.teamPokemons);
      const sortedTeamList = this.sortByTranslatedName(t, this.state.selectedTeamList);
      const sortedTargets = this.sortByTranslatedName(t, this.state.selectedTargets);
      const graphLabels = sortedTargets.map(x => translateSpeciesIfPossible(x.species, t));

      let teamStrengthValues = masterDataService.strValuesOfTeamStrategies(sortedTeam, sortedTargets);
      const graphDatasets = [
        {
          dataLabel: t('graph.teamStrengthValue'),
          values: teamStrengthValues.map(x => Math.round(x)),
          colorRGB: [255, 99, 132]
        }
      ]

      let results: SearchResult[] = [];
      if (this.state.searchSettings.evaluationMethod === 0) {
        results = masterDataService.calcTargetStrengthsComplement(sortedTeam, sortedTeamList, sortedTargets, ['Sweeper', 'Tank', 'Wall']);
      } else if (this.state.searchSettings.evaluationMethod === 1) {
        results = masterDataService.calcWeakestPointImmunity(sortedTeam, sortedTeamList, sortedTargets);
      } else if (this.state.searchSettings.evaluationMethod === 2 && this.state.searchSettings.targets) {
        results = masterDataService.calcImmunityToCustomTargets(sortedTeam, sortedTeamList, sortedTargets, 
          this.state.searchSettings.targets.filter(idStr => idStr));
      } else if (this.state.searchSettings.evaluationMethod === 3) {
        results = masterDataService.calcNegativesTotal(sortedTeam, sortedTeamList, sortedTargets);
      }

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
                <TeamComponent num={6} pokemonList={sortedTeamList} onChange={(pokemons: PokemonStrategy[]) => this.onChangeTeamPokemons(pokemons)}></TeamComponent>
              </Col>
            </Row>
            <Row>
              <Col>
                <Tabs id="function-tabs" defaultActiveKey="graph" className="mt-3">
                  <Tab eventKey="graph" title={t('tab.titleGraph')}>
                    <GraphComponent labels={graphLabels} datasets={graphDatasets}/>
                  </Tab>
                  <Tab eventKey="search" title={t('tab.titleSearch')}>
                    <SearchComponent targetsList={sortedTargets} onChange={(settings: SearchSettings) => this.onSearchSettingsChange(settings)}></SearchComponent>
                    <SearchResultComponent searchResult={results} />
                  </Tab>
                  <Tab eventKey="team-list-select" title={t('tab.titleTeamListSelect')}>
                    <Row className="mt-3 ml-2">
                      <Col>
                      <h4>{t('teamListSelect.title')}</h4>
                      </Col>
                    </Row>
                    <Row className="mt-3 ml-2">
                      <Col>
                        <TargetSelectComponent pokemonList={sortedAllStrategies} defaultList={defaultTeamList(this.state.allStrategies)} onChange={(pokemons: PokemonStrategy[]) => this.onChangeSelectedTeamList(pokemons)} />
                      </Col>
                    </Row>
                  </Tab>
                  <Tab eventKey="target-select" title={t('tab.titleTargetSelect')}>
                    <Row className="mt-3 ml-2">
                      <Col>
                      <h4>{t('targetSelect.title')}</h4>
                      </Col>
                    </Row>
                    <Row className="mt-3 ml-2">
                      <Col>
                        <TargetSelectComponent pokemonList={sortedAllStrategies} defaultList={defaultTargets(this.state.allStrategies)} onChange={(pokemons: PokemonStrategy[]) => this.onChangeSelectedTargets(pokemons)} />
                      </Col>
                    </Row>
                  </Tab>
                  {/* <Tab eventKey="battle-team" title="Battle Team">
                    <BattleTeamComponent sortedPokemonList={sortedAllStrategies} masterDataService={masterDataService} />
                  </Tab> */}
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
