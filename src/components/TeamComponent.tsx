import React from 'react';
import { InputGroup, FormControl, Button, Modal, Popover, OverlayTrigger } from 'react-bootstrap'
import './teamComponent.css'
import { WithTranslation } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';
import { defaultTeam } from '../defaultList';
import Autosuggest, { SuggestionSelectedEventData } from 'react-autosuggest';
import { withTranslation } from 'react-i18next';
import { GraphComponent } from './graphComponent';
import { masterDataService } from '../services/masterDataService';
import { TFunction } from 'i18next';

type TeamComponentProps = {
  num: number,
  pokemonList: PokemonStrategy[],
  selectedTargets: PokemonStrategy[],
  onChange: (pokemons: PokemonStrategy[]) => void,
} & WithTranslation

type TeamComponentState = {
  pokemonSlots: { poke: PokemonStrategy | null, enabled: boolean, inputText: string }[],
  showModal: false,
  editingSlot: number,
  selectedPoke: PokemonStrategy | null,
  modalShow: boolean,
  detailShow: boolean,
  suggestions: any[],
  pokeValue: string
}

type PokeNameSuggestion = {
  name: string, 
  strategy: PokemonStrategy 
}

export class TeamComponentRaw extends React.Component<TeamComponentProps, TeamComponentState> {
  constructor(props: TeamComponentProps) {
    super(props);
    if (!this.props.num || this.props.num < 1) {
      throw new Error ('Error: team length must be more than 0');
    }

    const defaultTeamPokemons = defaultTeam(this.props.pokemonList);
    const pokemonSlots = [];
    for (let i = 0; i < this.props.num; i++) {
      pokemonSlots[i] = {
        poke: defaultTeamPokemons[i],
        enabled: true,
        inputText: translateSpeciesIfPossible(defaultTeamPokemons[i].species, this.props.t)
      }
    }

    this.state = {
      pokemonSlots: pokemonSlots,
      showModal: false,
      editingSlot: -1,
      selectedPoke: null,
      modalShow: false,
      detailShow: false,
      suggestions: [],
      pokeValue: ""
    }

    this.allSuggestions = this.props.pokemonList.map(x => ({ name: translateSpeciesIfPossible(x.species, this.props.t), strategy: x}));
  }

  private allSuggestions: PokeNameSuggestion[];

  onCheckboxChange(num: number, event: React.ChangeEvent<HTMLInputElement>) {
    const pokemons = this.state.pokemonSlots.concat();
    pokemons[num].enabled = event.target.checked;

    this.setState({
      pokemonSlots: pokemons
    });

    this.props.onChange(this.validTeamPokemons());
  }

  onModalOpen(slotToBeEdited: number) {
    this.setState({
      modalShow: true,
      editingSlot: slotToBeEdited,
      selectedPoke: this.state.pokemonSlots[slotToBeEdited].poke
    });    
  }

  onModalCancel() {
    this.setState({
      modalShow: false,
      // editingSlot: -1,
      selectedPoke: null
    });
  }

  onModalApply() {
    const pokemons = this.state.pokemonSlots.concat();
    if (this.state.selectedPoke) {
      pokemons[this.state.editingSlot].poke = this.state.selectedPoke;
      pokemons[this.state.editingSlot].inputText = translateSpeciesIfPossible(this.state.selectedPoke.species, this.props.t);
    }

    this.setState({
      pokemonSlots: pokemons,
      modalShow: false,
      // editingSlot: -1,
      selectedPoke: null
    });

    this.props.onChange(this.validTeamPokemons());
  }

  onDetailOpen(slotToShow: number) {
    this.setState({
      detailShow: true,
      editingSlot: slotToShow,
      selectedPoke: this.state.pokemonSlots[slotToShow].poke
    });    
  }

  onDetailClose() {
    this.setState({
      detailShow: false,
      // editingSlot: -1,
      selectedPoke: null
    });
  }

  onClickPokemonCard(poke: PokemonStrategy) {
    this.setState({
      selectedPoke: poke
    });
  }

  validTeamPokemons() {
    // console.log(this.state.pokemonSlots.filter(x => x.enabled && x.poke).map(y => translateSpeciesIfPossible(y.poke? y.poke.species: "", this.props.t)));
    return this.state.pokemonSlots.filter(x => x.enabled && x.poke).map(y => y.poke as PokemonStrategy);
  }

  // get matched suggestion objects from user input
  getSuggestions(userInput: string): PokeNameSuggestion[] {
    const inputValue = userInput;
    const inputLength = inputValue.length;
  
    return inputLength === 0 ? [] : this.allSuggestions.filter(suggestion =>
      suggestion.name.slice(0, inputLength) === inputValue
    );
  };

