import React from 'react';
// import './App.css';
// import { combinationCalculator } from './combination-calculator';
import { Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap'

export class MyTeamComponent extends React.Component {
  constructor(props) {
    super(props);
    this.num = props.num;
    this.onChange = props.onChange;
    if (!this.num || this.num < 1) {
      throw new Error ('Error: team length must be more than 0');
    }

    const pokemons = [];
    for (let i = 0; i < this.num; i++) {
      pokemons[i] = {
        name: 'Dracovish',
        enabled: false
      }
    }

    this.state = {
      pokemons: pokemons
    }
  }

  onInputChange(num, event) {
    const pokemons = this.state.pokemons.concat();
    pokemons[num].name = event.target.value;

    this.setState({
      pokemons: pokemons
    });
  }

  render() {
    return (
    <>
      <Container fluid>
        <Row>
          <Col>
            <Row>
              <Col>
                <h1>My Team</h1>
              </Col>
            </Row>
            <Row>
              <Col>
                <div>
                    {
                      this.state.pokemons && this.state.pokemons.map((poke, index) => 
                        <InputGroup className="mb-2" key={index}>
                          <InputGroup.Prepend>
                            <InputGroup.Checkbox/>
                          </InputGroup.Prepend>
                          <FormControl value={poke.name} onChange={(e) => this.onInputChange(index, e)}/>
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
