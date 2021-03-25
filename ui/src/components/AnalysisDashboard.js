import React from 'react';
import axios from 'axios';
import { Redirect, Link } from "react-router-dom";

import './CSS/AnalysisDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import BarChart from '../charts/BarChart.js';

import { numberWithCommas, 
        getHistoricalAnalysisData } from '../utility/Util.js';

import { IoSettingsSharp, IoEllipsisHorizontal } from 'react-icons/io5';
import { AiFillQuestionCircle } from 'react-icons/ai';
import { BsFillHouseFill } from 'react-icons/bs';
import { FaCaretDown, FaMapMarkerAlt } from 'react-icons/fa';
import { RiBuildingFill } from 'react-icons/ri';
import { IoBedSharp, IoClose } from 'react-icons/io5';
import { MdAdd } from 'react-icons/md';
import { MdArrowDropDown } from 'react-icons/md';
import { BiDollar } from 'react-icons/bi';

const general = "general";
const advanced = "advanced";

const monthly = "Monthly";
const annually = "Annually";

let URLBuilder = require('url-join');

class AnalysisDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        let user;
        let redirect;

        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            user = JSON.parse(loggedInUser);
            redirect = null;
        } else {
            user = null;
            redirect = "/";
        }

        this.state = {
            user: user,
            profilePicture: this.props.location.state.profilePicture,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            propertyAddressMap: new Map([["All", true]]),
            historicalAnalysis: null,
            displayPropertySelector: false,
            viewToDisplay: general,
            host: window.location.protocol + "//" + window.location.host,
            activePropertySearchBar: false,
            activeSelectProperties: new Map(),
            rentTimeCycle: monthly,
            redirect: redirect,
            isLoading: true
        };
        // this.renderPropertiesInSelector = this.renderPropertiesInSelector.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);

        this.renderPropertiesList = this.renderPropertiesList.bind(this);
        this.addSelectProperty = this.addSelectProperty.bind(this);
        this.handleSelectPropertyBar = this.handleSelectPropertyBar.bind(this);
        this.renderPropertySearchBarElements = this.renderPropertySearchBarElements.bind(this);
        this.renderSelectedProperties = this.renderSelectedProperties.bind(this);
        this.removeSelectedProperty = this.removeSelectedProperty.bind(this);
        this.getSummary = this.getSummary.bind(this);

        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside(event) {
        if (event.target.name !== "select_property_search_bar" && event.target.className !== "property_search_bar_element_text") {
            this.setState({
                activePropertySearchBar: false,
            });
        }
    }

    componentDidMount() {
        console.log(this.state.totalEstimateWorth);

        document.addEventListener('mousedown', this.handleClickOutside);

        let userID = this.state.user["id"];
        let host = this.state.host;

        let getSummaryURL = URLBuilder(host, '/api/user/summary', userID);
        let getPropertiesAddressesURL = URLBuilder(host, '/api/user/property', userID, '?addresses=true');

        const getSummaryRequest = axios.get(getSummaryURL);
        const getPropertiesAddressesRequest = axios.get(getPropertiesAddressesURL)

        axios.all(
            [getSummaryRequest, getPropertiesAddressesRequest]
        ).then(axios.spread((...responses) => {
            const summaryRequestResponse = responses[0];
            const summary = summaryRequestResponse.data;

            // summary is an object containing three fields. 
            // 1. properties_summary
            // 2. historical_summary
            // 3. expenses_summary
            let propertiesSummary = summary["properties_summary"];
            let historicalAnalysis = summary["historical_summary"];
            let expensesSummary = summary["expenses_summary"];

            /* Handle our properties */
            const propertiesAddressesRequestResponse = responses[1];
            const propertiesAddresses = propertiesAddressesRequestResponse.data;
            let propertiesMap = new Map();
            for (let i = 0; i < propertiesAddresses.length; i++) {
                let property = propertiesAddresses[i];
                propertiesMap.set(property["address_one"], property["id"]);
            }

            this.setState({
                propertiesSummary: propertiesSummary,
                expensesSummary: expensesSummary,
                historicalAnalysis: historicalAnalysis,
                propertiesMap: propertiesMap,
                propertySearchBarProperties: propertiesMap,
                isLoading: false
            });
        })).catch(errors => {
            console.log(errors);
        });
    }

    renderPropertiesList() {
        let propertySearchBarProperties = this.state.propertySearchBarProperties;
        let activeSelectProperties = this.state.activeSelectProperties;
        let newPropertySearchBarProperties = new Map();
        propertySearchBarProperties.forEach((value, key, map) => {
            if (!activeSelectProperties.has(key)) {
                newPropertySearchBarProperties.set(key, value);
            }
        })
        this.setState({
            propertySearchBarProperties: newPropertySearchBarProperties,
        });
        if  (newPropertySearchBarProperties.size > 0) {
            this.setState({
                activePropertySearchBar: true,
            })
        }
    }

    // handleSelectPropertyBar is called when there is onChange for the search bar. It will update
    // which properties to display according to the search.
    handleSelectPropertyBar(e) {
        // replace will strip out empty spaces
        let searchValue = e.target.value.toLowerCase().replace(/\s/g, "");
        if (searchValue === "") {
            this.setState({
                propertySearchBarProperties: this.state.propertiesMap,
            });
            return;
        }
        let propertySearchBarProperties = this.state.propertySearchBarProperties;

        let newPropertySearchBarProperties = new Map();
        // Our key is our address, and value is property id
        propertySearchBarProperties.forEach((value, key, map) => {
            if (key.toLowerCase().startsWith(searchValue)) {
                newPropertySearchBarProperties.set(key, value);
            }
        });
        this.setState({
            propertySearchBarProperties: newPropertySearchBarProperties,
        });
    }

    // addSelectProperty is responsible for adding a property to the active selected properties,
    // which will display the property as a card, which can be closed out. It will also make a call
    // to re-render our analysis dash with the new addition.
    addSelectProperty(key, value) {
        let activeSelectProperties = this.state.activeSelectProperties;
        activeSelectProperties.set(key, value);
        // Update our analysis
        this.getSummary(activeSelectProperties);
        this.setState({
            activeSelectProperties: activeSelectProperties,
            activePropertySearchBar: false,
        });
    }

    // removeSelectedProperty is responsible for "closing"/"removing" a selected property from the list.
    // It will also make a call to re-render our analysis dash with our property removed.
    removeSelectedProperty(key) {
        let activeSelectProperties = this.state.activeSelectProperties;
        activeSelectProperties.delete(key);
        // Update our analysis
        this.getSummary(activeSelectProperties);
        this.setState({
            activeSelectProperties: activeSelectProperties,
        });
    }

    getSummary(activeSelectProperties) {

        let userID = this.state.user["id"];
        let host = this.state.host;

        let summaryURL = URLBuilder(host, '/api/user/summary', userID);
        
        let data = new FormData();
        
        let propertyIDs = [];

        activeSelectProperties.forEach((value, key, map) => {
            propertyIDs.push(value);    
        })

        let summaryRequest;
        // If we have propertyIDs, use a post, otherwise just the normal get.
        if (propertyIDs.length > 0){
            // We use this to allow users to select which properties to compare against. Because there may potentially be many properties,
	        // we use a post. GET requests have limits on how large they can be, so we need to use POST's body.
            data.append('properties', propertyIDs);
            summaryRequest = axios.post(summaryURL, data);
        } else {
            summaryRequest = axios.get(summaryURL);
        }

        axios.all(
            [summaryRequest]
        ).then(axios.spread((...responses) => {
            const summaryRequestResponse = responses[0];
            const summary = summaryRequestResponse.data;

            // summary is an object containing three fields. 
            // 1. properties_summary
            // 2. historical_summary
            // 3. expenses_summary
            let propertiesSummary = summary["properties_summary"];
            let historicalAnalysis = summary["historical_summary"];
            let expensesSummary = summary["expenses_summary"];

            this.setState({
                propertiesSummary: propertiesSummary,
                expensesSummary: expensesSummary,
                historicalAnalysis: historicalAnalysis,
            });
        })).catch(errors => {
            console.log(errors);
        });

    }

    renderSelectedProperties() {
        let activeSelectProperties = this.state.activeSelectProperties;
        let elements = [];
        activeSelectProperties.forEach((value, key, map) => {
            elements.push(
                <div style={{
                    backgroundColor: "#32384D",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                    float: "left",
                    marginRight: "15px",
                    paddingBottom: "10px",
                    paddingLeft: "15px",
                    paddingRight: "15px",
                    paddingTop: "10px",
                }}>
                    <p style={{
                        color: "white",
                        float: "left",
                        fontWeight: "bold",
                    }}>
                        {key}
                    </p>
                    <IoClose 
                        onMouseDown={() => {
                            this.removeSelectedProperty(key)
                        }}
                        style={{
                            color: "white",
                            cursor: "pointer",
                            float: "right",
                            height: "20px",
                            marginLeft: "15px",
                            width: "20px",
                        }}/>
                </div>
            );
        })
        return (
            <div style={{
                float: "left",
                marginBottom: "10px",
                marginTop: "10px",
                width: "100%",
            }}>
                {elements}
            </div>
        );
    }

    renderPropertySearchBarElements() {
        let propertySearchBarProperties = this.state.propertySearchBarProperties;
        let elements = [];
        let counter = 0;
        propertySearchBarProperties.forEach((value, key, map) => {
            if (counter++ >= 5){
                return elements;
            }
            elements.push(
                <div 
                    className="property_search_bar_element"
                    onClick={() => this.addSelectProperty(key, value)}
                    style={{
                        cursor: "pointer",
                        height: "40px",
                        lineHeight: "40px",
                        width: "100%",
                    }}>
                    <p 
                        className="property_search_bar_element_text"
                        style={{
                            name:"a",
                            fontSize: "1.0em",
                            paddingLeft: "20px",
                            width: "100%",
                        }}>
                        {key}
                    </p>
                </div>
            );
        });
        return elements;
    }

    renderViewBox() {
        let barChartData = getHistoricalAnalysisData(this.state.historicalAnalysis);

        switch(this.state.viewToDisplay) {
        case general:
            return (
                <div>
                    <div className="analysis_dashboard_inner_box_top_cards_box">
                        <div className="analysis_dashboard_inner_box_top_cards_box_element">
                            <BsFillHouseFill className="analysis_dashboard_inner_box_top_cards_box_element_icon"/>
                            <AiFillQuestionCircle className="analysis_dashboard_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_inner_box_top_cards_box_element_text">
                                    {this.state.propertiesSummary["total_properties"]} total
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_inner_box_top_cards_box_element_subtitle">
                                    properties
                                </p>
                            </div>
                        </div>
                        <div className="analysis_dashboard_inner_box_top_cards_box_element">
                            <RiBuildingFill className="analysis_dashboard_inner_box_top_cards_box_element_icon"/>
                            <AiFillQuestionCircle className="analysis_dashboard_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_inner_box_top_cards_box_element_text">
                                    {this.state.propertiesSummary["total_properties"]} total
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_inner_box_top_cards_box_element_subtitle">
                                    units
                                </p>
                            </div>
                        </div>
                        <div className="analysis_dashboard_inner_box_top_cards_box_element">
                            <FaMapMarkerAlt className="analysis_dashboard_inner_box_top_cards_box_element_icon"/>
                            <AiFillQuestionCircle className="analysis_dashboard_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_inner_box_top_cards_box_element_text">
                                    {numberWithCommas(this.state.propertiesSummary["total_square_footage"])} total
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_inner_box_top_cards_box_element_subtitle">
                                    square feet
                                </p>
                            </div>
                        </div>
                        <div className="analysis_dashboard_inner_box_top_cards_box_element">
                            <IoBedSharp className="analysis_dashboard_inner_box_top_cards_box_element_icon"/>
                            <AiFillQuestionCircle className="analysis_dashboard_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_inner_box_top_cards_box_element_text">
                                    {numberWithCommas(this.state.propertiesSummary["total_bedrooms"])} total beds
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_inner_box_top_cards_box_element_subtitle">
                                {(this.state.propertiesSummary["total_bathrooms"])} total baths
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="analysis_dashboard_inner_box_middle_cards_box">
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "10px",
                            boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                            float: "left",
                            height: "435px",
                            width: "calc((3 * (100% - 75px) / 4) + 50px)",
                            zIndex: "20",
                        }}>
                            <p style={{
                                marginLeft: "30px",
                                marginTop: "25px",
                            }}
                            className="analysis_chart_title">
                                Property Values
                            </p>
                            <BarChart 
                                height={"350"}
                                width={"calc(100% - 70px)"}
                                yAxisFontSize={"0.8em"}
                                xAxisFontSize={"0.8em"}
                                xAxisColor={"grey"}
                                yAxisColor={"grey"}
                                barColor={"#296CF6"}
                                marginLeft={"30px"}
                                capitalizeXAxis={true}
                                displayTooltip={true}
                                data={barChartData}/>
                        </div>
                        <div className="analysis_dashboard_inner_box_middle_cards_right">
                            <div className="analysis_dashboard_inner_box_middle_cards_right_element_box">
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_header_title">
                                    Rental Income
                                </p>
                                <AiFillQuestionCircle className="analysis_dashboard_inner_box_middle_box_element_add_icon"/>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_title">
                                    ${numberWithCommas(this.state.propertiesSummary["total_rent"])}
                                </p>
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_subtitle">
                                    total rent / month
                                </p>
                            </div>
                            <div className="analysis_dashboard_inner_box_middle_cards_right_element_box">
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_header_title">
                                    Expenses
                                </p>
                                <AiFillQuestionCircle className="analysis_dashboard_inner_box_middle_box_element_add_icon"/>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_title">
                                    $0
                                </p>
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_subtitle">
                                    in expenses this month
                                </p>
                            </div>
                            <div className="analysis_dashboard_inner_box_middle_cards_right_element_box">
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_header_title">
                                    Loan Payback
                                </p>
                                <AiFillQuestionCircle className="analysis_dashboard_inner_box_middle_box_element_add_icon"/>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_title">
                                    ${numberWithCommas(this.state.propertiesSummary["total_mortgage_payment"])}
                                </p>
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_subtitle">
                                    due this month
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case advanced:
            return (
                <div>

                    <div className="analysis_dashboard_advanced_inner_box_top_cards_box">
                        <div className="analysis_dashboard_advanced_inner_box_top_cards_box_element">
                            <AiFillQuestionCircle className="analysis_dashboard_advanced_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_text">
                                    ${numberWithCommas(this.state.propertiesSummary["total_estimate_worth"])}
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_subtitle">
                                    total estimated value
                                </p>
                            </div>
                        </div>
                        <div className="analysis_dashboard_advanced_inner_box_top_cards_box_element">
                            <AiFillQuestionCircle className="analysis_dashboard_advanced_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_text">
                                    { 
                                        this.state.propertiesSummary["average_ltv"] ?
                                        Number(this.state.propertiesSummary["average_ltv"].toFixed(2)) :
                                        0.0} %
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_subtitle">
                                    average LTV ratio
                                </p>
                            </div>
                        </div>
                        <div className="analysis_dashboard_advanced_inner_box_top_cards_box_element">
                            <AiFillQuestionCircle className="analysis_dashboard_advanced_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_text">
                                    {
                                        this.state.propertiesSummary["average_dti"] ?
                                        Number(this.state.propertiesSummary["average_dti"].toFixed(2)) :
                                        0.0} %
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_subtitle">
                                    average DTI ratio
                                </p>
                            </div>
                        </div>
                        <div className="analysis_dashboard_advanced_inner_box_top_cards_box_element">
                            <AiFillQuestionCircle className="analysis_dashboard_advanced_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_text">
                                    {numberWithCommas(this.state.propertiesSummary["total_bedrooms"])} total beds
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_subtitle">
                                {(this.state.propertiesSummary["total_bathrooms"])} total baths
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="clearfix"/>
                    <div className="analysis_dashboard_advanced_inner_box_middle_box">
                        <div className="analysis_dashboard_advanced_inner_box_middle_box_left_box">
                        </div>
                        <div className="analysis_dashboard_advanced_inner_box_middle_box_right_box">
                        </div>
                    </div>
                </div>
            );
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
                <DashboardSidebar data={{
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        profilePicture: this.state.profilePicture,
                        currentPage: "analysis"
                    }
                }}/>
                <div>
                    {this.state.isLoading ? 
                    <div style={{
                        backgroundColor: "#f5f5fa",
                        float: "left",
                        height: "100vh",
                        width: "100%",
                    }}></div> : 
                    <div style={{
                        backgroundColor: "#F5F5FA",
                        float: "left",
                        marginLeft: "250px",
                        width: "calc(100% - 250px - 375px)",
                    }}>
                        <div className="page-white-background">
                            <div style={{
                                float: "left",
                                paddingBottom: "10px",
                                paddingTop: "10px",
                                width: "100%",
                            }}>
                                <input 
                                    name="select_property_search_bar"
                                    onMouseDown={this.renderPropertiesList}
                                    onChange={this.handleSelectPropertyBar}
                                    placeholder="Select Property..."
                                    className="generic_search_bar search_bar">
                                </input>
                                <p style={{
                                    float: "left",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.1em",
                                    lineHeight: "40px",
                                    width: "200px",
                                }}>
                                    ANALYSIS
                                </p>
                            </div>
                            <div className="clearfix"/>
                            <div className="page-title-bar-divider"></div>
                            <div style={{
                                float: "left",
                                height: "calc(100vh - 50px - 50px)",
                                marginLeft: "40px",
                                marginRight: "40px",
                                marginTop: "25px",
                                width: "calc(100% - 80px)",
                            }}>
                                <div style={{
                                    backgroundColor: "#E9EDF6",
                                    borderRadius: "8px",
                                    float: "left",
                                    height: "175px",
                                    padding: "15px",
                                    width: "calc(50% - 20px)",
                                }}>
                                    <div 
                                        className="opacity"
                                        style={{
                                            backgroundColor: "#f9fafc",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            float: "left",
                                            marginBottom: "15px",
                                            padding: "6.5px 10px 6.5px 12.5px",
                                        }}>
                                        <p style={{
                                            color: "#296cf6",
                                            float: "left",
                                            fontSize: "0.9em",
                                        }}>
                                            {this.state.rentTimeCycle}
                                        </p>
                                        <MdArrowDropDown style={{
                                            color: "#296cf6",
                                            float: "left",
                                        }}/>
                                    </div>
                                    <IoEllipsisHorizontal style={{
                                        color: "#296cf6",
                                        float: "right",
                                        height: "25px",
                                        marginRight: "25px",
                                        marginTop: "7.5px",
                                    }}/>
                                    <div className="clearfix"/>
                                    <div style={{
                                        backgroundColor: "#d3d3d3",
                                        height: "1px",
                                        width: "100%",
                                    }}></div>
                                    <div style={{
                                        marginTop: "25px",
                                        textAlign: "center",
                                    }}>
                                        <div>
                                            <BiDollar style={{
                                                // backgroundColor: "black",
                                                display: "inline-block",
                                                height: "40px",
                                                width: "20px",
                                            }}/>
                                            <p style={{
                                                display: "inline-block",
                                                fontSize: "2.8em",
                                                textAlign: "center",
                                            }}>
                                                {this.state.propertiesSummary["total_rent"] ? numberWithCommas(this.state.propertiesSummary["total_rent"]) : "-"}
                                            </p>
                                        </div>
                                        <p style={{
                                            fontSize: "0.9em",
                                            marginTop: "10px",
                                            textAlign: "center",
                                        }}>
                                            {this.state.rentTimeCycle === monthly ? "/mo." : "/yr"} {"total income"}
                                        </p>
                                    </div>
                                </div>
                                <div style={{
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    float: "right",
                                    height: "175px",
                                    width: "calc(50% - 20px)",
                                }}></div>
                                <div style={{
                                    float: "left",
                                    marginTop: "40px",
                                    width: "100%",
                                }}>
                                    <BarChart 
                                        height={"400"}
                                        width={"calc(100%)"}
                                        yAxisFontSize={"0.8em"}
                                        xAxisFontSize={"0.8em"}
                                        xAxisColor={"grey"}
                                        yAxisColor={"grey"}
                                        barColor={"#296CF6"}
                                        capitalizeXAxis={true}
                                        displayTooltip={true}
                                        data={getHistoricalAnalysisData(this.state.historicalAnalysis)}/>
                                </div>
                            </div>
                            <div style={{
                                marginTop: "25px",
                            }}>
                                {this.state.activePropertySearchBar ? 
                                <div style={{
                                    backgroundColor: "white",
                                    borderRadius: "0px 0px 20px 20px",
                                    borderTop: "1px solid #d3d3d3",
                                    boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                    paddingBottom: "15px",
                                    position: "absolute",
                                    width: "385px",
                                    zIndex: "25",
                                }}>
                                    <div>
                                        {this.renderPropertySearchBarElements()}
                                    </div>
                                </div>:
                                <div></div>}
                                {/* <div className="analysis_dashboard_view_selection_box">
                                    <div
                                        onClick={() => this.setState({
                                            viewToDisplay: general
                                        })}
                                        className={
                                            this.state.viewToDisplay === general ? 
                                            "analysis_dashboard_view_selection_box_element analysis_dashboard_view_selection_box_element_active" :
                                            "analysis_dashboard_view_selection_box_element"}>
                                        General
                                    </div>
                                    <div
                                        onClick={() => this.setState({
                                            viewToDisplay: advanced
                                        })} 
                                        className={
                                            this.state.viewToDisplay === advanced ? 
                                            "analysis_dashboard_view_selection_box_element analysis_dashboard_view_selection_box_element_active" :
                                            "analysis_dashboard_view_selection_box_element"}>
                                        Advanced
                                    </div>
                                </div> */}
                            </div>
                            <div className="clearfix"/>
                            <div>
                                {this.renderSelectedProperties()}
                            </div>
                            <div className="clearfix"/>
                            <div className="analysis_dashboard_inner_box">
                                {this.renderViewBox()}
                                <div className="clearfix"/>
                                <div className="analysis_dashboard_inner_box_ratios_box">
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
                <NotificationSidebar data={{
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate 
                    }
                }}/>
            </div>
        )
    }
}

export default AnalysisDashboard;