  // create value (for DOM) from suggestion object
  getSuggestionValue(suggestion: PokeNameSuggestion): string {
    return suggestion.name;
  }

  renderInputComponent(inputProps: any, isInvalid: boolean) {
    return (
      <FormControl {...inputProps} isInvalid={isInvalid} />
    )
  }

  // JSX of autosuggest selections
  renderSuggestion(suggestion: PokeNameSuggestion) {
    return (
      <span>
        {suggestion.name}
      </span>
    );
  }

  // when user input is updated, do something 
  onSuggestionsFetchRequested = ({ value }: any) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onSuggestionSelectedOnSlot = (slotNum: number, event: React.FormEvent<any>, data: SuggestionSelectedEventData<PokeNameSuggestion>) => {
    const pokemons = this.state.pokemonSlots.concat();

    // input text is unchanged but the user select a different strategy from suggestions
    // onChangeInput() is not called in this case
    if ((pokemons[slotNum].inputText === data.suggestionValue) && (pokemons[slotNum].poke?.id !== data.suggestion.strategy.id)) {
      // console.log('changed to other strategy with same name')
      pokemons[slotNum].poke = data.suggestion.strategy;
      this.setState({ pokemonSlots: pokemons });
      this.props.onChange(this.validTeamPokemons());
    }
  }

  // called when input control is actually updated
  onChangeInput = (slotNum: number, event: any, { newValue }: any) => {
    // console.log(`onchange: slot ${slotNum} value ${newValue}`);
  
    const pokemons = this.state.pokemonSlots.concat();
    const isPreviousInvalid = !pokemons[slotNum].poke;
    pokemons[slotNum].inputText = newValue;

    const matchedSuggestion = this.allSuggestions.find(x => x.name === newValue);
    let isCurrentInvalid = false;
    if (matchedSuggestion) {
      // console.log('matched ' + matchedSuggestion.name);
      pokemons[slotNum].poke = matchedSuggestion.strategy;
      isCurrentInvalid = false;
    } else {
      pokemons[slotNum].poke = null;
      isCurrentInvalid = true;
    }

    this.setState({
      pokemonSlots: pokemons
    });

    if (isPreviousInvalid && isCurrentInvalid) {
      return;
    } else {
      this.props.onChange(this.validTeamPokemons());
    }
  };

  pokemonStrategyCard(poke: PokemonStrategy, isSelected: boolean) {
    const { t } = this.props;

    const card = (
      <>
        <div className={isSelected? "str-card selected-card": "str-card" }>
          <div className='name-line'>
            {translateSpeciesIfPossible(poke.species, t)} {poke.gender ? poke.gender + ' ': ''} {poke.item ? '@ ' + poke.item: ''}
          </div>
          <div className='strategy-line'>
            {poke.ability}, {poke.nature}, {poke.ev_hp}-{poke.ev_atk}-{poke.ev_def}-{poke.ev_spa}-{poke.ev_spd}-{poke.ev_spe}
          </div>
          <div className='strategy-line'>
            {poke.move1}, {poke.move2}, {poke.move3}, {poke.move4}
          </div>
        </div>
      </>
    )

    return card;
  }

  pokemonDetailsPopover(poke: PokemonStrategy | null) {
    if (!poke) {
      return <div></div>;
    }

    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">{translateSpeciesIfPossible(poke.species, this.props.t)}</Popover.Title>
        <Popover.Content>
          <div className="details-row">
            <span className="details-param">Item </span>
            <span className="details-value">{poke.item}</span>
          </div>
          <div className="details-row">
            <span className="details-param">Ability </span>
            <span className="details-value">{poke.ability}</span>
          </div>
          <div className="details-row">
            <span className="details-param">Nature </span>
            <span className="details-value">{poke.nature}</span>
          </div>
          <div className="details-row">
            <span className="details-param">EVs </span>
            <span className="details-value">{poke.ev_hp}-{poke.ev_atk}-{poke.ev_def}-{poke.ev_spa}-{poke.ev_spd}-{poke.ev_spe}</span>
          </div>
          <div className="details-row">
            <span className="details-param">Move 1 </span>
            <span className="details-value">{poke.move1}</span>
          </div>
          <div className="details-row">
            <span className="details-param">Move 2 </span>
            <span className="details-value">{poke.move2}</span>
          </div>
          <div className="details-row">
            <span className="details-param">Move 3 </span>
            <span className="details-value">{poke.move3}</span>
          </div>
          <div className="details-row">
            <span className="details-param">Move 4 </span>
            <span className="details-value">{poke.move4}</span>
          </div>
        </Popover.Content>
      </Popover>
    );

