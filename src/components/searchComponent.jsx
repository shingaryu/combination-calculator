import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap'

export class SearchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      evaluationMethod: 0
    };
  }

  onChangeSearchSettings(event) {
    let newState = {...this.state};
    if (event.target.id === 'evaluation-method') {
      newState = {...this.state, evaluationMethod: parseInt(event.target.value)}
    }
    
    this.setState(newState);
    this.props.onChange(newState);
  }

  render() {
    return (
    <>
      <Container fluid>
        <Row>
          <Col>
            <h2>Search Settings</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form>
              <Form.Group controlId="evaluation-method">
                <Form.Label>Evaluation method</Form.Label>
                <Form.Control as="select" onChange={(e) => this.onChangeSearchSettings(e)}>
                  <option value="0">Target strengths complement</option>
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
