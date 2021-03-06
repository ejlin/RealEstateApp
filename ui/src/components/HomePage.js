import React from 'react';

import Login from './Login.js';
import SignUp from './SignUp.js';
import NavigationBar from './NavigationBar.js';
import Footer from './Footer.js';

import './CSS/HomePage.css';

import HomePageDash from './Images/HomePageDash.png';

import { Link } from "react-router-dom";
import { MdPlayArrow } from 'react-icons/md';

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLogin: true
        };

        this.setLogin = this.setLogin.bind(this);
    }
    
    setLogin(login) {
        this.setState({
            isLogin: login
        })
    }

    render() {
        return (
            <div>
                <NavigationBar/>
                <div style={{
                    width: "100%",
                }}>
                    <div style={{
                        backgroundColor: "white",
                        // "#EEF0F3",
                        height: "calc(100vh - 300px)",
                        paddingTop: "50px",
                        width: "100%"
                        
                    }}>
                        <div style={{
                            float: "left",
                            height: "350px",
                            marginLeft: "18%",
                            marginTop: "calc(((700px - 350px) / 2) - 40px)",
                            width: "calc((100% - 18% - 18% - 425px - 75px))",
                        }}>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "3.5em",
                                fontWeight: "bold",
                                lineHeight: "64px",
                            }}>
                                Real Estate Investing
                            <br></br>
                                made easy.
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.4em",
                                
                                marginTop: "15px",
                                width: "500px",
                            }}>
                                Unlock your full potential. Let us handle the book-keeping so you can do what you do best. Invest.
                            </p>
                            <div className="clearfix"/>
                            <div id="home_page_parent_signup_button" onClick={() => this.setLogin(false)}>
                                Create Account
                            </div>
                        </div>
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "10px",
                            boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 3px 10px 0 rgba(0, 0, 0, 0.1)",
                            float: "right",
                            marginRight: "18%",
                            marginTop: "calc(((700px - 350px) / 2) - 40px)",
                            width: "425px",
                        }}>
                            <div id="home_page_parent_login_signup_box" className={this.state.isLogin ? "login_height" : "signup_height"}>
                            {this.state.isLogin ? 
                                <div>
                                    <Login></Login>
                                    <div className="clearfix"/>
                                    <input id="home_page_create_account" type="submit" value="Create Account" onClick={() => this.setLogin(false)}></input>
                                </div> :
                                <div>
                                    <SignUp></SignUp>
                                    <div className="clearfix"/>
                                    <input id="home_page_create_account" type="submit" value="Log In" onClick={() => this.setLogin(true)}></input>
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <p style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "2.3em",
                            fontWeight: "bold",
                            lineHeight: "40px",
                            marginTop: "75px",
                            textAlign: "center",
                        }}>
                            Manage your Real Estate
                            <br></br>
                            Portfolio all in one place.
                        </p>
                        <div 
                            onMouseEnter={() => {
                                let freeDemoArrow = document.getElementById("free_demo_arrow");
                                freeDemoArrow.style.marginLeft = "10px";
                            }}
                            onMouseLeave={() => {
                                let freeDemoArrow = document.getElementById("free_demo_arrow");
                                freeDemoArrow.style.marginLeft = "2.5px";
                            }}
                            className="opacity"
                            style={{
                                cursor: "pointer",
                                height: "25px",
                                marginTop: "10px",
                                textAlign: "center",
                                width: "100%",
                            }}>
                            <div style={{
                                display: "inline-block",
                            }}>
                                <p style={{
                                        color: "#296cf6",
                                        display: "inline-block",
                                        float: "left",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "1.2em",
                                        lineHeight: "25px",
                                    }}>
                                    Try one Month Free
                                </p>
                                <MdPlayArrow 
                                    id="free_demo_arrow"
                                    style={{
                                        color: "#296cf6",
                                        display: "inline-block",
                                        height: "25px",
                                        marginLeft: "2.5px",
                                        float: "left",
                                    }}/>
                            </div>
                        </div>
                        
                    </div>
                    <div className="clearfix"/>
                    <div style={{
                        marginLeft: "18%",
                        marginRight: "18%",
                        marginTop: "50px",
                        width: "64%",
                    }}>
                        <div style={{
                            float: "left",
                            width: "38%",
                        }}>
                            <p style={{
                                color: "#296cf6",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.2em",
                                fontWeight: "bold",
                                
                            }}>
                                ReiMe Dashboard
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "2.3em",
                                fontWeight: "bold",
                                lineHeight: "45px",
                                marginTop: "15px",
                            }}>
                                An Intuitive Dashboard You'll Love
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.15em",
                                lineHeight: "25px",
                                marginTop: "15px",
                            }}>
                                Add properties from your portfolio and track them all in one place.
                            </p>
                            <div style={{
                                marginLeft: "15px",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.15em",
                                    lineHeight: "25px",
                                    marginTop: "15px",
                                }}>
                                    &#x2022; Track an overview of your properties
                                    <br></br>
                                    &#x2022; Manage your portfolio performance
                                </p>
                            </div>
                            
                        </div>
                        <div style={{
                            float: "right",
                            overflow: "hidden",
                            width: "calc(62% - 75px)",
                        }}>
                            <img 
                                style={{
                                    borderRadius: "8px",
                                    boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                    width: "125%",
                                    zIndex: "-1",
                                }}
                                src={HomePageDash}></img>
                        </div>
                    </div>
                    <div className="clearfix"/>

                    {/* Properties */}
                    <div style={{
                        marginLeft: "18%",
                        marginRight: "18%",
                        marginTop: "150px",
                        width: "64%",
                    }}>
                        <div style={{
                            float: "right",
                            width: "38%",
                        }}>
                            <p style={{
                                color: "#296cf6",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.2em",
                                fontWeight: "bold",
                                
                            }}>
                                Properties
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "2.3em",
                                fontWeight: "bold",
                                lineHeight: "45px",
                                marginTop: "15px",
                            }}>
                                Manage and view all your properties
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.15em",
                                lineHeight: "25px",
                                marginTop: "15px",
                            }}>
                                Add properties from your portfolio and track them all in one place.
                            </p>
                            <div style={{
                                marginLeft: "15px",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.15em",
                                    lineHeight: "25px",
                                    marginTop: "15px",
                                }}>
                                    &#x2022; Track an overview of your properties
                                    <br></br>
                                    &#x2022; Manage your portfolio performance
                                </p>
                            </div>
                            
                        </div>
                        <div style={{
                            float: "left",
                            overflow: "hidden",
                            width: "calc(62% - 75px)",
                        }}>
                            <img 
                                style={{
                                    borderRadius: "8px",
                                    boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                    width: "125%",
                                    zIndex: "-1",
                                }}
                                src={HomePageDash}></img>
                        </div>
                    </div>
                    <div className="clearfix"/>
                    <div style={{
                        marginLeft: "18%",
                        marginRight: "18%",
                        marginTop: "150px",
                        width: "64%",
                    }}>
                        <div style={{
                            float: "left",
                            width: "38%",
                        }}>
                            <p style={{
                                color: "#296cf6",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.2em",
                                fontWeight: "bold",
                                
                            }}>
                                Analysis
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "2.3em",
                                fontWeight: "bold",
                                lineHeight: "45px",
                                marginTop: "15px",
                            }}>
                                Powerful Analytics at Your Fingertips
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.15em",
                                lineHeight: "25px",
                                marginTop: "15px",
                            }}>
                                Add properties from your portfolio and track them all in one place.
                            </p>
                            <div style={{
                                marginLeft: "15px",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.15em",
                                    lineHeight: "25px",
                                    marginTop: "15px",
                                }}>
                                    &#x2022; Track an overview of your properties
                                    <br></br>
                                    &#x2022; Manage your portfolio performance
                                </p>
                            </div>
                            
                        </div>
                        <div style={{
                            float: "right",
                            overflow: "hidden",
                            width: "calc(62% - 75px)",
                        }}>
                            <img 
                                style={{
                                    borderRadius: "8px",
                                    boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                    width: "125%",
                                    zIndex: "-1",
                                }}
                                src={HomePageDash}></img>
                        </div>
                    </div>
                    <div className="clearfix"/>

                    {/* Properties */}
                    <div style={{
                        marginLeft: "18%",
                        marginRight: "18%",
                        marginTop: "150px",
                        width: "64%",
                    }}>
                        <div style={{
                            float: "right",
                            width: "38%",
                        }}>
                            <p style={{
                                color: "#296cf6",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.2em",
                                fontWeight: "bold",
                                
                            }}>
                                Expenses
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "2.3em",
                                fontWeight: "bold",
                                lineHeight: "45px",
                                marginTop: "15px",
                            }}>
                                Manage and view all your properties
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.15em",
                                lineHeight: "25px",
                                marginTop: "15px",
                            }}>
                                Add properties from your portfolio and track them all in one place.
                            </p>
                            <div style={{
                                marginLeft: "15px",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.15em",
                                    lineHeight: "25px",
                                    marginTop: "15px",
                                }}>
                                    &#x2022; Track an overview of your properties
                                    <br></br>
                                    &#x2022; Manage your portfolio performance
                                </p>
                            </div>
                            
                        </div>
                        <div style={{
                            float: "left",
                            overflow: "hidden",
                            width: "calc(62% - 75px)",
                        }}>
                            <img 
                                style={{
                                    borderRadius: "8px",
                                    boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                    width: "125%",
                                    zIndex: "-1",
                                }}
                                src={HomePageDash}></img>
                        </div>
                    </div>
                    <div className="clearfix"/>
                    <div style={{
                        marginLeft: "18%",
                        marginRight: "18%",
                        marginTop: "150px",
                        width: "64%",
                    }}>
                        <div style={{
                            float: "left",
                            width: "38%",
                        }}>
                            <p style={{
                                color: "#296cf6",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.2em",
                                fontWeight: "bold",
                                
                            }}>
                                Files
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "2.3em",
                                fontWeight: "bold",
                                lineHeight: "45px",
                                marginTop: "15px",
                            }}>
                                Powerful Analytics at Your Fingertips
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.15em",
                                lineHeight: "25px",
                                marginTop: "15px",
                            }}>
                                Add properties from your portfolio and track them all in one place.
                            </p>
                            <div style={{
                                marginLeft: "15px",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.15em",
                                    lineHeight: "25px",
                                    marginTop: "15px",
                                }}>
                                    &#x2022; Track an overview of your properties
                                    <br></br>
                                    &#x2022; Manage your portfolio performance
                                </p>
                            </div>
                            
                        </div>
                        <div style={{
                            float: "right",
                            overflow: "hidden",
                            width: "calc(62% - 75px)",
                        }}>
                            <img 
                                style={{
                                    borderRadius: "8px",
                                    boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                    width: "125%",
                                    zIndex: "-1",
                                }}
                                src={HomePageDash}></img>
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
                            Ready to accelerate your Real Estate Career?
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
                    <div className="clearfix"/>
                    <Footer/>
                </div>
            </div>
        )
    }
}

export default HomePage;