import React from 'react';
import './CSS/DashboardSidebar.css';
import './CSS/Style.css';
import { Link } from 'react-router-dom';
import { BsFillGrid1X2Fill, BsFillHouseFill } from 'react-icons/bs';
import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { MdExplore } from 'react-icons/md';
import { IoSettingsSharp } from 'react-icons/io5';
import { AiOutlineUser } from 'react-icons/ai';
import { BsFillPlusSquareFill } from 'react-icons/bs';

class DashboardSidebar extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.data.state.id,
            firstName: this.props.data.state.first_name,
            lastName: this.props.data.state.last_name,
            email: this.props.data.state.email
        };

        this.dropdownAccount = this.dropdownAccount.bind(this);
    }

    dropdownAccount() {
        
    }

    render() {
        return (
            <div>
                {/* <div>
                    <div id="dashboard_topbar_parent">
                        <button id="dashboard_topbar_account_button" onClick={this.dropdownAccount}>
                            <AiOutlineUser id="dashboard_topbar_account_button_icon" />
                            {this.state.firstName} {this.state.lastName}
                        </button>
                    </div>  
                </div> */}
                <div>
                    <div id="dashboard_sidebar_parent">
                        <Link id="dashboard_new_property_button" to={{
                            pathname: "/addproperty",
                            state: {
                                id: this.state.id,
                                first_name: this.state.firstName,
                                last_name: this.state.lastName,
                                email: this.state.email,
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
                                    id: this.state.id,
                                    first_name: this.state.firstName,
                                    last_name: this.state.lastName,
                                    email: this.state.email,
                                }
                            }}>
                                <BsFillGrid1X2Fill className="dashboard_sidebar_link_icon" />
                                <div className="clearfix"/>
                                <p className="dashboard_sidebar_link_text">
                                    Overview
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to={{
                                pathname: "/properties",
                                state: {
                                    id: this.state.id,
                                    first_name: this.state.firstName,
                                    last_name: this.state.lastName,
                                    email: this.state.email
                                }
                            }}>
                                <BsFillHouseFill className="dashboard_sidebar_link_icon" />
                                <div className="clearfix"/>
                                <p className="dashboard_sidebar_link_text">
                                    Properties
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to="/analysis" >
                                <SiGoogleanalytics className="dashboard_sidebar_link_icon" />
                                <div className="clearfix"/>
                                <p className="dashboard_sidebar_link_text">
                                    Analysis
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to="/files" >
                                <GoFileDirectory className="dashboard_sidebar_link_icon" />
                                <div className="clearfix"/>
                                <p className="dashboard_sidebar_link_text">
                                    Files
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to="/explore" >
                                <MdExplore className="dashboard_sidebar_link_icon" />
                                <div className="clearfix"/>
                                <p className="dashboard_sidebar_link_text">
                                    Explore
                                </p>
                            </Link>
                        </div>
                        <div className="clearfix"/>
                        <div className="dashboard_sidebar_link">
                            <Link className="dashboard_sidebar_inner_link" to="/settings" >
                                <IoSettingsSharp className="dashboard_sidebar_link_icon" />
                                <div className="clearfix"/>
                                <p className="dashboard_sidebar_link_text">
                                    Settings
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default DashboardSidebar;