import React from 'react';
import { InputGroup, FormControl } from 'react-bootstrap'
import './targetSelectComponent.css'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';

export class TargetSelectComponent extends React.Component {
  constructor(props) {
    super(props);

    const targetPokemonStates = [];
    for (let i = 0; i < this.props.pokemonList.length; i++) {
      targetPokemonStates[i] = {
        index: i,
        poke: this.props.pokemonList[i],
        enabled: !!this.props.defaultList.find(tar => tar.id === this.props.pokemonList[i].id)
      }
    }

    this.state = {
      targetPokemonStates: targetPokemonStates,
    }
  }

  static contextType = I18nContext;

  onCheckboxChange(num, event) {
    const targetPokemonStates = this.state.targetPokemonStates.concat();
    targetPokemonStates[num].enabled = event.target.checked;

    this.setState({
      targetPokemonStates: targetPokemonStates
    });

    this.props.onChange(this.selectedTargets());
  }

  selectedTargets() {
    return this.state.targetPokemonStates.filter(x => x.enabled).map((x) => x.poke);
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    return (
    <>
      <div className="input-area">
          {
            this.state.targetPokemonStates && this.state.targetPokemonStates.map((state, index) => 
            <div className="inputgroup-container" key={index} >
              <div>
                <InputGroup className="mb-2" style={{width: 200}}>
                  <InputGroup.Prepend>
                    <InputGroup.Checkbox checked={state.enabled} onChange={(e) => this.onCheckboxChange(index, e)}/>
                  </InputGroup.Prepend>
                  <FormControl value={translateSpeciesIfPossible(state.poke.species, t)} placeholder={t('team.slotPlaceholder')} 
                    readOnly />
                </InputGroup>
              </div>
            </div>
            )
          }
      </div>
    </>
  )};
}
