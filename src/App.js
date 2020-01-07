import React, { Component } from 'react';
import './css/general.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Live from './pages/Live';
import Hist from './pages/Hist';
import Error from './pages/Error';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <Navigation />
        	<Switch>
            <Route exact path="/" component={Home} />
            <Route path="/live" component={Live} />
            <Route path="/historical" component={Hist} />
            <Route component={Error} />
          </Switch>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App;
