import React from 'react';
import { Row, Col, Container } from "react-bootstrap";
import {Bar} from 'react-chartjs-2';

export const GraphComponent = (props) => {
  const labels = props.labels;
  const values = props.values;

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Strength value',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: 'rgba(255,99,132,1)',
        data: values
      }
    ]
  };

  return (
    <>
      <Container fluid className="mt-5">
        <Row>
          <Col>
            <h1>Strength Values of Your Team</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <div style={{height: 500}}>
              <Bar
                data={data}
                width={100}
                height={50}
                options={{
                  maintainAspectRatio: false
                }}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}