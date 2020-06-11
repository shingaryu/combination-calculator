import React from 'react';
import { Container, Row, Col, InputGroup, FormControl, Popover, OverlayTrigger, Button, Modal } from 'react-bootstrap'
import './teamComponent.css'
import { I18nContext } from 'react-i18next';

export class TeamComponent extends React.Component {
  constructor(props) {
    super(props);
    if (!this.props.num || this.props.num < 1) {
      throw new Error ('Error: team length must be more than 0');
    }

    const pokemonSlots = [];
    const defaultTeamIndices = ["18", "11", "23", "25", "2", "21"];
    for (let i = 0; i < this.props.num; i++) {
      pokemonSlots[i] = {
        id: defaultTeamIndices[i],
        enabled: true
      }
    }

    this.state = {
      pokemonSlots: pokemonSlots,
      showModal: false,
      editingSlot: null,
      selectedPokeIndex: null
    }
  }

  static contextType = I18nContext;

  onCheckboxChange(num, event) {
    const pokemons = this.state.pokemonSlots.concat();
    pokemons[num].enabled = event.target.checked;

    this.setState({
      pokemons: pokemons
    });

    this.props.onChange(this.validTeamPokemonIndices());
  }

  onInputChange(num, event) {
    const pokemons = this.state.pokemonSlots.concat();
    pokemons[num].id = event.target.value;

    this.setState({
      pokemons: pokemons
    });

    this.props.onChange(this.validTeamPokemonIndices());
  }

  onModalOpen(slotToBeEdited) {
    this.setState({
      modalShow: true,
      editingSlot: slotToBeEdited,
      selectedPokeIndex: this.state.pokemonSlots[slotToBeEdited].id
    });    
  }

  onModalCancel() {
    this.setState({
      modalShow: false,
      editingSlot: null,
      selectedPokeIndex: null
    });
  }

  onModalApply() {
    const pokemons = this.state.pokemonSlots.concat();
    pokemons[this.state.editingSlot].id = this.state.selectedPokeIndex;

    this.setState({
      pokemons: pokemons,
      modalShow: false,
      editingSlot: null,
      selectedPokeIndex: null
    });

    this.props.onChange(this.validTeamPokemonIndices());
  }

  onClickPokemonCard(index) {
    this.setState({
      selectedPokeIndex: index
    });
  }

  teamPokemonOptions() {
    const options = [];
    options.push(<option key={-1} value={-1}> </option>); // empty
    this.props.pokemonList.forEach((listPoke, i) => options.push(<option key={i} value={i}>{listPoke.species}</option>));
    return options;
  }

  validTeamPokemonIndices() {
    return this.state.pokemonSlots.filter(x => x.enabled && x.id !== "-1").map(y => y.id);
  }

  pokemonStrategyCard(poke, isSelected) {
    const card = (
      <>
        <div className={isSelected? "str-card selected-card": "str-card" }>
          <div className='name-line'>
            {poke.species} {poke.gender ? poke.gender + ' ': ''} {poke.item ? '@ ' + poke.item: ''}
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
               <h2>{t('team.title')}</h2>
              </Col>
            </Row>
            <Row>
              <Col>
                <div>
                    {
                      this.state.pokemonSlots && this.state.pokemonSlots.map((poke, slot) => 
                      <div className="inputgroup-container" key={slot} >
                        <div>
                          <InputGroup className="mb-2 mr-2" style={{width: 200}}>
                            <InputGroup.Prepend>
                              <InputGroup.Checkbox checked={poke.enabled} onChange={(e) => this.onCheckboxChange(slot, e)}/>
                            </InputGroup.Prepend>
                            <FormControl value={this.props.pokemonList[poke.id].species} placeholder="Click or tap to select" disabled/>
                          </InputGroup>
                        </div>
                        <div className="set-button-line">
                          <Button variant="outline-dark" size="sm" onClick={() => this.onModalOpen(slot)}>Set</Button>
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
          <Modal.Title>Select Pokemon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='str-list'>
            {this.props.pokemonList.map((poke, index) => 
              <div key={poke.id} onClick={() => this.onClickPokemonCard(index)}>
                {this.pokemonStrategyCard(poke, index == this.state.selectedPokeIndex)}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => this.onModalCancel()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => this.onModalApply()}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )};
}
