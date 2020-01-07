import React, { Component } from 'react';
import { Navbar, Nav, NavItem} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../css/navigation.css';

export default class Navigation extends Component {
  constructor(props){
    super(props);
    this.state = {
      expanded: false
    };
    this.expand = this.expand.bind(this);
    this.set_nav = this.set_nav.bind(this);
    this.reset = this.reset.bind(this);
  };

  componentDidMount() {
    window.addEventListener('resize', this.set_nav);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.set_nav);
  }

  set_nav(){
    if(window.innerWidth >  992){
      if(this.state.expanded){
        document.getElementsByClassName('navbar-toggler')[0].click();
      }
    }
  }

  expand(){
    if(!this.state.expanded){
      document.getElementById('main_navbar').style.height = "230px";
      this.setState({expanded: true});
    }
    else{
      document.getElementById('main_navbar').style.height = "80px";
      this.setState({expanded: false});
    }
  }

  reset(){
    if(this.state.expanded){
      document.getElementsByClassName('navbar-toggler')[0].click();
    }
  }

	render() {
    	return (
      		<Navbar collapseOnSelect expand='md' id="main_navbar">
            <Navbar.Brand>
              <NavItem id="nav-brand"><Link onClick={this.reset} to='/'>SmartCIT</Link></NavItem>
            </Navbar.Brand>
      			<Navbar.Toggle onClick={this.expand} aria-controls='responsive-navbar-nav'/>
      			<Navbar.Collapse id='responsive-navbar-nav' >
      				<Nav id='navitems_container'>
      					<NavItem><Link onClick={this.reset} to='/'>Home</Link></NavItem>
                <NavItem><Link onClick={this.reset} to='/live'>Live data</Link></NavItem>
                <NavItem><Link onClick={this.reset} to='/historical'>Historical data</Link></NavItem>
      				</Nav>
      			</Navbar.Collapse>
      		</Navbar>
   		);
  	}
}