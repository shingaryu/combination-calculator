import React from 'react';
import { Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap'
import './targetSelectComponent.css'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';

export class TargetSelectComponent extends React.Component {
  constructor(props) {
    super(props);

    const targetPokemonStates = [];
    const defaultIndices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 20, 21, 22, 26, 27, 28, 29, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 45, 46, 48, 49, 50, 52, 53, 55, 56, 57];
    for (let i = 0; i < this.props.allTargetNames.length; i++) {
      targetPokemonStates[i] = {
        index: i,
        name: this.props.allTargetNames[i],
        enabled: defaultIndices.indexOf(i) >= 0
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

    this.props.onChange(this.selectedTargetIndices());
  }

  selectedTargetIndices() {
    return this.state.targetPokemonStates.filter(x => x.enabled).map((x) => x.index);
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    return (
    <>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <Row>
              <Col>
               <h4>{t('targetSelect.title')}</h4>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <div className="input-area">
                    {
                      this.state.targetPokemonStates && this.state.targetPokemonStates.map((state, index) => 
                      <div className="inputgroup-container" key={index} >
                        <div>
                          <InputGroup className="mb-2" style={{width: 200}}>
                            <InputGroup.Prepend>
                              <InputGroup.Checkbox checked={state.enabled} onChange={(e) => this.onCheckboxChange(index, e)}/>
                            </InputGroup.Prepend>
                            <FormControl value={translateSpeciesIfPossible(state.name, t)} placeholder={t('team.slotPlaceholder')} 
                              readOnly />
                          </InputGroup>
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
