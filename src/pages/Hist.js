import React, { Component } from "react";
import { Row, Col, Dropdown, Button, ButtonGroup, Popover, OverlayTrigger } from "react-bootstrap";
import { AwesomeButton } from "react-awesome-button";
import Loader from 'react-loader-spinner'
import "react-awesome-button/dist/styles.css";
import "../css/data.css";
import Charts from "../components/Charts";
import "../css/buttons.css";
import moment from "moment";

export default class Hist extends Component {
  state = {
    jsonData: [],
    type: "bar",
    loading: false,
    dt: "",
    dn: "",
    df: "",
    unique_id: 0,
  };
  constructor() {
    super();
    //this.url = "http://18.222.184.250:8080/query";
    this.url = "http://localhost:8080/query";
    // this.url = "http://192.168.1.17:8080/query/";
    this.get_data = this.get_data.bind(this);
    this.barClick = this.barClick.bind(this);
    this.dataTypeClick = this.dataTypeClick.bind(this);
    this.floorClick = this.floorClick.bind(this);
    this.lineChartClick = this.lineChartClick.bind(this);
    this.barChartClick = this.barChartClick.bind(this);
    this.get_data_type = this.get_data_type.bind(this);
  }


  // when clicking on a specific bar
  barClick(dn) {
    this.setState({ jsonData: [] });
    this.get_data("line", dn, this.state.dt, this.state.df);
  }

  // when clicking on the bar chart button
  barChartClick(){
    document.getElementById("bar_btn").classList.add("chart_active");
    document.getElementById("line_btn").classList.remove("chart_active");
    this.get_data("bar", "", this.state.dt, this.state.df);
  }

  // when clicking on the line chart button
  lineChartClick(){
    document.getElementById("bar_btn").classList.remove("chart_active");
    document.getElementById("line_btn").classList.add("chart_active");
    this.get_data("compare", "", this.state.dt, this.state.df);
  }

  // when choosing the floor
  floorClick(floor){
    var floor_btns = document.getElementsByClassName('floor_btn')
    for(let i = 0; i < floor_btns.length; i++){
      floor_btns[i].classList.remove("floor_active");
    }
    document.getElementById(floor).classList.add("floor_active");
    this.get_data(this.state.type, "", this.state.dt, floor);
  }

  // when clicking on a data type button
  dataTypeClick(dt) {
    this.get_data(this.state.type, "", dt, this.state.df);
  }

