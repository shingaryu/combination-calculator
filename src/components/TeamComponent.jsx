import React from 'react';
import { Container, Row, Col, InputGroup, FormControl, Popover, OverlayTrigger, Button } from 'react-bootstrap'
import './teamComponent.css'

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
      pokemonSlots: pokemonSlots
    }
  }

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

  teamPokemonOptions() {
    const options = [];
    options.push(<option key={-1} value={-1}> </option>); // empty
    this.props.pokemonList.forEach((listPoke, i) => options.push(<option key={i} value={i}>{listPoke.species}</option>));
    return options;
  }

  validTeamPokemonIndices() {
    return this.state.pokemonSlots.filter(x => x.enabled && x.id !== "-1").map(y => y.id);
  }

  pokemonDetailsPopover(index) {
    const poke = this.props.pokemonList[index];

    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">{poke.species}</Popover.Title>
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

  render() {
    return (
    <>
      <Container fluid className="mb-3">
        <Row>
          <Col>
            <Row>
              <Col>
                <h2>Your Team</h2>
              </Col>
            </Row>
            <Row>
              <Col>
                <div>
                    {
                      this.state.pokemonSlots && this.state.pokemonSlots.map((poke, index) => 
                      <div className="inputgroup-container" key={index} >
                        <div>
                          <InputGroup className="mb-2 mr-2" style={{width: 200}}>
                            <InputGroup.Prepend>
                              <InputGroup.Checkbox checked={poke.enabled} onChange={(e) => this.onCheckboxChange(index, e)}/>
                            </InputGroup.Prepend>
                            <FormControl as="select" value={poke.id} onChange={(e) => this.onInputChange(index, e)}>
                              {this.teamPokemonOptions()}
                            </FormControl>
                          </InputGroup>
                        </div>
                        <div className="details-line">
                          <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" overlay={this.pokemonDetailsPopover(poke.id)}>
                            <Button variant="outline-dark" size="sm">Details</Button>
                          </OverlayTrigger>
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
    </>
  )};
}
