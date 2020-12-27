import React from 'react';

import './CSS/DashboardSidebar.css';
import './CSS/Style.css';

import { Link } from 'react-router-dom';

import { BsFillGrid1X2Fill, BsFillHouseFill } from 'react-icons/bs';
import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { IoSettingsSharp } from 'react-icons/io5';
import { BsFillPlusSquareFill } from 'react-icons/bs';
import { MdFeedback } from 'react-icons/md';

class DashboardSidebar extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.data.state.user,
            totalEstimateWorth: this.props.data.state.totalEstimateWorth,
            missingEstimate: this.props.data.state.missingEstimate,
            currentPage: this.props.data.state.currentPage
        };
    }
    render() {
        return (
            <div>
                <div>
                    <div id="dashboard_sidebar_parent">
                        <Link id="dashboard_new_property_button" to={{
                            pathname: "/addproperty",
                            state: {
                                user: this.state.user,
                                totalEstimateWorth: this.state.totalEstimateWorth,
                                missingEstimate: this.state.missingEstimate,
                            }
                        }}>
                            <BsFillPlusSquareFill id="BsFillPlusSquareFill"></BsFillPlusSquareFill>
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
                                }
                            }}>
                                <BsFillGrid1X2Fill className={this.state.currentPage === "overview" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <div className="clearfix"/>
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
                                }
                            }}>
                                <BsFillHouseFill className={this.state.currentPage === "properties" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <div className="clearfix"/>
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
                                }
                            }}>
                                <SiGoogleanalytics className={this.state.currentPage === "analysis" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <div className="clearfix"/>
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
                                }
                            }}>
                                <GoFileDirectory className={this.state.currentPage === "files" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <div className="clearfix"/>
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
                                <div className="clearfix"/>
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
                                }
                            }}>
                                <IoSettingsSharp className={this.state.currentPage === "settings" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <div className="clearfix"/>
                                <p className={this.state.currentPage === "settings" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : "dashboard_sidebar_link_text"}>
                                    Settings
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link" id="dashboard_last">
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/report",
                                state: {
                                    user: this.state.user,
                                    totalEstimateWorth: this.state.totalEstimateWorth,
                                    missingEstimate: this.state.missingEstimate,
                                }
                            }}>
                                <MdFeedback className={this.state.currentPage === "report" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_icon" : "dashboard_sidebar_link_icon"} />
                                <div className="clearfix"/>
                                <p className={this.state.currentPage === "report" ? "dashboard_sidebar_link_icon_on dashboard_sidebar_link_text" : "dashboard_sidebar_link_text"}>
                                    Report
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