import React from 'react';
import {Bar, HorizontalBar} from 'react-chartjs-2';
import MediaQuery from "react-responsive";
import './graphComponent.css'

type GraphComponentProps = {
  labels: string[],
  datasets: {
    dataLabel: string;
    values: number[];
    colorRGB: number[];
  }[],
  heightVertical?: number,
  widthVertical?: number,
  heightHorizontal?: number,
  widthHorizontal?: number,
  valueMin?: number,
  valueMax?: number,
  valueStep?: number,
  xTicksRotation?: number,
  optionsBar?: any,
  optionsHorizontal?: any
}

export const GraphComponent: React.FunctionComponent<GraphComponentProps> = (props) => {
  const labels = props.labels;
  const datasets = props.datasets;

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

  const valueOrDefault = (value: number | undefined | null, defaultValue: number) => {
    return (value !== undefined && value !== null) ? value : defaultValue
  }

  const chartOptionsBar = {
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        ticks: {
          minRotation: valueOrDefault(props.xTicksRotation, 90),
          maxRotation: valueOrDefault(props.xTicksRotation, 90)
        }
      }],
      yAxes: [{
        ticks: {
          min: valueOrDefault(props.valueMin, -1024*4),
          max: valueOrDefault(props.valueMax, 1024*4),
          stepSize: valueOrDefault(props.valueStep, 1024)
        }
      }]
    },
    ...props.optionsBar
  }  

  const chartOptionsHorizontal = {
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        position: 'top',
        ticks: {
          min: valueOrDefault(props.valueMin, -1024*4),
          max: valueOrDefault(props.valueMax, 1024*4),
          stepSize: valueOrDefault(props.valueStep, 2048),
        }
      }]
    },
    ...props.optionsHorizontal
  }

  return (
    <>
      <MediaQuery query="(max-width: 767px)">
        <div style={{height: props.heightHorizontal || 16 * (labels.length + 4)}}>
          <HorizontalBar
            data={data}
            options={chartOptionsHorizontal}
          />
        </div>          
      </MediaQuery>
      <MediaQuery query="(min-width: 768px)">
        <div className="chart-area">
          <div style={{height: props.heightVertical || 500, width: props.widthVertical || 22 * (labels.length + 2)}}>
            <Bar
              data={data}
              options={chartOptionsBar}
            />
          </div>
        </div>
      </MediaQuery>
    </>
  );
}