import React from 'react';

import './CSS/AboutPage.css';

import logo from './Images/LogoStretch.png';

import NavigationBar from './NavigationBar.js';
import Footer from './Footer.js';

import { BsFillHouseFill } from 'react-icons/bs';
import { Link } from "react-router-dom";
import { MdPlayArrow } from 'react-icons/md';
import { TiUser } from 'react-icons/ti';
import { GoFileDirectory } from 'react-icons/go';
import { FaMoneyCheck } from 'react-icons/fa';
import { SiGoogleanalytics } from 'react-icons/si';

class AboutPage extends React.Component {
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
                    paddingTop: "60px",
                    width: "100%",
                }}>
                    <div style={{
                        marginLeft: "18%",
                        marginRight: "18%",
                        marginTop: "75px",
                        textAlign: "center",
                        width: "64%",
                    }}>
                        <p style={{
                            display: "inline-block",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "2.3em",
                            fontWeight: "bold",
                            textAlign: "center",
                        }}>
                            Empowering the Real Estate Investor
                        </p>
                        <p style={{
                            display: "inline-block",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "1.0em",
                            marginTop: "20px",
                            width: "70%",
                        }}>
                            At ReiMe, our mission is to empower the everyday Real Estate Investor. No matter whether you're a first time property owner or a seasoned pro, ReiMe has something to offer for everyone. We believe everyone should have access to powerful Software to supercharge their portfolio. 
                        </p>
                        <div style={{
                            float: "left",
                            marginBottom: "50px",
                            marginTop: "50px",
                            width: "100%",
                        }}>
                            <BsFillHouseFill style={{
                                color: "#296cf6",
                                display: "inline-block",
                                height: "50px",
                                marginRight: "25px",
                                padding: "5px",
                                width: "50px",
                            }}/>
                            <div style={{
                                border: "3px dashed #296cf6",
                                display: "inline-block",
                                marginBottom: "25px",
                                width: "50px",
                            }}/>
                            <TiUser style={{
                                border: "3px solid #296cf6",
                                borderRadius: "50px",
                                color: "#296cf6",
                                display: "inline-block",
                                height: "50px",
                                marginLeft: "25px",
                                marginRight: "25px",
                                padding: "5px",
                                width: "50px",
                            }}/>
                            <div style={{
                                border: "3px dashed #296cf6",
                                display: "inline-block",
                                marginBottom: "25px",
                                width: "50px",
                            }}/>
                            <SiGoogleanalytics style={{
                                color: "#296cf6",
                                display: "inline-block",
                                height: "50px",
                                marginLeft: "25px",
                                padding: "5px",
                                width: "50px",
                            }}/>
                        </div>
                        <p style={{
                            display: "inline-block",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "1.0em",
                            marginTop: "20px",
                            width: "70%",
                        }}>
                            We believe that Real Estate investors should have one central hub where they can manage everything related to their investments, from tracking performance to managing associated files and expenses, to managing their tenants.    
                        </p>
                        <div style={{
                            float: "left",
                            marginBottom: "50px",
                            marginTop: "50px",
                            width: "100%",
                        }}>
                            <GoFileDirectory style={{
                                color: "#296cf6",
                                display: "inline-block",
                                height: "50px",
                                marginRight: "25px",
                                padding: "5px",
                                width: "50px",
                            }}/>
                            <div style={{
                                border: "3px dashed #296cf6",
                                display: "inline-block",
                                marginBottom: "25px",
                                width: "50px",
                            }}/>
                            {/* <TiUser style={{
                                border: "3px solid #296cf6",
                                borderRadius: "50px",
                                color: "#296cf6",
                                display: "inline-block",
                                height: "50px",
                                marginLeft: "25px",
                                marginRight: "25px",
                                padding: "5px",
                                width: "50px",
                            }}/>
                            <div style={{
                                border: "3px dashed #296cf6",
                                display: "inline-block",
                                marginBottom: "25px",
                                width: "50px",
                            }}/> */}
                            <FaMoneyCheck style={{
                                color: "#296cf6",
                                display: "inline-block",
                                height: "50px",
                                marginLeft: "25px",
                                padding: "5px",
                                width: "50px",
                            }}/>
                        </div>
                        <p style={{
                            display: "inline-block",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "1.0em",
                            marginTop: "20px",
                            width: "70%",
                        }}>
                            We started off as Real Estate Investors ourselves, frustrated with trying to smash Excel files, Google Documents, Rental Websites, and more into a cohesive picture of our investments. We couldn't ever get a clear picture of how our investments were doing, so we started ReiMe, to help as many investors simplify their portfolios as possible.
                        </p>
                    </div>
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
                            Ready to be empowered?
                        </p>
                        <div className="clearfix"/>
                        <Link to="/signup">
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
                        </Link>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default AboutPage;