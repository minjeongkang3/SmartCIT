import React, { Component } from "react";
import "../css/Chart.css";
import Timeline from "react-visjs-timeline";

export default class BinaryChart extends Component {
  state = {
    jsonData: [],
    options: {},
    items: [],
    groups: [],
    dt: "outlet",
    _is_mounted: false
  };

  constructor(props) {
    super(props);
    this.makeChart = this.makeChart.bind(this);
  }

  componentWillMount() {
    var jsonData = this.props.jsonData;
    var dt = this.props.dt;
    if (jsonData !== undefined) {
      this.makeChart(jsonData, dt);
    }
  }

  componentWillReceiveProps(nextProps) {
    var jsonData = nextProps.jsonData;
    var dt = nextProps.dt;
    if (jsonData !== undefined) {
      this.makeChart(jsonData, dt);
    }
  }

  makeChart(jsonData, dt) {
    var items = [];
    var late = new Date();
    var early = Date.parse("2000-01-22T00:00:00Z");
    var group_dict = {};
    var groups = [];
    var id_ = 0;

    // parse all the jsonData to put into the items list
    for (var i = 0; i < jsonData.length; i++) {
      var item_ = jsonData[i];
      var start = new Date(item_.name.replace(" ", "T").concat("Z"));
      var status = item_.value;

      // update the group information
      if (!(item_.dn in group_dict)) {
        // the first time this device appears
        // initialize the id and content
        groups.push({ id: id_, content: item_.dn });
        group_dict[item_.dn] = { id: id_, last_time: start };
        id_++;
      }

      // update the start and end
      if (start > early) {
        early = start;
      }
      if (start < late) {
        late = start;
      }

      // determine the color
      let backgroundColor = "#E01E5A";
      if (status === "motion_start" || status === "door_open") {
        backgroundColor = "#2EB67D";
      }
      items.push({
        start: start,
        end: group_dict[item_.dn].last_time,
        content: "",
        group: group_dict[item_.dn].id,
        style: "background-color: " + backgroundColor
      });

      group_dict[item_.dn].last_time = start; // update the last time
    }

    var options = {
      showMajorLabels: false,
      showCurrentTime: false,
      zoomMin: 1000000,
      type: "box",
      start: early,
      end: late,
      min: early,
      max: late,
      stack: false
    };

    var _is_mounted = true;
    this.setState({ jsonData, dt, _is_mounted, options, items, groups });
  }

  render() {
    return (
      <div className="chart-container">
        <Timeline
          items={this.state.items}
          options={this.state.options}
          groups={this.state.groups}
        />
      </div>
    );
  }
}
