import React from 'react';
import { Row, Col, Container } from "react-bootstrap";
import {Bar, HorizontalBar} from 'react-chartjs-2';
import MediaQuery from "react-responsive";
import { useTranslation } from 'react-i18next';

export const GraphComponent = (props) => {
  const labels = props.labels;
  const datasets = props.datasets;
  const { t } = useTranslation();

  const data = {
    labels: labels,
    datasets: datasets.map(arg => ({
      label: arg.dataLabel,
      backgroundColor: `rgba(${arg.colorRGB[0]},${arg.colorRGB[1]},${arg.colorRGB[2]},0.2)`,
      borderColor: `rgba(${arg.colorRGB[0]},${arg.colorRGB[1]},${arg.colorRGB[2]},1)`,
      borderWidth: 1,
      hoverBackgroundColor: `rgba(${arg.colorRGB[0]},${arg.colorRGB[1]},${arg.colorRGB[2]},0.4)`,
      hoverBorderColor: `rgba(${arg.colorRGB[0]},${arg.colorRGB[1]},${arg.colorRGB[2]},1)`,
      data: arg.values
    }))
  };

  const strengthValueAxisOption = [{
    ticks: {
      min: -1024*4,
      max: 1024*4,
      stepSize: 1024
    }
  }];

  const chartOptionsBar = {
    maintainAspectRatio: false,
    scales: {
      yAxes: strengthValueAxisOption
    }
  }  

  const chartOptionsHorizontal = {
    maintainAspectRatio: false,
    scales: {
      xAxes: strengthValueAxisOption
    }
  }  

  return (
    <>
      <Container fluid className="mt-3">
        <Row>
          <Col>
            <h4>{t('graph.title')}</h4>
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
                options={chartOptionsHorizontal}
              />
            </div>          
          </MediaQuery>
          <MediaQuery query="(min-width: 768px)">
            <div style={{height: 500}}>
              <Bar
                data={data}
                width={100}
                height={50}
                options={chartOptionsBar}
              />
            </div>
          </MediaQuery>
          </Col>
        </Row>
      </Container>
    </>
  );
}