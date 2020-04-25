import React from 'react';
import { Row, Col, Container } from "react-bootstrap";
import {Bar, HorizontalBar} from 'react-chartjs-2';
import MediaQuery from "react-responsive";

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
            <h2>Your Team's Strength</h2>
          </Col>
        </Row>
        <Row>
          <Col>
          <MediaQuery query="(max-width: 767px)">
            <div style={{height: 500}}>
              <HorizontalBar
                data={data}
                width={1000}
                height={500}
                options={{
                  maintainAspectRatio: false,
                }}
              />
            </div>          
          </MediaQuery>
          <MediaQuery query="(min-width: 768px)">
            <div style={{height: 500}}>
              <Bar
                data={data}
                width={100}
                height={50}
                options={{
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </MediaQuery>
          </Col>
        </Row>
      </Container>
    </>
  );
}