import React from 'react';

import { Link } from "react-router-dom";

import NavigationBar from './NavigationBar.js';
import SignUp from './SignUp.js';
import Footer from './Footer.js';

import './CSS/SignUpPage.css';

class SignUpPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <NavigationBar/>
                <div style={{
                    backgroundColor: "#f5f5fa",
                    float: "left",
                    height: "100vh",
                    textAlign: "center",
                    width: "100%",
                }}>
                    <div style={{
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.10), 0 3px 10px 0 rgba(0.1, 0, 0, 0.1)",
                        display: "inline-block",
                        marginTop: "150px",
                        width: "450px",
                    }}>
                        <div style={{
                            backgroundColor: "#296cf6",
                            borderRadius: "8px 8px 0px 0px",
                            paddingBottom: "15px",
                            paddingTop: "15px",
                            width: "100%",
                        }}>
                            <p style={{
                                color: "white",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "2.2em",
                                fontWeight: "bold",
                            }}>
                                Sign Up
                            </p>
                            <p style={{
                                color: "white",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.0em",
                            }}>
                                Start your Free Trial
                            </p>
                            <p style={{
                                color: "white",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.0em",
                                fontWeight: "bold",
                            }}>
                                Cancel anytime within 30 days
                            </p>
                        </div>
                        <SignUp/>
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            paddingBottom: "15px",
                        }}>
                            <Link to="/">
                                <p  
                                    className="home_page_have_account_link opacity"
                                    style={{
                                        cursor: "pointer",
                                        textAlign: "center",
                                    }}>Have an account? Log In</p>
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default SignUpPage;