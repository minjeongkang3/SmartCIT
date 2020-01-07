import React, { Component } from "react";
import "../css/Chart.css";
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";

export default class ContinuousChart extends Component {
  state = {
    jsonData: {},
    data: {},
    options: {},
    dt: "outlet",
    dn: "",
    type: "bar"
  };

  constructor(props) {
    super(props);
    this.myRef = null;
    this.makeChart = this.makeChart.bind(this);
    this.selectDN = this.selectDN.bind(this);
  }

  componentWillMount() {

    var options = {
      legend: {},
      responsive: true,
      scales: {
        yAxes: [
          {

            ticks: {
              beginAtZero: false
            },
            display: true,
            scaleLabel: {
              display: true,
              labelString: '',
            }
          }
        ],
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: '',
            }
          }
        ]
      }
    };
    var data = {
      labels: [],
      datasets: [{ label: "", data: [], backgroundColor: [] }]
    };
    this.setState({ data, options });
  }

  componentDidMount() {
    var jsonData = this.props.jsonData;
    var dt = this.props.dt;
    var dn = this.props.dn;
    var type = this.props.type;
    this.makeChart(jsonData, dt, dn, type);
  }

  componentWillReceiveProps(nextProps) {
    var jsonData = nextProps.jsonData;
    var dt = nextProps.dt;
    var dn = nextProps.dn;
    var type = nextProps.type;
    this.makeChart(jsonData, dt, dn, type);
  }

  selectDN(e) {
    if (e[0] !== undefined) {
      this.props.onClick(this.state.data.labels[e[0]._index]);
    } else {
      console.log("this is not a chart element");
    }
  }

  makeChart(jsonData, dt, dn, type) {
    var data = this.state.data;
    var options = this.state.options;
    console.log(options);
    let xaxis = '';
    let yaxis = '';
    if(dt === 'outlet'){
      yaxis = 'Avg Value(Watts)';
    }else if(dt === 'temperature'){
      yaxis = 'Avg Value(fahrenheit)'
    }else if(dt === 'motion'){
      yaxis = 'Number of Occurences'
    }else{
      yaxis = 'Number of Openings'
    }
    if(type === 'bar'){
      xaxis = 'Device';
    }else{
      xaxis = 'Datetime';
    }
    options.scales.xAxes[0].scaleLabel.labelString = xaxis;
    options.scales.yAxes[0].scaleLabel.labelString = yaxis;
    var theLabels = [];
    var theData = [];
    var theColors = [];
    var theFloors = {};
    var backColor_base = [
      "",
      "#36C5F0",
      "#2EB67D",
      "#ECB22E",
      "#E01E5A",
      "#4A154B"
    ];

    if (type === "bar" || type === "line") {
      for (var i = 0; i < jsonData.length; i++) {
        let name = jsonData[i].name;
        let value = jsonData[i].value;
        let floor_name = jsonData[i].df;
        theLabels.push(name);
        theData.push(value);
        theColors.push(backColor_base[floor_name]);
        if (floor_name in theFloors) {
          theFloors[floor_name].push(name);
        } else {
          theFloors[floor_name] = [name];
        }
      }
      data.datasets[0].label = dt + " " + dn;
      data.labels = theLabels;
      data.datasets[0].data = theData;
      data.datasets[0].backgroundColor = theColors;
      this.setState({ jsonData, data, dt, type, options });
    }
  }

  render() {
    if (this.state.type === "bar") {
      return (
        <div className="chart-container">
          <Bar
            data={this.state.data}
            options={this.state.options}
            getElementAtEvent={e => this.selectDN(e)}
          />
        </div>
      );
    } else if (this.state.type === "line") {
      return (
        <div className="chart-container">
          <Line data={this.state.data} options={this.state.options} />
        </div>
      );
    }
  }
}
