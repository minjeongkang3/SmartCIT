import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";

export default class Instructions extends Component {
  state = { stage: this.props.stage };

  constructor(props) {
    super(props);
    this.get_text = this.get_text.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ stage: nextProps.stage });
  }

  get_text() {
    if (this.state.stage === 1) {
      return (
        <span className="card-text row">
          <h5>Welcome to the historical page!</h5>
          If this is your first time here, please continue with our brief user
          guide!
        </span>
      );
    } else if (this.state.stage === 2) {
      return (
        <span className="card-text row">
          <h5>Enter date!</h5>
          Please select the time range for the data to display. For performance
          concern, please enter a small range.
        </span>
      );
    } else if (this.state.stage === 3) {
      return (
        <span className="card-text row">
          <h5>Enter floor!</h5>
          This is not required! If you choose a certain CIT floor, you will see
          detailed info about that floor. If not, you can see data throughout
          the floors
        </span>
      );
    } else if (this.state.stage === 4) {
      return (
        <span className="card-text row">
          <h5>Select a data type!</h5>
          There are four different kinds of data collected throughout the CIT
          buildig. Hover over the buttons to see what they are! Click to see the
          visualized data.
        </span>
      );
    } else if (this.state.stage === 5) {
      return (
        <span className="card-text row">
          <h5>Compare between locations!</h5>
          For any data type, there are sensors placed in different locations,
          like the coffee place or the printer. Hover over the ticks to see what
          the locations are! Click compare locations to see comparions across
          time between the locations.
        </span>
      );
    } else if (this.state.stage === 6) {
      return (
        <span className="card-text row">
          <h5>Get details about a room!</h5>
          Click on any bar to see what happens!
        </span>
      );
    }
  }
  render() {
    if (this.state.stage > 0 && this.state.stage < 7) {
      console.log("called");
      return (
        <span
          style={{
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            width: "100%",
            minHeight: "100%",
            left: 0,
            top: 0,
            zIndex: 1000
          }}
        >
          <div
            className="card bg-light mb-3"
            style={{
              margin: "auto",
              marginTop: "10%",
              maxWidth: "80%",
              minHeight: "20%"
            }}
          >
            <div className="card-body px-5 pt-4 pb-1">
              {this.get_text()}
              <div style={{ float: "right" }}>
                <span
                  className="ml-2 btn"
                  style={{ color: "green" }}
                  onClick={this.props.next}
                >
                  Next
                </span>
                <span
                  className="ml-2 btn"
                  style={{ color: "blue" }}
                  onClick={this.props.skip}
                >
                  Skip
                </span>
              </div>
            </div>
          </div>
        </span>
      );
    } else {
      return <div />;
    }
  }
}
