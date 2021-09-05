import React from 'react';
import { Row, Col, Tabs, Tab } from 'react-bootstrap'
import { SearchComponent } from './searchComponent';
import TeamComponent from './TeamComponent';
import { masterDataService, loadMasterDataResource } from '../services/masterDataService';
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
import { defaultTeamList, defaultTargets } from '../defaultList';
import { StatisticalEvaluation } from './statisticalEvaluation';
import { getSearchSettings, getTeamPokemons } from '../redux/selectors';
import { setSearchSettings, loadMasterData, setTeamPokemons } from '../redux/actions'
import { connect } from 'react-redux';

type TeamBuilderComponentProps = {
  searchSettings: SearchSettings,
  setSearchSettings: (value: SearchSettings) => void,
  loadMasterData: () => void,
  teamPokemons: PokemonStrategy[]
}

type TeamBuilderComponentState = {
  strVectorColumns: string[],
  selectedTeamList: PokemonStrategy[],
  selectedTargets: PokemonStrategy[],
  allStrategies: PokemonStrategy[]
}

class TeamBuilderComponent extends React.Component<TeamBuilderComponentProps, TeamBuilderComponentState> {
  constructor(props: TeamBuilderComponentProps) {
    super(props);

    // wait until master data is loaded 
    loadMasterDataResource.read();

    const pokemonStrategies = masterDataService.getAllPokemonStrategies();
    const targetPokemonNames = masterDataService.getAllTargetPokemonNames();
    
    this.state = { 
      strVectorColumns: targetPokemonNames,
      selectedTeamList: defaultTeamList(pokemonStrategies),
      selectedTargets: defaultTargets(pokemonStrategies),
      allStrategies: pokemonStrategies,
    };
  }

  static contextType = I18nContext;

  componentDidMount() {
    this.props.loadMasterData();
  }

  onSearchSettingsChange(settings: SearchSettings) {
    this.props.setSearchSettings(settings);
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
    if (this.props.teamPokemons.length === 0) {
      return <></>
    }

    const t = this.context.i18n.t.bind(this.context.i18n);

    const sortedAllStrategies = this.sortByTranslatedName(t, this.state.allStrategies);
    const sortedTeam = this.sortByTranslatedName(t, this.props.teamPokemons);
    const sortedTeamList = this.sortByTranslatedName(t, this.state.selectedTeamList);
    const sortedTargets = this.sortByTranslatedName(t, this.state.selectedTargets);

    let results: SearchResult[] = [];
    if (this.props.searchSettings.evaluationMethod === 0) {
      results = masterDataService.calcTargetStrengthsComplement(sortedTeam, sortedTeamList, sortedTargets, ['Sweeper', 'Tank', 'Wall']);
    } else if (this.props.searchSettings.evaluationMethod === 1) {
      results = masterDataService.calcWeakestPointImmunity(sortedTeam, sortedTeamList, sortedTargets);
    } else if (this.props.searchSettings.evaluationMethod === 2 && this.props.searchSettings.targets) {
      results = masterDataService.calcImmunityToCustomTargets(sortedTeam, sortedTeamList, sortedTargets, 
        this.props.searchSettings.targets.filter(idStr => idStr));
    } else if (this.props.searchSettings.evaluationMethod === 3) {
      results = masterDataService.calcNegativesTotal(sortedTeam, sortedTeamList, sortedTargets);
    }

    return (
      <>
        <Row className="mt-3">
          <Col>
            <h4>{t('overview.title')}</h4>
            <div className="description-box mb-4">
              <div dangerouslySetInnerHTML={{__html: t('overview.textline1')}} />
            </div>            
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <h4>{t('team.title')}</h4>
            <div className="description-box mb-4">
              <div dangerouslySetInnerHTML={{__html: t('team.description')}} />
              <div className="tips">・{t('team.tips1')}</div>
              <div className="tips">・{t('team.tips2')}</div>
              <div className="tips">・{t('team.tips3')}</div>
            </div>            
            <TeamComponent num={6} defaultTeam={sortedTeam} pokemonList={sortedTeamList} selectedTargets={sortedTargets} ></TeamComponent>
          </Col>
        </Row>
        <Row>
          <Col>
            <Tabs id="function-tabs" defaultActiveKey="graph" className="mt-3">
              <Tab eventKey="graph" title={t('tab.titleGraph')}>
                <Row className="mt-3">
                  <Col>
                    <StatisticalEvaluation myTeam={this.props.teamPokemons} sortedPokemonList={sortedTargets} />
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="search" title={t('tab.titleSearch')}>
                <SearchComponent targetsList={sortedTargets} onChange={(settings: SearchSettings) => this.onSearchSettingsChange(settings)}></SearchComponent>
                <SearchResultComponent searchResult={results} />
              </Tab>
              <Tab eventKey="team-list-select" title={t('tab.titleTeamListSelect')}>
                <Row className="mt-3">
                  <Col>
                  <h4>{t('teamListSelect.title')}</h4>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <TargetSelectComponent pokemonList={sortedAllStrategies} defaultList={defaultTeamList(this.state.allStrategies)} onChange={(pokemons: PokemonStrategy[]) => this.onChangeSelectedTeamList(pokemons)} />
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="target-select" title={t('tab.titleTargetSelect')}>
                <Row className="mt-3">
                  <Col>
                  <h4>{t('targetSelect.title')}</h4>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <TargetSelectComponent pokemonList={sortedAllStrategies} defaultList={defaultTargets(this.state.allStrategies)} onChange={(pokemons: PokemonStrategy[]) => this.onChangeSelectedTargets(pokemons)} />
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="battle-team" title={t('tab.titleBattleTeam')}>
                <BattleTeamComponent myTeam={this.props.teamPokemons} sortedPokemonList={sortedAllStrategies} />
              </Tab>
            </Tabs>    
          </Col>
        </Row>
        <Row className="reference-row">
          <Col>
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
          </Col>
        </Row>
      </>
    )
  };
}

const mapStateToProps = (state: any) => {
  const searchSettings = getSearchSettings(state);
  const teamPokemons = getTeamPokemons(state);
  return { searchSettings, teamPokemons };
};
const mapDispatchToProps = {
  setSearchSettings, 
  loadMasterData,
  setTeamPokemons, 
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamBuilderComponent);
