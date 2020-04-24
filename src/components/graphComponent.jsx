import React from 'react';
import { Row, Col, Container } from "react-bootstrap";

export const GraphComponent = (props) => {
  return (
    <>
      <Container fluid className="mt-5">
        <Row>
          <Col>
            <h1>Graph Area</h1>
          </Col>
        </Row>
      </Container>
    </>
  );
}