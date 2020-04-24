import React from 'react';
// import './App.css';
// import { combinationCalculator } from './combination-calculator';
import { Container, Row, Col } from 'react-bootstrap'
import { SearchComponent } from './searchComponent';
import { GraphComponent } from './graphComponent';
import { MyTeamComponent } from './myTeamComponent';

export class TeamBuilderComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
    <>
      <Container fluid className="mt-5">
        <Row>
          <Col md={3}>
            <MyTeamComponent num={6}></MyTeamComponent>
          </Col>
          <Col md={3}>
            <SearchComponent></SearchComponent>
          </Col>
          <Col md={6}>
            <SearchComponent></SearchComponent>
          </Col>
        </Row>
        <Row>
          <Col>

          </Col>
          <Col>
          {/* <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>
            <Form.Group controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Check me out" />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form> */}
          </Col>
        </Row>
      </Container>
      <GraphComponent/>
    </>
    )};
}
