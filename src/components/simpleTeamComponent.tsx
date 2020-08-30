import React from 'react';
import { InputGroup, FormControl } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';
import { defaultTeam } from '../defaultList';

type SimpleTeamComponentProps = {
  num: number,
  pokemonList: PokemonStrategy[],
  onChange: (pokemons: PokemonStrategy[]) => void
}

type SimpleTeamComponentState = {
  pokemonSlots: { poke: PokemonStrategy, enabled: boolean }[],
}

export class SimpleTeamComponent extends React.Component<SimpleTeamComponentProps, SimpleTeamComponentState> {
  constructor(props: SimpleTeamComponentProps) {
    super(props);
    if (!this.props.num || this.props.num < 1) {
      throw new Error ('Error: team length must be more than 0');
    }

    const defaultTeamPokemons = defaultTeam(this.props.pokemonList);
    const pokemonSlots = [];
    for (let i = 0; i < this.props.num; i++) {
      pokemonSlots[i] = {
        poke: defaultTeamPokemons[i],
        enabled: true
      }
    }

    this.state = {
      pokemonSlots: pokemonSlots,
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

  onSelectPokemon(slotNum: number, pokemonId: string) {
    const pokemons = this.state.pokemonSlots.concat();
    const poke = this.props.pokemonList.find(x => x.id === pokemonId) || pokemons[slotNum].poke;
    pokemons[slotNum].poke = poke;
    this.setState( { pokemonSlots: pokemons });

    this.props.onChange(this.validTeamPokemons());
  }

  validTeamPokemons() {
    return this.state.pokemonSlots.filter(x => x.enabled).map(y => y.poke);
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    return (
    <>
      <div>
          {
            this.state.pokemonSlots && this.state.pokemonSlots.map((slot, slotNum) => 
            <div className="inputgroup-container" key={slotNum} >
              <div>
                <InputGroup className="mb-2 mr-2" style={{width: 220}}>
                  <InputGroup.Prepend>
                    <InputGroup.Checkbox checked={slot.enabled} onChange={(e) => this.onCheckboxChange(slotNum, e)}/>
                  </InputGroup.Prepend>
                  <FormControl as="select" value={this.state.pokemonSlots[slotNum].poke.id}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onSelectPokemon(slotNum, e.target.value)}>
                    { this.props.pokemonList.map(poke => (
                      <option key={`op-opp-${poke.id}`} 
                        value={poke.id}>{translateSpeciesIfPossible(poke.species, t)}</option>
                    ))}
                  </FormControl>
                </InputGroup>
              </div>
            </div>
            )
          }
      </div>
    </>
  )};
}
