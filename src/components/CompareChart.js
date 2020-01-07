import React, { Component } from "react";
import "../css/Chart.css";
import { Line } from "react-chartjs-2";

export default class CompareChart extends Component {
  state = {
    jsonData: {},
    data: {},
    options: {}
  };

  constructor(props) {
    super(props);
    this.makeChart = this.makeChart.bind(this);
  }

  componentWillMount() {
    var options = {
      legend: {
        fillStyle: "#000000"
      },
      responsive: true,
      scales: {
        yAxes: [
          {
            id: "A",
            type: "linear",
            position: "left",
            ticks: {
              beginAtZero: false
            }
          },
          {
            id: "B",
            type: "linear",
            position: "right",
            ticks: {
              beginAtZero: false
            }
          }
        ]
      }
    };
    var data = {
      labels: [],
      datasets: [
        {
          label: "temperature",
          fill: false,
          date: [],
          borderColor: "#36C5F0",
          yAxisID: "B"
        },
        {
          label: "outlet",
          fill: false,
          date: [],
          borderColor: "#ECB22E",
          yAxisID: "B"
        },
        {
          label: "motion",
          fill: false,
          date: [],
          borderColor: "#E01E5A",
          yAxisID: "A"
        },
        {
          label: "door",
          fill: false,
          date: [],
          borderColor: "#4A154B",
          yAxisID: "A"
        }
      ]
    };
    this.setState({ data, options });
  }

  componentDidMount() {
    var jsonData = this.props.jsonData;
    this.makeChart(jsonData);
  }

  componentWillReceiveProps(nextProps) {
    var jsonData = nextProps.jsonData;
    this.makeChart(jsonData);
  }

  makeChart(jsonData) {
    var data = this.state.data;
    var data_list = [];
    var data_dict = { temperature: {}, outlet: {}, motion: {}, door: {} };

    for (var i = 0; i < jsonData.length; i++) {
      let name = jsonData[i].name;
      if (!data_list.includes(name)) {
        data_list.push(name);
        data_dict.temperature[name] = 0;
        data_dict.outlet[name] = 0;
        data_dict.motion[name] = 0;
        data_dict.door[name] = 0;
      }
    }
    data_list.sort();
    data.labels = data_list;

    for (var j = 0; j < jsonData.length; j++) {
      let name = jsonData[j].name;
      let dt = jsonData[j].dt;
      if (dt === "temperature" || dt === "outlet") {
        data_dict[dt][name] = jsonData[j].avg_value;
      } else if (dt === "motion" || dt === "door") {
        data_dict[dt][name] = jsonData[j].count_value;
      }
    }

    for (var k = 0; k < data_list.length; k++) {
      data.datasets[0].data.push(data_dict.temperature[data_list[k]]);
      data.datasets[1].data.push(data_dict.outlet[data_list[k]]);
      data.datasets[2].data.push(data_dict.motion[data_list[k]]);
      data.datasets[3].data.push(data_dict.door[data_list[k]]);
    }

    console.log("here");
    console.log(data);

    this.setState({ jsonData, data });
  }

  render() {
    return (
      <div className="chart-container">
        <Line data={this.state.data} options={this.state.options} />
      </div>
    );
  }
}
