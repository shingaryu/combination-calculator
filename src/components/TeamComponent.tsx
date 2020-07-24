import React from 'react';
import { Container, Row, Col, InputGroup, FormControl, Button, Modal } from 'react-bootstrap'
import './teamComponent.css'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';

type TeamComponentProps = {
  num: number,
  pokemonList: PokemonStrategy[],
  onChange: (pokemons: PokemonStrategy[]) => void
}

type TeamComponentState = {
  pokemonSlots: { poke: PokemonStrategy, enabled: boolean }[],
  showModal: false,
  editingSlot: number,
  selectedPoke: PokemonStrategy | null,
  modalShow: boolean
}

export class TeamComponent extends React.Component<TeamComponentProps, TeamComponentState> {
  constructor(props: TeamComponentProps) {
    super(props);
    if (!this.props.num || this.props.num < 1) {
      throw new Error ('Error: team length must be more than 0');
    }

    const pokemonSlots = [];
    const defaultTeamIndices = [0, 49, 33, 12, 43, 39];
    for (let i = 0; i < this.props.num; i++) {
      pokemonSlots[i] = {
        poke: this.props.pokemonList[defaultTeamIndices[i]],
        enabled: true
      }
    }

    this.state = {
      pokemonSlots: pokemonSlots,
      showModal: false,
      editingSlot: -1,
      selectedPoke: null,
      modalShow: false
    }
  }

  static contextType = I18nContext;

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
    }

    this.setState({
      pokemonSlots: pokemons,
      modalShow: false,
      // editingSlot: -1,
      selectedPoke: null
    });

    this.props.onChange(this.validTeamPokemons());
  }

  onClickPokemonCard(poke: PokemonStrategy) {
    this.setState({
      selectedPoke: poke
    });
  }

  validTeamPokemons() {
    return this.state.pokemonSlots.filter(x => x.enabled).map(y => y.poke);
  }

  pokemonStrategyCard(poke: PokemonStrategy, isSelected: boolean) {
    const t = this.context.i18n.t.bind(this.context.i18n);

    const card = (
      <>
        <div className={isSelected? "str-card selected-card": "str-card" }>
          <div className='name-line'>
            {translateSpeciesIfPossible(poke.species, t)} {poke.gender ? poke.gender + ' ': ''} {poke.item ? '@ ' + poke.item: ''}
          </div>
          <div>
            {poke.ability}, {poke.nature}, {poke.ev_hp}-{poke.ev_atk}-{poke.ev_def}-{poke.ev_spa}-{poke.ev_spd}-{poke.ev_spe}
          </div>
          <div>
            {poke.move1}, {poke.move2}, {poke.move3}, {poke.move4}
          </div>
        </div>
      </>
    )

    return card;
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    return (
    <>
      <Container fluid className="mb-3">
        <Row>
          <Col>
            <Row>
              <Col>
               <h4>{t('team.title')}</h4>
              </Col>
            </Row>
            <Row>
              <Col>
                <div>
                    {
                      this.state.pokemonSlots && this.state.pokemonSlots.map((slot, slotNum) => 
                      <div className="inputgroup-container" key={slotNum} >
                        <div>
                          <InputGroup className="mb-2 mr-2" style={{width: 200}}>
                            <InputGroup.Prepend>
                              <InputGroup.Checkbox checked={slot.enabled} onChange={(e) => this.onCheckboxChange(slotNum, e)}/>
                            </InputGroup.Prepend>
                            <FormControl value={translateSpeciesIfPossible(slot.poke.species, t)} placeholder={t('team.slotPlaceholder')} 
                              readOnly onClick={() => this.onModalOpen(slotNum)}/>
                          </InputGroup>
                        </div>
                        <div className="set-button-line">
                          <Button variant="outline-dark" size="sm" onClick={() => this.onModalOpen(slotNum)}>{t('team.set')}</Button>
                        </div>
                      </div>
                      )
                    }
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
      <Modal size="lg" show={this.state.modalShow} onHide={() => this.onModalCancel()}>
        <Modal.Header closeButton>
          <Modal.Title>{t('team.modal.title').replace('{num}', this.state.editingSlot + 1)}</Modal.Title>
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
    </>
  )};
}
