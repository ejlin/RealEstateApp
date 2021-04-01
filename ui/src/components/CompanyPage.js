import React from 'react';

import './CSS/CompanyPage.css';

import logo from './Images/LogoStretch.png';

import NavigationBar from './NavigationBar.js';
import Footer from './Footer.js';

import { BsFillHouseFill } from 'react-icons/bs';
import { Link } from "react-router-dom";
import { MdPlayArrow } from 'react-icons/md';

class CompanyPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <div>
                <NavigationBar/>
                <div style={{
                    backgroundColor: "#F5F5FA",
                    float: "left",
                    paddingBottom: "75px",
                    paddingTop: "60px",
                    width: "100%",
                }}>
                    <div style={{
                        marginLeft: "18%",
                        marginRight: "18%",
                        marginTop: "75px",
                        width: "64%",
                    }}>
                        <p style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "2.3em",
                            fontWeight: "bold",
                            textAlign: "center",
                        }}>
                            Company
                        </p>
                        <p style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "1.1em",
                            marginTop: "10px",
                            textAlign: "center",
                        }}>
                            About Us
                        </p>
                        <div style={{
                            boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                            float: "left",
                            marginTop: "25px",
                            width: "100%",
                        }}>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default CompanyPage;