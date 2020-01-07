import React, { Component } from "react";
import "../css/Chart.css";
import { Line } from "react-chartjs-2";

export default class CompareChart2 extends Component {
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
            scaleLabel: {
              display: true,
              labelString: 'Avg Value',
            },
            ticks: {
              beginAtZero: false
            }
          }
        ],
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Datetime',
            }
          }
        ]
      }
    };
    this.setState({ options });
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
    var data = {
      labels: [],
      datasets: []
    };
    var date_list = [];
    var device__list = [];
    var data_dict = [];
    var backColor_base = [
      "",
      "#36C5F0",
      "#2EB67D",
      "#ECB22E",
      "#E01E5A",
      "#4A154B"
    ];

    for (var k = 0; k < jsonData.length; k++) {
      let name = jsonData[k].name;
      if (!date_list.includes(name)) {
        date_list.push(name);
      }
    }
    for (var i = 0; i < jsonData.length; i++) {
      let device_ = jsonData[i].device_;
      let color_idx = device_;
      if (!Number.isInteger(device_)) {
        color_idx = Math.floor(Math.random() * 5 + 1);
      }
      if (!device__list.includes(device_)) {
        device__list.push(device_);
        data_dict[device_] = {};
        data.datasets.push({
          data: [],
          id: device_,
          label: device_,
          fill: false,
          borderColor: backColor_base[color_idx]
        });
        for (var j = 0; j < date_list.length; j++) {
          data_dict[device_][date_list[j]] = 0;
        }
      }
    }

    date_list.sort();
    data.labels = date_list;

    for (var m = 0; m < jsonData.length; m++) {
      let name = jsonData[m].name;
      let device_ = jsonData[m].device_;
      data_dict[device_][name] = jsonData[m].value;
    }

    for (var n = 0; n < date_list.length; n++) {
      let name = date_list[n];
      for (var l = 0; l < device__list.length; l++) {
        let device_ = device__list[l];
        data.datasets[l].data.push(data_dict[device_][name]);
      }
    }

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
