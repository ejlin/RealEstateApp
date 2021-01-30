import React from 'react';
import axios from 'axios';

import './CSS/PropertyPage.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { numberWithCommas } from '../utility/Util.js';

import { Link, Redirect } from 'react-router-dom';

import { IoTrashSharp, IoCaretBackOutline } from 'react-icons/io5';
import { BsFillHouseFill } from 'react-icons/bs';
import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { IoSettingsSharp } from 'react-icons/io5';
import { FiChevronDown } from 'react-icons/fi';
import { FaMoneyCheck } from 'react-icons/fa';
import { MdFeedback, MdDashboard } from 'react-icons/md';

let URLBuilder = require('url-join');

const overview = "overview";
const analysis = "analysis";
const expenses = "expenses";
const files = "files";
const settings = "settings";

class PropertyPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            property: this.props.location.state.property,
            profilePicture: this.props.location.state.profilePicture,
            viewToDisplay: overview,
            isLoading: false
        };

        this.renderViewPage = this.renderViewPage.bind(this);
        this.convertPropertyTypeToText = this.convertPropertyTypeToText.bind(this);
    }

    componentDidMount() {
        console.log(this.state.property);
    }

    convertPropertyTypeToText(propertyType){
        switch (propertyType) {
            case 'SFH':
                return 'Single Family Home';
            default:
                return propertyType;
        }
    }

    renderViewPage() {
        switch (this.state.viewToDisplay) {
            case overview:
                return (
                    <div className="view_to_display_box">
                        <div className="view_to_display_info_box">
                            <p className="view_to_display_info_box_title">
                                Info
                            </p>
                            <div className="clearfix"/>
                            <div className="view_to_display_info_left_box">
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle property_page_property_type">
                                        {this.convertPropertyTypeToText(this.state.property["property_type"])}
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        {this.state.property["address"]}&nbsp;&nbsp;{this.state.property["city"]}, {this.state.property["state"]} {this.state.property["zip_code"]}
                                    </p>
                                </li>
                            </div>
                            <div className="view_to_display_info_right_box">
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        <b>${numberWithCommas(this.state.property["estimate"])}</b>
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        <b>{this.state.property["num_beds"]}</b> beds &nbsp;<b>{this.state.property["num_baths"]}</b> baths
                                    </p>
                                </li>
                            </div>
                            <div className="clearfix"/>
                        </div>
                    </div>
                );
            case analysis:
                return (
                    <div>

                    </div>
                );
            case expenses:
                return (
                    <div>

                    </div>
                );
            case files:
                return (
                    <div>

                    </div>
                );
            case settings: 
                    return (
                        <div>

                        </div>
                    );
        }
    }

    render() {
        if (this.state.redirectToPropertiesPage) {
            return <Redirect to={{
                pathname: this.state.redirectToPropertiesPage,
                state: {
                    user: this.state.user,
                    // Pass in the profilePicture so we don't have to load it again.
                    profilePicture: this.state.profilePicture
                }
            }} />
        }
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        user: this.state.user,
                        propertyID: this.state.activePropertyID,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        profilePicture: this.state.profilePicture,
                        currentPage: "properties",
                    }
                }}/>
                {this.state.isLoading ? <div></div> : 
                <div>
                    <div className="property_page_property_type_box">
                        <div className="property_page_inner_box">
                            <div id="properties_dashboard_title_box">
                                <p className="properties_dashboard_title_box_title">
                                    Properties
                                </p>
                                <input className="properties_dashboard_search_bar" placeholder="Search...">
                                </input>
                            </div>
                            <div className="clearfix"/>
                            <div className="properties_dashboard_buttons_box">
                                <Link to={{
                                    pathname: "/addproperty",
                                    state: {
                                        user: this.state.user,
                                        totalEstimateWorth: this.state.totalEstimateWorth,
                                        missingEstimate: this.state.missingEstimate,
                                        profilePicture: this.state.profilePicture
                                    }
                                }}>
                                    <div className="properties_dashboard_add_property_button">
                                        New Property
                                    </div>
                                </Link>
                            </div>
                            <div className="clearfix"/>
                            <div className="property_page_redirect_back_box">
                                <div 
                                    onClick={() => {
                                        this.setState({
                                            redirectToPropertiesPage: "/properties",
                                        })
                                    }}
                                    className="property_page_back_to_folders_button">
                                    <IoCaretBackOutline className="property_page_back_to_folders_button_icon"></IoCaretBackOutline>
                                    <p className="property_page_back_to_folders_button_text">Properties</p>
                                </div>
                                <p className="property_page_folder_name_title">{this.state.property["address"]}</p>
                                <p className="property_page_folder_name_subtitle">{this.state.property["state"]},&nbsp;{this.state.property["zip_code"]}</p>
                            </div>
                            <div className="clearfix"/>
                            <div className="property_page_view_box">
                                <div className="property_page_view_box_tabs_box">
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: overview,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === overview ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <MdDashboard  className={
                                            this.state.viewToDisplay === overview ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></MdDashboard >
                                        <p className={
                                            this.state.viewToDisplay === overview ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Overview</p>
                                    </li>
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: analysis,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === analysis ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <SiGoogleanalytics className={
                                            this.state.viewToDisplay === analysis ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></SiGoogleanalytics>
                                        <p className={
                                            this.state.viewToDisplay === analysis ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Analysis</p>
                                    </li>
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: expenses,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === expenses ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <FaMoneyCheck className={
                                            this.state.viewToDisplay === expenses ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></FaMoneyCheck>
                                        <p className={
                                            this.state.viewToDisplay === expenses ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Expenses</p>
                                    </li>
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: files,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === files ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <GoFileDirectory className={
                                            this.state.viewToDisplay === files ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></GoFileDirectory>
                                        <p className={
                                            this.state.viewToDisplay === files ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Files</p>
                                    </li>
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: settings,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === settings ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <IoSettingsSharp className={
                                            this.state.viewToDisplay === settings ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></IoSettingsSharp>
                                        <p className={
                                            this.state.viewToDisplay === settings ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Settings</p>
                                    </li>
                                </div>
                                <div className="clearfix"/>
                                <div className="property_page_view_box_bottom_border">
                                </div>
                                {this.renderViewPage()}
                            </div>
                        </div>
                        
                    </div>
                </div>}
                <NotificationSidebar data={{
                    state: {
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate 
                    }
                }}/>
            </div>
        )
    }
}

export default PropertyPage;