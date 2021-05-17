import React from 'react';

import Login from './Login.js';
import SignUp from './SignUp.js';
import NavigationBar from './NavigationBar.js';
import Footer from './Footer.js';

import './CSS/HomePage.css';

import HomePageDash from './Images/HomePageDash.png';
import PropertyCard from './Images/PropertyCard.png';

import { Link } from "react-router-dom";
import { MdPlayArrow } from 'react-icons/md';

import { BsFillHouseFill } from 'react-icons/bs';
import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { IoSettingsSharp } from 'react-icons/io5';
import { MdFeedback, MdDashboard } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';
import { FaMoneyCheck } from 'react-icons/fa';
import { TiUser } from 'react-icons/ti';

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLogin: true
        };
    }

    componentDidMount() {
        window.scrollTo(0, 0);
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
                        height: "calc(100vh - 225px)",
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
                                color: "grey",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.2em",
                                marginTop: "15px",
                                width: "500px",
                            }}>
                                Unlock your full potential. Let us handle the book-keeping so you can do what you do best. Invest.
                            </p>
                            <div className="clearfix"/>
                            <div  
                                className="opacity"
                                onClick={() => this.setState({
                                    isLogin: false,
                                })}
                                style={{
                                    backgroundColor: "#417df7",
                                    borderRadius: "50px",
                                    color: "white",
                                    cursor: "pointer",
                                    float: "left",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.10em",
                                    fontWeight: "bold",
                                    marginTop: "15px",
                                    padding: "12px 30px 12px 30px",
                                    transition: "0.5s",
                                }}>
                                Create Account
                            </div>
                        </div>
                        <div style={{
                            float: "right",
                            marginRight: "18%",
                            width: "425px",
                        }}>
                            {this.state.isLogin ? 
                                <div>
                                    <div style={{
                                        backgroundColor: "white",
                                        borderRadius: "10px",
                                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.20), 0 6px 20px 0 rgba(0.2, 0, 0, 0.2)",
                                        marginTop: "calc(((700px - 350px) / 2) - 40px)",
                                        float: "left",
                                    }}>
                                        <Login></Login>
                                    </div>
                                    <input 
                                        id="home_page_create_account" 
                                        className="opacity" 
                                        type="submit" 
                                        value="Create Account" onClick={() => this.setState({
                                            isLogin: false,
                                        })}></input>
                                </div> :
                                    <div>
                                        <div style={{
                                        backgroundColor: "white",
                                        borderRadius: "10px",
                                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.20), 0 6px 20px 0 rgba(0.2, 0, 0, 0.2)",
                                        float: "left",
                                        marginTop: "calc(((700px - 450px) / 2) - 40px)",
                                    }}>
                                        <SignUp/>
                                        <div style={{
                                            paddingBottom: "15px",
                                            paddingTop: "15px",
                                        }}>
                                            <p  
                                                className="home_page_have_account_link opacity"
                                                onMouseDown={() => {
                                                    this.setState({
                                                        isLogin: true,
                                                    });
                                                }}
                                                style={{
                                                    cursor: "pointer",
                                                    textAlign: "center",
                                                }}>Have an account? Log In</p>
                                        </div>
                                    </div>
                                </div>}
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: "#296cf6",
                        height: "175px",
                        width: "100%",
                    }}>
                        <div style={{
                            float: "left",
                            marginLeft: "18%",
                            marginRight: "18%",
                            marginTop: "50px",
                            textAlign: "center",
                            width: "64%",
                        }}>
                            {/* <div style={{
                                float: "left",
                                width: "20%",
                            }}>
                                <MdDashboard style={{
                                    color: "white",
                                    height: "50px",
                                    width: "50px",
                                }}/>
                                <p style={{
                                    color: "white", 
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.2em",
                                    fontWeight: "bold",
                                    marginTop: "10px",
                                }}>
                                    Overview
                                </p>
                            </div> */}
                            <div style={{
                                float: "left",
                                width: "25%",
                            }}>
                                <BsFillHouseFill style={{
                                    color: "white",
                                    height: "50px",
                                    width: "50px",
                                }}/>
                                <p style={{
                                    color: "white", 
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.2em",
                                    fontWeight: "bold",
                                    marginTop: "10px",
                                }}>
                                    Properties
                                </p>
                            </div>
                            <div style={{
                                float: "left",
                                width: "25%",
                            }}>
                                <SiGoogleanalytics style={{
                                    color: "white",
                                    height: "50px",
                                    width: "50px",
                                }}/>
                                <p style={{
                                    color: "white", 
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.2em",
                                    fontWeight: "bold",
                                    marginTop: "10px",
                                }}>
                                    Analysis
                                </p>
                            </div>
                            <div style={{
                                float: "left",
                                width: "25%",
                            }}>
                                <FaMoneyCheck style={{
                                    color: "white",
                                    height: "50px",
                                    width: "50px",
                                }}/>
                                <p style={{
                                    color: "white", 
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.2em",
                                    fontWeight: "bold",
                                    marginTop: "10px",
                                }}>
                                    Expenses
                                </p>
                            </div>
                            <div style={{
                                float: "left",
                                width: "25%",
                            }}>
                                <GoFileDirectory style={{
                                    color: "white",
                                    height: "50px",
                                    width: "50px",
                                }}/>
                                <p style={{
                                    color: "white", 
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.2em",
                                    fontWeight: "bold",
                                    marginTop: "10px",
                                }}>
                                    Files
                                </p>
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
                                marginTop: "10px",
                            }}>
                                <Link to="/signup">
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
                                </Link>
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
                        marginTop: "75px",
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
                                    width: "250px",
                                    zIndex: "-1",
                                }}
                                src={PropertyCard}></img>
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
                    <div className="clearfix"/>
                    <Footer/>
                </div>
            </div>
        )
    }
}

export default HomePage;