    return popover;
  }

  pokemonIndividualStrDataset = (poke: PokemonStrategy | null, t: TFunction) => {
    if (!poke) {
      return [
        {
          dataLabel: t('team.detailModal.strengthFromThisPoke'),
          values: [...Array(this.props.selectedTargets.length)].map(x => 0),
          colorRGB: [255, 99, 132]
        }
      ];
    }
    
    const teamStrengthValues = masterDataService.strValuesOfTeamStrategies([poke], this.props.selectedTargets);
    const graphDatasets = [
      {
        dataLabel: t('team.detailModal.strengthFromThisPoke').replace('{name}', translateSpeciesIfPossible(poke.species, t)),
        values: teamStrengthValues.map(x => Math.round(x)),
        colorRGB: [255, 99, 132]
      }
    ];

    return graphDatasets;
  }

  render() {
    const { t } = this.props;

    return (
    <>
      <div>
          {
            this.state.pokemonSlots && this.state.pokemonSlots.map((slot, slotNum) => 
            <div className="inputgroup-container" key={slotNum} >
              <div>
                <InputGroup className="mb-2 mr-2" style={{width: 200}}>
                  <InputGroup.Prepend>
                    <InputGroup.Checkbox checked={slot.enabled} onChange={(e) => this.onCheckboxChange(slotNum, e)}/>
                  </InputGroup.Prepend>
                  {/* <FormControl value={translateSpeciesIfPossible(slot.poke.species, t)} placeholder={t('team.slotPlaceholder')} 
                    /> */}
                  <Autosuggest
                    suggestions={this.state.suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    onSuggestionSelected={(event: React.FormEvent<any>, data: SuggestionSelectedEventData<PokeNameSuggestion>) => this.onSuggestionSelectedOnSlot(slotNum, event, data)}
                    getSuggestionValue={this.getSuggestionValue}
                    renderInputComponent={(inputProps: any) => this.renderInputComponent(inputProps, !this.state.pokemonSlots[slotNum].poke)}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={{placeholder: t('team.slotPlaceholder'), onChange: (event: any, { newValue }: any) => this.onChangeInput(slotNum, event, { newValue }), value: this.state.pokemonSlots[slotNum].inputText}}
                  />
                </InputGroup>
              </div>
              <div className="set-button-line mr-2">
                <Button variant="outline-dark" size="sm" onClick={() => this.onModalOpen(slotNum)}>{t('team.set')}</Button>
              </div>
              <div className="details-line">
                {/* <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" overlay={this.pokemonDetailsPopover(slot.poke)}>
                  <Button variant="outline-dark" size="sm" disabled={!slot.poke}>{t('team.detail')}</Button>
                </OverlayTrigger> */}
                <Button variant="outline-dark" size="sm" disabled={!slot.poke} onClick={() => this.onDetailOpen(slotNum)}>{t('team.detail')}</Button>
              </div>                        
            </div>
            )
          }
      </div>
      <Modal size="lg" show={this.state.modalShow} onHide={() => this.onModalCancel()}>
        <Modal.Header closeButton>
          <Modal.Title>{t('team.modal.title').replace('{num}', (this.state.editingSlot + 1).toString())}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='str-list'>
            {this.props.pokemonList.map(poke => 
              <div key={poke.id} onClick={() => this.onClickPokemonCard(poke)}>
                {this.pokemonStrategyCard(poke, poke.id === this.state.selectedPoke?.id)}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => this.onModalCancel()}>
            {t('team.modal.cancel')}
          </Button>
          <Button variant="primary" onClick={() => this.onModalApply()}>
            {t('team.modal.apply')}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal size="lg" show={this.state.detailShow} onHide={() => this.onDetailClose()}>
        <Modal.Header closeButton>
          <Modal.Title>{t('team.detailModal.title').replace('{num}', (this.state.editingSlot + 1).toString())}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='str-list'>
            {this.state.selectedPoke? this.pokemonStrategyCard(this.state.selectedPoke, false): ''}
            <div className="description-box mb-4">
              <div dangerouslySetInnerHTML={{__html: t('team.detailModal.description')}} />
            </div>                       
            <GraphComponent labels={this.props.selectedTargets.map(x => translateSpeciesIfPossible(x.species, t))} datasets={this.pokemonIndividualStrDataset(this.state.selectedPoke, t)}
              valueMin={-1024} valueMax={1024} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => this.onDetailClose()}>
            {t('team.detailModal.ok')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )};
}

export const TeamComponent = withTranslation()(TeamComponentRaw);
