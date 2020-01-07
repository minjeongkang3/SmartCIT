import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import '../css/home.css';
import sensor from '../img/sensor.jpg';

export default class Home extends Component {
	render() {
    	return (
    		<div className='main_container'>
    			<Row id="home_row">
                    <Col className='home_col' md={12} lg={6}> 
                        <div className="left_container">
                            <h1 id="heading">SmartCIT</h1>
                            <p>
                            Started in 2016, the <span className='marked'>SmartCIT</span> initiative is a new project aimed at integrating cutting edge <span className='marked'>Internet of Things (IoT) devices</span> into the Watson CIT building at Brown University. As part of the project, Samsung SmartThings sensors (<a href='https://www.smartthings.com/' target='_blank' rel="noopener noreferrer">https://www.smartthings.com/</a>) have been installed in public spaces throughout the building to collect various forms of data, including <span className='marked'>changes in temperature, classroom/door usage, and power consumption</span>.
                            </p>
                        </div>
                    </Col>
                    <Col className='home_col' md={12} lg={6}>
                        <div className="right_container">
                            <img id="sensor_img" src={sensor} alt="Samsung sensor" />
                        </div>
                    </Col>
                </Row>
    		</div>
    	);

  	}
}