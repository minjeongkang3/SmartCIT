import React, { Component } from "react";
import { Row, Col, Dropdown } from "react-bootstrap";
import Loader from 'react-loader-spinner'
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import "../css/data.css";
import Charts from "../components/Charts";
import "../css/buttons.css";

export default class Live extends Component {
  state = {
    jsonData: [],
    dt: "",
    intervalID: null,
    type: "bar",
    loading: false
  };
  constructor() {
    super();
    this._isMounted = false;
    //this.url = "http://18.222.184.250:8080/query/live";
    this.url = "http://localhost:8080/query/live";
    // this.url = "http://192.168.1.17:8080/query/live";

    this.setDT = this.setDT.bind(this);
    this.get_data = this.get_data.bind(this);
    this.set_interval = this.set_interval.bind(this);
    this.get_data_type = this.get_data_type.bind(this)
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.state.intervalID);
  }

  // when selecting a kind of device
  setDT(dt) {
    var type = "";
    clearInterval(this.state.intervalID);
    if (dt === "outlet" || dt === "temperature") {
      type = "bar";
    } else {
      type = "bubble";
    }
    // clear up the chart by resetting the json
    this.setState(
      {
        dt: dt,
        type: type,
        jsonData: []
      },
      () => {
        if (this._isMounted) {
          //set state is async so needed to put this in callback to ensure state
          //is updated on time
          let refresh_time = 500000;
          //different data types updated at different frequencies
          //dont want to overload server with too many fetches
          //not sure what the intervals should quite yet...
          if (dt === "temperature") {
            refresh_time = 500000;
          } else if (dt === "outlet") {
            refresh_time = 500000;
          } else if (dt === "door") {
            refresh_time = 500000;
          } else {
            refresh_time = 500000;
          }

          this.set_interval(refresh_time);
        }
      }
    );
  }

  set_interval(refresh_time) {
    //gets initial fetch then sets interval for refreshing data
    this.get_data();
    let intervalID = window.setInterval(this.get_data, refresh_time);
    if (this._isMounted) {
      this.setState({
        //stores id so interval can be stopped when data type changes
        intervalID: intervalID
      });
    }
  }

  // when clicking on a specific bar
  // this is just a place holder
  setDN(dn) {}

  get_data() {
    if (this.state.dt === ""){
      return
    }

    // loading
    document.getElementById("loading_live").classList.add("loading_active");
    document.getElementById("live_chart").style.display = "none";
    this.setState({loading: true});

    var body_data = {};
    var url = this.url;
    body_data.device_type = this.state.dt;
    if (this.state.dt === "outlet" || this.state.dt === "temperature") {
      url += "/continuous";
    } else {
      url += "/binary";
    }
    body_data.device_name = "";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body_data)
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById("live_chart").style.display = "block";
        document.getElementById("loading_live").classList.remove("loading_active");
        if (this._isMounted) {
          data.sort(function(a,b){
            return a.df - b.df;
          });
          this.setState({
            jsonData: data,
            loading: false
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }


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

  render() {
    return (
      <div className="main_container">
        <div className="header_container">
          <h2>Live data</h2>
        </div>

        <div className="content_container">
          <Row>
            <Col 
              xs={{ span: 12, order: 2 }} 
              lg={{ span: 9, order: 1 }}
              xl={{ span: 10, order: 1 }}
            >
              <div className="loading_container" id="loading_live">
                <Loader 
                  type="Watch"
                  color="#5900b3"
                  height="150" 
                  width="150"
                />  
                <h3>Loading...</h3>
              </div>
              <div id="live_chart">
                <div className="curr_dt_container">
                  <h5>{this.get_data_type()}</h5>
                </div>
                <Charts
                  jsonData={this.state.jsonData}
                  dt={this.state.dt}
                  dn=""
                  type={this.state.type}
                  onClick={this.setDN}
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
                      <Dropdown.Item onClick={() => this.setDT("outlet")}>
                        Power consumption
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.setDT("temperature")}>
                        Temperature
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.setDT("motion")}>
                        Room occupancy
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.setDT("door")}>
                        Door activity
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className="btn_list">
                  <AwesomeButton
                    className="data_btn"
                    onPress={() => this.setDT("outlet")}
                  >
                    Power consumption
                  </AwesomeButton>
                  <AwesomeButton
                    className="data_btn"
                    onPress={() => this.setDT("temperature")}
                  >
                    Temperature
                  </AwesomeButton>
                  <AwesomeButton
                    className="data_btn"
                    onPress={() => this.setDT("motion")}
                  >
                    Room occupancy
                  </AwesomeButton>
                  <AwesomeButton
                    className="data_btn"
                    onPress={() => this.setDT("door")}
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
