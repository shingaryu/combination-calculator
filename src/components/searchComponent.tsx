import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';
import { translateSpeciesIfPossible } from '../services/stringSanitizer';
import PokemonStrategy from '../models/PokemonStrategy';
import SearchSettings from '../models/searchSettings';

type SearchComponentProps = {
  pokemonList: PokemonStrategy[],
  onChange: (settings: SearchSettings) => void
}

type SearchComponentState = {
  evaluationMethod: number,
  numOfTargetHolders: number,
  targets: string[]
}

export class SearchComponent extends React.Component<SearchComponentProps, SearchComponentState> {
  constructor(props: SearchComponentProps) {
    super(props);
    const numOfTargetHolders = 4;
    this.state = {
      evaluationMethod: 0,
      numOfTargetHolders: numOfTargetHolders,
      targets: [...Array(numOfTargetHolders)].map(x => '')
    };
  }

  static contextType = I18nContext;

  onChangeSearchSettings(event: React.ChangeEvent<HTMLInputElement>) {
    let newState = {...this.state};
    if (event.target.id === 'evaluation-method') {
      newState = {...this.state, evaluationMethod: parseInt(event.target.value)}
    }
    
    this.setState(newState);
    this.props.onChange(newState);
  }

  onSelectTargets(slot: number, targetId: string) {
    console.log(`slot: ${slot}, targetId: ${targetId}`);
    const targets = this.state.targets;
    targets[slot] = targetId;
    const newState = { ...this.state, targets};
    this.setState(newState);
    console.log(newState);

    this.props.onChange(newState);
  }

  render() {
    const t = this.context.i18n.t.bind(this.context.i18n);

    return (
    <>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <h4>{t('search.settingsTitle')}</h4>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form>
              <Form.Group controlId="evaluation-method">
                <Form.Label>{t('search.evaluationMethod')}</Form.Label>
                <Form.Control as="select" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onChangeSearchSettings(e)}>
                  <option value="0">{t('search.targetStrenthComplement')}</option>
                  <option value="1">{t('search.weakestPointImmunity')}</option>
                  <option value="2">Set custom targets</option>
                  <option value="3">Overall minus</option>
                </Form.Control>
              </Form.Group>
              {
                this.state.evaluationMethod === 2 && <div className="mb-2">Targets</div>
              }
              {
                this.state.evaluationMethod === 2 && [...Array(this.state.numOfTargetHolders)].map((x, i) => {
                  return (
                    <Form.Group key={`fg-${i}`} controlId={`target-list-${i}`}>
                      {/* <Form.Label>Targets</Form.Label> */}
                      <Form.Control as="select" onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onSelectTargets(i, e.target.value)}>
                        <option key={`op-${i}-empty`} />
                        { this.props.pokemonList.map((poke) => (
                          <option key={`op-${i}-${poke.id}`} 
                            value={poke.id}>{translateSpeciesIfPossible(poke.species, t)}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  )
                })
              }
            </Form>          
          </Col>
        </Row>
      </Container>
    </>
    )};
}