  // fetching data from the server and updating the state
  get_data(type, dn, dt, df) {
    console.log('get data');
    if (dt === ""){
      this.setState({df: df});
      return
    }

    // loading
    document.getElementById("loading_hist").classList.add("loading_active");
    document.getElementById("hist_chart").style.display = "none";
    this.setState({loading: true});

    var body_data = {};
    var url;
    body_data.startDate = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    //adds 1 day to endDate so that end date's data is included in returned data
    var new_end = moment(end, "YYYY MM DD").add(1, 'days');
    let end_json = new_end.toObject()
    let year = end_json.years.toString()
    let month = (end_json.months + 1)
    if(month < 10){
      month = '0' + month;
    }else{
      month = month.toString();
    }

    let day = end_json.date;
    if(day<10){
      day = "0" + day;
    }else{
      day = day.toString();
    }
    console.log('day: ', day);
    body_data.endDate = year+'-'+month+'-'+day;
    body_data.device_floor = df;
    body_data.device_type = dt;
    body_data.device_name = dn;
    let id = this.state.unique_id;
    body_data.id = id;
    this.setState({id: id+1})
    if (df === "all"){
      body_data.device_floor = ""
    }
    if(type === "bar"){
      url = this.url + "/timeRangeAverage";
    }
    else if (type === "compare"){
      if (body_data.device_floor === "all"){
        url = this.url + "/timeCompareDF";
      }
      else {
        url = this.url + "/timeCompareDN";
      }
    }
    else{
      url = this.url + "/timeRangeSequence";
    }
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body_data)
    })
      .then(res => res.json())
      .then(data => {

        document.getElementById("hist_chart").style.display = "block";
        document.getElementById("loading_hist").classList.remove("loading_active");

        if(dn !== ''){
          console.log('here');
          data.sort(function(a,b){
            let start = moment(a.name , "YYYY MM DD");
            let end = moment(b.name , "YYYY MM DD");
            return moment.duration(start.diff(end)).asDays();
          });

        }else{
          data.sort(function(a,b){
            return a.df - b.df;
          });
        }
        this.setState({
          jsonData: data,
          type: type,
          dt: dt,
          df: df,
          loading: false
        });
      })
      .catch(err => {
        console.log(err);
      });

  }

  // get a lable of the current data type
  get_data_type(){
    var data_type = this.state.dt
    if(data_type === "outlet"){
      return "Power consumption"
    }
    else if(data_type === "temperature"){
      return "Temperature"
    }
    else if(data_type === "motion"){
      return "Room occupancy"
    }
    else if(data_type === "door"){
      return "Door activity"
    }
    return "Choose data type"
  }
  validate() {
    var start = document.getElementById("start").value;
    var end = document.getElementById("end").value;
    console.log(start)
    console.log(end)
    var start_date = moment(start, "YYYY MM DD");
    var end_date = moment(end, "YYYY MM DD");
    let duration = moment.duration(end_date.diff(start_date)).asDays();
    console.log('duration: ', duration)
    if(duration > 183){
      end_date = start_date.add(183, 'days');

      let end_obj = end_date.toObject();
      let end_year = end_obj.years.toString();
      let end_month = (end_obj.months + 1);
      if(end_month < 10){
        end_month = '0' + end_month;
      }else{
        end_month = end_month.toString();
      }

      let end_day = end_obj.date;
      if(end_day<10){
        end_day = "0" + end_day;
      }else{
        end_day = end_day.toString();
      }
      let endDate = end_year + '-' + end_month + '-' + end_day;
      document.getElementById("end").value = endDate;
    }
    //prevents bad end date input
    if (duration < 0) {
      document.getElementById("end").value = start;
      alert("start date should be before end date");
    }
  }
  // set default dates
  componentDidMount() {
    document.getElementById("start").value = "2017-12-20";
    document.getElementById("end").value = "2017-12-30";
    document.getElementById("bar_btn").classList.add("chart_active");
    document.getElementById("all").classList.add("floor_active");
  }

  render() {
    const popover = (
    <Popover id="inst" title="Welcome to the historical data page!">
      Please select a time range for the data to display. For performance concerns, smaller time ranges will be displayed faster. You may restrict data to a certain floor or view more generalized data across all floors. You may also select chart type. To view the data with your selected criteria, choose one of the four data types. Once the graph has been created, you may hover the chart elements to view the specific values. You may also click on any bar in a bar graph to view that specific sensors data over the selected time range.
    </Popover>);

    return (
      <div className="main_container" id="main">
        <div className="header_container">
          <h2>Historical data</h2>
        </div>

        <div className="content_container">
          <Row>
            <Col
              className="chart_upper_col"
              xs={{ span: 12, order: 2 }}
              xl={{ span: 10, order: 1}}
            >
              <Row>
                <Col
                  className="input_container"
                  xs={{ span: 12, order: 1}}
                  lg={{ span: 8, order: 1}}
                >
                  <div className="date_container">
                    <div className="with_label">
                      <p>Start date</p>
                      <input
                      className="date_input"
                      type="date"
                      id="start"
                      name="startName"
                      min="2017-01-01"
                      max="2017-12-31"
                      onBlur={this.validate}
                      />
                    </div>
                    <div className="arrow"> &#x2192; </div>
                    <div className="with_label">
                      <p>End date</p>
                      <input
                        className="date_input"
                        type="date"
                        id="end"
                        name="endName"
                        min="2017-01-01"
                        max="2017-12-31"
                        onBlur={this.validate}
                      />
                    </div>
                  </div>
                  <div className="with_label">
                    <p>Select floor</p>
                    <ButtonGroup id="floor_btn_group" className="floor_btn_list">
                      <Button id="all" className="floor_btn" onClick={()=>{this.floorClick("all");}}>All</Button>
                      <Button id="1" className="floor_btn" onClick={()=>{this.floorClick("1");}}>1</Button>
                      <Button id="2" className="floor_btn" onClick={()=>{this.floorClick("2");}}>2</Button>
                      <Button id="3" className="floor_btn" onClick={()=>{this.floorClick("3");}}>3</Button>
                      <Button id="4" className="floor_btn" onClick={()=>{this.floorClick("4");}}>4</Button>
                      <Button id="5" className="floor_btn" onClick={()=>{this.floorClick("5");}}>5</Button>
                    </ButtonGroup>
                  </div>
                </Col>
                <Col
                  className="chart_btn_container"
                  xs={{ span: 12, order: 2}}
                  lg={{ span: 4, order: 2}}
                >
                  <Button
                    id="bar_btn"
                    variant="outline-secondary"
                    onClick={this.barChartClick}
                    className="chart_btn"
                  >
                    Bar Chart
                  </Button>
                  <Button
                    id="line_btn"
                    variant="outline-secondary"
                    onClick={this.lineChartClick}
                    className="chart_btn"
                  >
                    Line Chart
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col
              xs={{ span: 12, order: 1 }}
              xl={{ span: 2, order: 2}}
              className="guide_col"
            >
              <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
                <Button id="guide_btn" variant="success">User guide</Button>
              </OverlayTrigger>
            </Col>
          </Row>
          <Row>
            <Col
              xs={{ span: 12, order: 2 }}
              lg={{ span: 9, order: 1 }}
              xl={{ span: 10, order: 1 }}
            >
              <div className="loading_container" id="loading_hist">
                <Loader
                  type="Watch"
                  color="#5900b3"
                  height="150"
                  width="150"
                />
                <h3>Loading...</h3>
              </div>
              <div id="hist_chart">
                <div className="curr_dt_container">
                  <h5>{this.get_data_type()}</h5>
                </div>
                <Charts
                  jsonData={this.state.jsonData}
                  dt={this.state.dt}
                  dn={this.state.dn}
                  type={this.state.type}
                  onClick={this.barClick}
                />
              </div>
              </Col>
            <Col
              xs={{ span: 12, order: 1 }}
              lg={{ span: 3, order: 2 }}
              xl={{ span: 2, order: 2}}
              className="buttons_col"
            >
              <div className="btn_container">
                <div className="btn_dropdown">
                  <Dropdown>
                    <Dropdown.Toggle id="dropdown-basic">
                      {this.get_data_type()}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => this.dataTypeClick("outlet")}>
                        Power consumption
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => this.dataTypeClick("temperature")}
                      >
                        Temperature
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.dataTypeClick("motion")}>
                        Room occupancy
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.dataTypeClick("door")}>
                        Door activity
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className="btn_list">
                  <AwesomeButton
                    className="data_btn"
                    onPress={() => this.dataTypeClick("outlet")}
                  >
                    Power consumption
                  </AwesomeButton>
                  <AwesomeButton
                    className="data_btn"
                    onPress={() => this.dataTypeClick("temperature")}
                  >
                    Temperature
                  </AwesomeButton>
                  <AwesomeButton
                    className="data_btn"
                    onPress={() => this.dataTypeClick("motion")}
                  >
                    Room occupancy
                  </AwesomeButton>
                  <AwesomeButton
                    className="data_btn"
                    onPress={() => this.dataTypeClick("door")}
                  >
                    Door activity
                  </AwesomeButton>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
