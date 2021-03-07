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
                            Contact Us
                        </p>
                        <p style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "1.1em",
                            marginTop: "15px",
                            textAlign: "center",
                        }}>
                            Have a Question? Please fill out the form and we'll respond shortly
                        </p>
                        <div style={{
                            boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                            float: "left",
                            marginTop: "50px",
                            width: "100%",
                        }}>
                            <div style={{
                                backgroundColor: "#296cf6",
                                borderRadius: "8px 0px 0px 8px",
                                float: "left",
                                height: "650px",
                                textAlign: "center",
                                width: "50%",
                            }}>
                                <BsFillHouseFill style={{
                                    backgroundColor: "white",
                                    border: "5px solid white",
                                    borderRadius: "50%",
                                    color: "#296cf6",
                                    height: "50px",
                                    marginTop: "50px",
                                    padding: "15px",
                                    width: "50px",
                                }}/>
                                <p style={{
                                    color: "white",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.4em",
                                    fontWeight: "bold",
                                    marginTop: "20px",
                                }}>
                                    How can we Help?
                                </p>
                                <p style={{
                                    color: "white",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.1em",
                                    fontWeight: "bold",
                                    marginLeft: "10%",
                                    marginRight: "10%",
                                    marginTop: "50px",
                                    width: "80%",
                                }}>
                                    Tell us about yourself and your question. Be as descriptive as possible so we can help you to the best of our ability.
                                </p>
                                <p style={{
                                    color: "white",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.25em",
                                    fontWeight: "bold",
                                    marginLeft: "7.5%",
                                    marginRight: "7.5%",
                                    marginTop: "50px",
                                    width: "85%",
                                }}>
                                    Empowering the everyday Real Estate Investor. Real Estate Investing Made Easy.
                                </p>
                                <div 
                                    className="opacity"
                                    style={{
                                        backgroundColor: "white",
                                        borderRadius: "50px",
                                        color: "#296cf6",
                                        cursor: "pointer",
                                        display: "inline-block",
                                        fontWeight: "bold",
                                        marginTop: "50px",
                                        padding: "12.5px 25px 12.5px 25px",
                                    }}>
                                    Sign Up Instead
                                </div>
                                <p 
                                    className="opacity"
                                    style={{
                                        color: "white",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        marginTop: "15px",
                                    }}>
                                    Back Home
                                </p>
                            </div>
                            <div style={{
                                backgroundColor: "white",
                                borderRadius: "0px 8px 8px 0px",
                                float: "left",
                                height: "650px",
                                width: "50%",
                            }}>
                                <input 
                                    className="contact_page_input"
                                    placeholder="Name"
                                ></input>
                                <input 
                                    className="contact_page_input"
                                    placeholder="Email"
                                ></input>
                                <div className="clearfix"/>
                                <label style={{
                                    float: "left",
                                    fontFamily: "'Poppins', sans-serif",
                                    marginLeft: "calc(10% - 15px)",
                                    marginRight: "calc(10% - 15px)",
                                    marginTop: "15px",
                                    width: "80%",
                                }}>Additional Information</label>
                                <textarea 
                                    maxLength="750"
                                    placeholder="Additional Information"
                                    style={{
                                        border: "1px solid #d3d3d3",
                                        borderRadius: "4px",
                                        fontSize: "1.0em",
                                        height: "200px",
                                        marginLeft: "calc(10% - 15px)",
                                        marginRight: "calc(10% - 15px)",
                                        marginTop: "15px",
                                        padding: "10px 15px 10px 15px",
                                        resize: "none",
                                        width: "80%",
                                    }}/>
                                <p style={{
                                    marginLeft: "calc(10% - 15px)",
                                    marginRight: "calc(10% - 15px)",
                                    marginTop: "15px",
                                    width: "80%",
                                }}>
                                    By submitting this form, I agree that ReiMe may store and use the information provided above for the sole express purpose of contacting me about my inquiry.
                                </p>
                                <div style={{
                                    marginTop: "30px",
                                    textAlign: "center",
                                }}>
                                    <div 
                                        className="opacity"
                                        style={{
                                            backgroundColor: "#296cf6",
                                            borderRadius: "50px",
                                            color: "white",
                                            cursor: "pointer",
                                            display: "inline-block",
                                            fontSize: "1.1em",
                                            fontWeight: "bold",
                                            padding: "12.5px 20px 12.5px 20px",
                                        }}>
                                        Contact Us
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default TermsAndAgreementPage;