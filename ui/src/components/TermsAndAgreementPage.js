import React from 'react';

import './CSS/TermsAndAgreementPage.css';

import logo from './Images/LogoStretch.png';

import NavigationBar from './NavigationBar.js';
import Footer from './Footer.js';

import { BsFillHouseFill } from 'react-icons/bs';
import { Link } from "react-router-dom";
import { MdPlayArrow } from 'react-icons/md';

class TermsAndAgreementPage extends React.Component {
    constructor(props) {
        super(props);
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
                            Terms & Agreements
                        </p>
                        <p style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "1.1em",
                            marginTop: "15px",
                            textAlign: "center",
                        }}>
                            Please read our Terms & Agreements carefully as it pertains to you
                        </p>
                        <div style={{
                            boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                            float: "left",
                            marginTop: "50px",
                            width: "100%",
                        }}>
                            <div style={{
                                marginLeft: "18%",
                                marginRight: "18%",
                                width: "64%",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.1em",
                                    fontWeight: "bold",
                                }}>
                                    asdfskfhsakldhjflksdhfsd
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="clearfix"/>
                    <div style={{
                        backgroundColor: "#296cf6",
                        marginTop: "100px",
                        paddingBottom: "75px",
                        paddingTop: "75px",
                        textAlign: "center",
                        width: "100%",
                    }}>
                        <p style={{
                            color: "white",
                            display: "inline-block",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "2.4em",
                            fontWeight: "bold",
                            width: "64%",
                        }}>
                            Accelerate your Real Estate Career
                        </p>
                        <div className="clearfix"/>
                        <div 
                            className="opacity"
                            style={{
                                backgroundColor: "white",
                                borderRadius: "50px",
                                color: "#296cf6",
                                cursor: "pointer",
                                display: "inline-block",
                                fontSize: "1.2em",
                                fontWeight: "bold",
                                marginTop: "40px",
                                padding: "15px 35px 15px 35px",
                            }}>
                            Sign Up
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default TermsAndAgreementPage;