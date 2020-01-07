import React, { Component } from 'react';
import '../css/footer.css'

export default class Footer extends Component {
	render() {
    	return (
      		<div className='footer_container'>
      			<div className="footer_contact">
      				<a href="mailto:smartcit@brown.edu">smartcit@brown.edu</a>
      			</div>
      			<p>© Brown University Department of Computer Science</p>
      		</div>
    	);
  	}
}