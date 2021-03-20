import React from 'react';

import axios from 'axios';

import './CSS/DashboardSidebar.css';
import './CSS/Style.css';

import logo from './Images/LogoStretch.png';

import { Link, Redirect } from 'react-router-dom';

import { capitalizeName } from '../utility/Util.js'; 

import { BsFillHouseFill } from 'react-icons/bs';
import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { IoSettingsSharp } from 'react-icons/io5';
import { MdFeedback, MdDashboard, MdAdd } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';
import { FaMoneyCheck } from 'react-icons/fa';
import { TiUser } from 'react-icons/ti';
import { IoAddSharp } from 'react-icons/io5';

class DashboardSidebar extends React.Component {
    
    constructor(props) {
        super(props);

        let user;

        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            user = JSON.parse(loggedInUser);
        } else {
            user = null;
        }

        this.state = {
            user: user,
            totalEstimateWorth: this.props.data.state.totalEstimateWorth,
            missingEstimate: this.props.data.state.missingEstimate,
            currentPage: this.props.data.state.currentPage,
            profilePicture: this.props.data.state.profilePicture,
            inactivatedAccount: this.props.data.state.inactivatedAccount,
        };
    }

    componentDidMount() {
        if (this.state.profilePicture === "" || this.state.profilePicture === undefined || this.state.profilePicture === null) {
            axios({
                method: 'get',
                url: '/api/user/settings/profile/picture/' + this.state.user["id"],
            }).then(response => {
                var src = response.data;
                this.setState({
                    profilePicture: src
                })
            }).catch(error => {
                console.log(error);
                let statusCode = error.response.status;
                if (statusCode === 404) {
                    console.log("here");
                }
                this.setState({
                    profilePicture: null,
                })
            })
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect
            }} />
        }
        return (
            <div>
                {this.state.inactivatedAccount ? 
                    <div style={{
                        backgroundColor: "white",
                        height: "100vh",
                        opacity: "0.5",
                        position: "fixed",
                        width: "250px",
                        zIndex: "5",
                    }}>
                    </div> : 
                    <div></div>
                }
                <div style={{
                    backgroundColor: "#f5f5fa",
                    display: "block",
                    float: "left",
                    height: "calc(100vh - 50px)",
                    position: "fixed",
                    overflow: "scroll",
                    width: "250px",
                }}>
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        height: "65px",
                        marginLeft: "10%",
                        marginRight: "10%",
                        marginTop: "50px",
                        width: "80%",
                    }}>
                        <img src={logo}
                            style={{
                                height: "27.5px",
                                marginLeft: "calc((100% - 135px)/2)",
                                marginTop: "calc((65px - 27.5px)/2)",
                                width: "135px",
                            }}
                        ></img>
                    </div>
                    {/* {
                        this.state.profilePicture !== null && this.state.profilePicture !== undefined && this.state.profilePicture !== "" ? 
                        <img 
                            src={this.state.profilePicture}
                            style={{
                                borderRadius: "50px",
                                height: "100px",
                                marginLeft: "calc((100% - 100px)/2)",
                                marginTop: "80px",
                                userSelect: "none",
                                width: "100px",
                            }}/>:
                        <TiUser style={{
                            border: "3px solid white",
                            borderRadius: "50px",
                            color: "white",
                            height: "calc(100px - 6px)",
                            marginLeft: "calc((100% - 100px)/2)",
                            marginTop: "80px",
                            width: "calc(100px - 6px)",
                        }}></TiUser>
                    }
                    <div className="clearfix"/> */}
                    {/* <div
                        style={{
                            marginTop: "15px",
                        }}>
                        <p style={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                        }}>
                            {capitalizeName(this.state.user["first_name"])} {capitalizeName(this.state.user["last_name"])}
                            <FiChevronDown
                                onMouseDown={() => {
                                    if (!this.state.inactivatedAccount) {
                                        this.setState({
                                            displayAccountTooltip: !this.state.displayAccountTooltip
                                        })
                                    }
                                }}
                                style={{
                                    color: "white !important",
                                    cursor: "pointer",
                                    marginLeft: "5px",
                                    marginTop: "3px",
                                    position: "absolute",
                                }}/>
                        </p>
                        {
                            this.state.displayAccountTooltip ? 
                            <div style={{
                                backgroundColor: "white",
                                borderRadius: "4px",
                                marginLeft: "calc((100% - 120px)/2)",
                                marginTop: "5px",
                                position: "absolute",
                                width: "120px",
                                zIndex: "5",
                            }}>
                                <li 
                                    onClick={() => 
                                        {
                                            localStorage.clear();
                                            this.setState({
                                                redirect: "/"
                                            });
                                        }
                                    }
                                    className="dashboard_sidebar_tooltip"
                                    style={{
                                        cursor: "pointer",
                                        padding: "7.5px 15px 7.5px 15px",
                                        textAlign: "center",
                                        transition: "0.5s",
                                    }}>
                                    Sign Out
                                </li>
                            </div> :
                            <div></div>
                        }
                    </div> */}
                    
                    <Link 
                        className="dashboard_new_property_button"
                        // style={{
                        //     backgroundColor: "#296CF6",
                        //     border: "none",
                        //     borderRadius: "8px",
                        //     color: "white",
                        //     cursor: "pointer",
                        //     float: "left",
                        //     fontWeight: "bold",
                        //     height: "45px",
                        //     lineHeight: "45px",
                        //     marginLeft: "40px",
                        //     marginTop: "25px",
                        //     textAlign: "center",
                        //     textDecoration: "none",
                        //     userSelect: "none",
                        //     width: "calc(100% - 80px)",
                        // }}
                        style={{
                            float: "left",
                            marginBottom: "25px",
                            marginLeft: "40px",
                            marginRight: "40px",
                            marginTop: "25px",
                            textDecoration: "none",
                            width: "calc(100% - 80px)",
                        }}
                        to={{
                            pathname: "/addproperty",
                            state: {
                                user: this.state.user,
                                totalEstimateWorth: this.state.totalEstimateWorth,
                                missingEstimate: this.state.missingEstimate,
                                profilePicture: this.state.profilePicture
                            }
                        }}>
                        <MdAdd style={{
                            backgroundColor: "white",
                            borderRadius: "50%",
                            color: "#296cf6",
                            float: "left",
                            height: "20px",
                            padding: "10px",
                            width: "20px",
                        }}/>
                        <p style={{
                            color: "#296cf6",
                            float: "left",
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: "bold",
                            lineHeight: "40px",
                            marginLeft: "10px",
                        }}>New</p>
                    </Link> 
                    <div style={{
                        backgroundColor: "#d3d3d3",
                        float: "left",
                        height: "1px",
                        marginLeft: "10%",
                        marginRight: "10%",
                        width: "80%",
                    }}></div>
                    <div className="clearfix"/>
                    <div style={{
                        marginTop: "0px",
                    }}>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/dashboard",
                                state: {
                                    user: this.state.user,
                                    totalEstimateWorth: this.state.totalEstimateWorth,
                                    missingEstimate: this.state.missingEstimate,
                                    profilePicture: this.state.profilePicture
                                }
                            }}>
                                <MdDashboard 
                                    className={
                                        this.state.currentPage === "overview" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : 
                                        "dashboard_sidebar_link_icon"
                                }/>
                                <p 
                                    className={
                                        this.state.currentPage === "overview" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : 
                                        "dashboard_sidebar_link_text"
                                }>
                                    Overview
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/properties",
                                state: {
                                    user: this.state.user,
                                    totalEstimateWorth: this.state.totalEstimateWorth,
                                    missingEstimate: this.state.missingEstimate,
                                    profilePicture: this.state.profilePicture
                                }
                            }}>
                                <BsFillHouseFill className={this.state.currentPage === "properties" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <p className={this.state.currentPage === "properties" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : "dashboard_sidebar_link_text"}>
                                    Properties
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/analysis",
                                state: {
                                    user: this.state.user,
                                    totalEstimateWorth: this.state.totalEstimateWorth,
                                    missingEstimate: this.state.missingEstimate,
                                    profilePicture: this.state.profilePicture
                                }
                            }}>
                                <SiGoogleanalytics className={this.state.currentPage === "analysis" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <p className={this.state.currentPage === "analysis" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : "dashboard_sidebar_link_text"}>
                                    Analysis
                                </p>
                            </Link>
                        </div>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/expenses",
                                state: {
                                    user: this.state.user,
                                    totalEstimateWorth: this.state.totalEstimateWorth,
                                    missingEstimate: this.state.missingEstimate,
                                    profilePicture: this.state.profilePicture
                                }
                            }}>
                                <FaMoneyCheck className={this.state.currentPage === "expenses" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <p className={this.state.currentPage === "expenses" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : "dashboard_sidebar_link_text"}>
                                    Expenses
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/files",
                                state: {
                                    user: this.state.user,
                                    totalEstimateWorth: this.state.totalEstimateWorth,
                                    missingEstimate: this.state.missingEstimate,
                                    profilePicture: this.state.profilePicture
                                }
                            }}>
                                <GoFileDirectory className={this.state.currentPage === "files" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <p className={this.state.currentPage === "files" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : "dashboard_sidebar_link_text"}>
                                    Files
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/settings",
                                state: {
                                    user: this.state.user,
                                    totalEstimateWorth: this.state.totalEstimateWorth,
                                    missingEstimate: this.state.missingEstimate,
                                    profilePicture: this.state.profilePicture
                                }
                            }}>
                                <IoSettingsSharp className={this.state.currentPage === "settings" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <p className={this.state.currentPage === "settings" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : "dashboard_sidebar_link_text"}>
                                    Settings
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link"
                            style={{
                                marginTop: "75px",
                            }}>
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/feedback",
                                state: {
                                    user: this.state.user,
                                    totalEstimateWorth: this.state.totalEstimateWorth,
                                    missingEstimate: this.state.missingEstimate,
                                    profilePicture: this.state.profilePicture
                                }
                            }}>
                                <MdFeedback className={this.state.currentPage === "feedback" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <p className={this.state.currentPage === "feedback" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : "dashboard_sidebar_link_text"}>
                                    Feedback
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div style={{
                            backgroundColor: "#f5f5fa",
                            bottom: "0",
                            height: "50px",
                            position: "fixed",
                            width: "250px",
                        }}>
                            <p style={{
                                color: "#32384D",
                                lineHeight: "50px",
                                textAlign: "center",
                                userSelect: "none",
                            }}>
                                Beta
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default DashboardSidebar;