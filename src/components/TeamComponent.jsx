import React from 'react';
import { Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap'

export class TeamComponent extends React.Component {
  constructor(props) {
    super(props);
    this.num = props.num;
    this.pokemonList = props.pokemonList;
    this.onChange = props.onChange;
    if (!this.num || this.num < 1) {
      throw new Error ('Error: team length must be more than 0');
    }

    const pokemonSlots = [];
    const defaultTeamIndices = ["18", "11", "23", "25", "2", "21"];
    for (let i = 0; i < this.num; i++) {
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

    this.onChange(this.validTeamPokemonIndices());
  }

  onInputChange(num, event) {
    const pokemons = this.state.pokemonSlots.concat();
    pokemons[num].id = event.target.value;

    this.setState({
      pokemons: pokemons
    });

    this.onChange(this.validTeamPokemonIndices());
  }

  teamPokemonOptions() {
    const options = [];
    options.push(<option key={-1} value={-1}> </option>); // empty
    this.pokemonList.forEach(listPoke => options.push(<option key={listPoke.id} value={listPoke.id}>{listPoke.name}</option>));
    return options;
  }

  validTeamPokemonIndices() {
    return this.state.pokemonSlots.filter(x => x.enabled && x.id !== "-1").map(y => y.id);
  }

  render() {
    return (
    <>
      <Container fluid>
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
                        <InputGroup className="mb-2" key={index} style={{width: 200}}>
                          <InputGroup.Prepend>
                            <InputGroup.Checkbox checked={poke.enabled} onChange={(e) => this.onCheckboxChange(index, e)}/>
                          </InputGroup.Prepend>
                          <FormControl as="select" value={poke.id} onChange={(e) => this.onInputChange(index, e)}>
                            {this.teamPokemonOptions()}
                          </FormControl>
                        </InputGroup>
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
