import React from 'react';

import axios from 'axios';

import './CSS/DashboardSidebar.css';
import './CSS/Style.css';

import { Link, Redirect } from 'react-router-dom';

import { BsFillGrid1X2Fill, BsFillHouseFill } from 'react-icons/bs';
import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { IoSettingsSharp } from 'react-icons/io5';
import { BsFillPlusSquareFill } from 'react-icons/bs';
import { MdFeedback, MdDashboard } from 'react-icons/md';
import { RiDashboardFill } from 'react-icons/ri';
import { GrFormDown } from 'react-icons/gr';

class DashboardSidebar extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.data.state.user,
            totalEstimateWorth: this.props.data.state.totalEstimateWorth,
            missingEstimate: this.props.data.state.missingEstimate,
            currentPage: this.props.data.state.currentPage,
            profilePicture: this.props.data.state.profilePicture
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
            }).catch(error => console.log(error))
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
                <div>
                    <div id="dashboard_sidebar_parent">
                        <img id="dashboard_sidebar_profile_pic" src={this.state.profilePicture}>
                        </img>
                        <div className="clearfix"/>
                        <div id="dashboard_sidebar_profile_pic_text_box">
                            <p className="dashboard_sidebar_profile_pic_title">
                                {this.state.user["first_name"]} {this.state.user["last_name"]}
                                <GrFormDown 
                                    onMouseDown={() => this.setState({
                                        displayAccountTooltip: !this.state.displayAccountTooltip
                                    })}
                                    className="dashboard_sidebar_profile_pic_icon"></GrFormDown>
                            </p>
                            {this.state.displayAccountTooltip ? 
                            <div id="dashboard_sidebar_profile_tooltip">
                                <li 
                                    onClick={() => this.setState({
                                        redirect: "/"
                                    })}
                                    className="dashboard_sidebar_profile_tooltip_list">
                                    Sign Out
                                </li>
                            </div> :
                            <div></div>}
                        </div>
                        <Link id="dashboard_new_property_button" to={{
                            pathname: "/addproperty",
                            state: {
                                user: this.state.user,
                                totalEstimateWorth: this.state.totalEstimateWorth,
                                missingEstimate: this.state.missingEstimate,
                                profilePicture: this.state.profilePicture
                            }
                        }}>
                            <div id="BsFillPlusSquareFill">New Property</div>
                            {/* New Property */}
                        </Link> 
                        <div className="clearfix"/>
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
                                <MdDashboard className={this.state.currentPage === "overview" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <p className={this.state.currentPage === "overview" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : "dashboard_sidebar_link_text"}>
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
                        {/* <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/explore",
                                state: {
                                    id: this.state.id,
                                    firstName: this.state.firstName,
                                    lastName: this.state.lastName,
                                    email: this.state.email,
                                    totalEstimateWorth: this.state.totalEstimateWorth,
                                    missingEstimate: this.state.missingEstimate,
                                }
                            }}>
                                <MdExplore className="dashboard_sidebar_link_icon" />
                                <p className="dashboard_sidebar_link_text">
                                    Explore
                                </p>
                            </Link>
                        </div> */}
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
                        <div className="dashboard_sidebar_link" id="dashboard_last">
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
                        <div id="dashboard_sidebar_version">
                            <p id="dashboard_sidebar_version_text">
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