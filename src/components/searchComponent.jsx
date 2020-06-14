import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap'
import { I18nContext } from 'react-i18next';

export class SearchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      evaluationMethod: 0
    };
  }

  static contextType = I18nContext;

  onChangeSearchSettings(event) {
    let newState = {...this.state};
    if (event.target.id === 'evaluation-method') {
      newState = {...this.state, evaluationMethod: parseInt(event.target.value)}
    }
    
    this.setState(newState);
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
                <Form.Control as="select" onChange={(e) => this.onChangeSearchSettings(e)}>
                  <option value="0">{t('search.targetStrenthComplement')}</option>
                  {/* <option value="1">option2</option> */}
                </Form.Control>
              </Form.Group>
            </Form>          
          </Col>
        </Row>
      </Container>
    </>
    )};
}
