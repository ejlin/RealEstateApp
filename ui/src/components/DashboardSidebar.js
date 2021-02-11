import React from 'react';

import axios from 'axios';

import './CSS/DashboardSidebar.css';
import './CSS/Style.css';

import { Link, Redirect } from 'react-router-dom';

import { capitalizeName } from '../utility/Util.js'; 

import { BsFillHouseFill } from 'react-icons/bs';
import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { IoSettingsSharp } from 'react-icons/io5';
import { MdFeedback, MdDashboard } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';
import { FaMoneyCheck } from 'react-icons/fa';
import { TiUser } from 'react-icons/ti';
import { ImUser } from 'react-icons/im';

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
                console.log(response.data);
                this.setState({
                    profilePicture: src
                })
            }).catch(error => {
                console.log(error);
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
                <div className="dashboard_sidebar_locked_parent">

                </div> : <div></div>}
                <div id="dashboard_sidebar_parent">
                    {this.state.profilePicture !== null && this.state.profilePicture !== undefined && this.state.profilePicture !== "" ? 
                    <img className="dashboard_sidebar_profile_pic" src={this.state.profilePicture}>
                    </img>:
                    <TiUser className="dashboard_sidebar_profile_pic_image_icon"></TiUser>}
                    <div className="clearfix"/>
                    <div id="dashboard_sidebar_profile_pic_text_box">
                        <p className="dashboard_sidebar_profile_pic_title">
                            {capitalizeName(this.state.user["first_name"])} {capitalizeName(this.state.user["last_name"])}
                            <FiChevronDown
                                onMouseDown={() => {
                                    if (!this.state.inactivatedAccount) {
                                        this.setState({
                                            displayAccountTooltip: !this.state.displayAccountTooltip
                                        })
                                    }
                                }}
                                className="dashboard_sidebar_profile_pic_icon"></FiChevronDown>
                        </p>
                        {this.state.displayAccountTooltip ? 
                        <div id="dashboard_sidebar_profile_tooltip">
                            <li 
                                onClick={() => 
                                    {
                                        localStorage.clear();
                                        this.setState({
                                            redirect: "/"
                                        });
                                    }
                                }
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
        )
    }
}

export default DashboardSidebar;