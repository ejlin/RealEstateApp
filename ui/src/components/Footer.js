import React from 'react';

import './CSS/Footer.css';

import logo from './Images/LogoStretch.png';

import { Link } from "react-router-dom";
import { MdPlayArrow } from 'react-icons/md';

class Footer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{
                backgroundColor: "white",
                float: "left",
                paddingBottom: "75px",
                paddingTop: "60px",
                width: "100%",
            }}>
                <div style={{
                    marginLeft: "18%",
                    marginRight: "18%",
                    width: "64%",
                }}>
                    <div style={{
                        float: "left",
                        width: "25%",
                    }}>
                        <img src={logo}
                            style={{
                                height: "20px",
                                width: "95px",
                            }}/>
                    </div>
                    <div style={{
                        float: "left",
                        width: "25%",
                    }}>
                        <p className="footer_title">
                            Features
                        </p>
                        <p className="footer_subtitle opacity">
                            Overview
                        </p>
                        <p className="footer_subtitle opacity">
                            Analysis
                        </p>
                        <p className="footer_subtitle opacity">
                            Expenses
                        </p>
                        <p className="footer_subtitle opacity">
                            Files
                        </p>
                    </div>
                    <div style={{
                        float: "left",
                        width: "25%",
                    }}>
                        <p className="footer_title">
                            Navigation
                        </p>
                        <p className="footer_subtitle opacity">
                            Pricing
                        </p>
                        <p className="footer_subtitle opacity">
                            Company
                        </p>
                        <p className="footer_subtitle opacity">
                            FAQ
                        </p>
                    </div>
                    <div style={{
                        float: "left",
                        width: "25%",
                    }}>
                        <p className="footer_title">
                            Support
                        </p>
                        <p className="footer_subtitle opacity">
                            About
                        </p>
                        <Link 
                            style={{
                                color: "black",
                                textDecoration: "none",
                            }}
                            to={{
                                pathname: "/contact"
                            }}>
                            <p className="footer_subtitle opacity">
                                Contact
                            </p>
                        </Link>
                        <p className="footer_subtitle opacity">
                            Terms & Agreements
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}

export default Footer;