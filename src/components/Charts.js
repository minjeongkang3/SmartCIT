import React, { Component } from "react";
import "../css/Chart.css";
import ContinuousChart from "./ContinuousChart";
import BinaryChart2 from "./BinaryChart2";
import CompareChart2 from "./CompareChart2";

export default class Charts extends Component {
  state = {
    jsonData: [],
    dt: "",
    dn: "",
    type: "bar"
  };

  componentWillReceiveProps(nextProps) {
    var jsonData = nextProps.jsonData;
    var dt = nextProps.dt;
    var dn = nextProps.dn;
    var type = nextProps.type;
    this.setState({ jsonData, dt, dn, type });
  }

  render() {
    if (this.state.type === "bar" || this.state.type === "line") {
      return (
        <div className="chart-container">
          <ContinuousChart
            jsonData={this.state.jsonData}
            dt={this.state.dt}
            dn={this.state.dn}
            type={this.state.type}
            onClick={this.props.onClick}
          />
        </div>
      );
    } else if (this.state.type === "bubble") {
      return (
        <div className="chart-container">
          <BinaryChart2 jsonData={this.state.jsonData} dt={this.state.dt} />
        </div>
      );
    } else if (this.state.type === "compare") {
      return (
        <div className="chart-container">
          <CompareChart2 jsonData={this.state.jsonData} />
        </div>
      );
    }
  }
}
