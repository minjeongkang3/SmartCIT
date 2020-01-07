import React, { Component } from "react";
import "../css/Chart.css";
import { HorizontalBar } from "react-chartjs-2";

export default class BinaryChart extends Component {
  state = {
    jsonData: {},
    data_dict: {},
    options: {},
    dt: "outlet",
    _is_mounted: false
  };

  constructor(props) {
    super(props);
    this.initChart = this.initChart.bind(this);
    this.makeChart = this.makeChart.bind(this);
  }

  componentWillMount() {
    var options = {
      tooltips: {
        enabled: false
      },
      hover: {
        animationDuration: 0
      },
      scales: {
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              fontFamily: "'Open Sans Bold', sans-serif",
              fontSize: 11
            },
            scaleLabel: {
              display: false
            },
            gridLines: {},
            stacked: true
          }
        ],
        yAxes: [
          {
            gridLines: {
              display: false,
              color: "#fff",
              zeroLineColor: "#fff",
              zeroLineWidth: 0
            },
            ticks: {
              fontFamily: "'Open Sans Bold', sans-serif",
              fontSize: 11
            },
            stacked: true
          }
        ]
      },
      legend: {
        display: false
      }
    };
    this.setState({ options });
  }
  componentWillReceiveProps(nextProps) {
    var jsonData = nextProps.jsonData;
    console.log(jsonData);
    var dt = nextProps.dt;
    if (jsonData !== undefined) {
      this.initChart(jsonData, dt);
    }
  }

  initChart(jsonData, dt) {
    // below parse the jsonData into a format that log the elapsed time of each event
    var data_dict = {};
    let current_time;
    for (var j = jsonData.length - 1; j >= 0; j--) {
      let dn = jsonData[j].dn;
      let time = Date.parse(jsonData[j].name); // this is the time
      let value = jsonData[j].value; // this is the value of the event

      // if the device name is already initialized
      if (dn in data_dict) {
        var elapsed_time = time - current_time;
        data_dict[dn].elapsed_time.push(elapsed_time / 1000);
        current_time = time;
      }

      // if the device name is not yet initialized
      else {
        let status = false;
        if (value === "motion_start" || value === "door_open") {
          status = true;
        }
        data_dict[dn] = { start: status, elapsed_time: [0] };
        current_time = time;
      }
    }
    var _is_mounted = true;
    this.setState({ jsonData, dt, data_dict, _is_mounted });
  }

  makeChart() {
    if (this.state._is_mounted) {
      var render_data = {};
      var data_dict = this.state.data_dict;
      for (var dn in data_dict) {
        var data = {};
        data.labels = [dn];
        data.datasets = [];
        var status = data_dict[dn].start;
        var elapsed_time = data_dict[dn].elapsed_time;
        var backgroundColor = null;
        for (var i = 0; i < elapsed_time.length; i++) {
          if (status) {
            backgroundColor = "#2EB67D";
          } else {
            backgroundColor = "#E01E5A";
          }
          data.datasets.push({
            data: [elapsed_time[i]],
            backgroundColor: backgroundColor,
            label: i
          });
          status = !status;
        }
        render_data[dn] = data;
      }
      return (
        <div>
          {Object.entries(render_data).map(([dn, data]) => (
            <HorizontalBar
              height={30}
              key={dn}
              data={data}
              options={this.state.options}
            />
          ))}
        </div>
      );
    } else {
      return <div />;
    }
  }

  render() {
    return <div className="chart-container">{this.makeChart()}</div>;
  }
}
