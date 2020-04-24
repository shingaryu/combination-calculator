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
    for (let i = 0; i < this.num; i++) {
      pokemonSlots[i] = {
        id: this.pokemonList[i].id,
        enabled: true
      }
    }

    this.state = {
      pokemonSlots: pokemonSlots
    }
  }

  onInputChange(num, event) {
    const pokemons = this.state.pokemonSlots.concat();
    pokemons[num].id = event.target.value;

    this.setState({
      pokemons: pokemons
    });

    this.onChange(this.state.pokemonSlots.filter(x => x.enabled).map(y => y.id));
  }

  render() {
    return (
    <>
      <Container fluid>
        <Row>
          <Col>
            <Row>
              <Col>
                <h1>Your Team</h1>
              </Col>
            </Row>
            <Row>
              <Col>
                <div>
                    {
                      this.state.pokemonSlots && this.state.pokemonSlots.map((poke, index) => 
                        <InputGroup className="mb-2" key={index}>
                          <InputGroup.Prepend>
                            <InputGroup.Checkbox/>
                          </InputGroup.Prepend>
                          <FormControl as="select" value={poke.id} onChange={(e) => this.onInputChange(index, e)}>
                            {this.pokemonList.map(listPoke => (<option key={listPoke.id} value={listPoke.id}>{listPoke.name}</option>))}
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
