import React from 'react';
import axios from 'axios';

import './CSS/AnalysisDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import BarChart from '../charts/BarChart.js';

import { numberWithCommas, 
        getHistoricalAnalysisData } from '../utility/Util.js';

import { BsFillHouseFill } from 'react-icons/bs';
import { FaCaretDown, FaMapMarkerAlt } from 'react-icons/fa';
import { RiBuildingFill } from 'react-icons/ri';
import { IoMdAddCircle } from 'react-icons/io';
import { IoBedSharp } from 'react-icons/io5';

const general = "general";
const advanced = "advanced";

let URLBuilder = require('url-join');

class AnalysisDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            profilePicture: this.props.location.state.profilePicture,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            propertySelectorElements: [],
            propertyTypeSelectedElements: new Map([
                ["All", true],
                ["Single Family Homes", true],
                ["Manufactured", true],
                ["Condo/Ops", true],
                ["Multi-Family", true],
                ["Apartments", true],
                ["Lots/Land", true],
                ["Townhomes", true],
                ["Commercial", true],
            ]),
            propertyAddressMap: new Map([["All", true]]),
            historicalAnalysis: null,
            displayPropertySelector: false,
            viewToDisplay: general,
            host: window.location.protocol + "//" + window.location.host,
            isLoading: true
        };
        // this.renderPropertiesInSelector = this.renderPropertiesInSelector.bind(this);
    }

    componentDidMount() {

        let userID = this.state.user["id"];
        let host = this.state.host;

        let getSummaryURL = URLBuilder(host, '/api/user/summary', userID);

        const getSummaryRequest = axios.get(getSummaryURL);

        axios.all(
            [getSummaryRequest]
        ).then(axios.spread((...responses) => {
            const summaryRequestResponse = responses[0];
            const summary = summaryRequestResponse.data;

            // summary is an object containing three fields. 
            // 1. properties_summary
            // 2. historical_summary
            // 3. expenses_summary
            let propertiesSummary = summary["properties_summary"];
            let historicalAnalysis = summary["historical_summary"];

            this.setState({
                propertiesSummary: propertiesSummary,
                historicalAnalysis: historicalAnalysis,
                isLoading: false
            }, () => {console.log(this.state.historicalAnalysis)});
        })).catch(errors => {
            console.log(errors);
        });
    }

    // renderPropertyTypesInSelector() {

    //     let propertyTypes = [
    //         'Single Family Homes', 
    //         'Manufactured', 
    //         'Condo/Ops', 
    //         'Multi-Family', 
    //         'Apartments',
    //         'Lots/Land',
    //         'Townhomes',
    //         'Commercial']

    //     let elements = [];
    //     elements.push(
    //         <li key={"property_type_all"}
    //             className="analysis_dashboard_property_selector_property_list">
    //             <div  
    //                 onMouseDown={() => {
    //                     let propertyTypeMap = this.state.propertyTypeSelectedElements;
    //                     let allSelected = propertyTypeMap.get("All");
    //                     propertyTypeMap.set("All", !allSelected)
    //                     if (!allSelected) {
    //                         propertyTypeMap.forEach((key, value, map) => {
    //                             propertyTypeMap.set(value, true);
    //                         })
    //                     } else {
    //                         propertyTypeMap.forEach((key, value, map) => {
    //                             propertyTypeMap.set(value, false);
    //                         })
    //                     }
    //                     this.setState({
    //                         propertyTypeSelectedElements: propertyTypeMap,
    //                     })
    //                 }}
    //                 className={
    //                     this.state.propertyTypeSelectedElements.get("All") ?
    //                     "analysis_dashboard_property_selector_property_list_checkbox analysis_dashboard_property_selector_property_list_checkbox_active" :
    //                     "analysis_dashboard_property_selector_property_list_checkbox"}>

    //             </div>
    //             <p className="analysis_dashboard_property_selector_property_list_text">
    //                 All
    //             </p>
    //         </li>
    //     )

    //     for (let i = 0; i < propertyTypes.length; i++) {
    //         let propertyType = propertyTypes[i];
    //         elements.push(
    //             <li key={propertyType}
    //                 className="analysis_dashboard_property_selector_property_list">
    //                 <div 
    //                     onMouseDown={() => {
    //                         let propertyTypeMap = this.state.propertyTypeSelectedElements;
    //                         propertyTypeMap.set(propertyType, !propertyTypeMap.get(propertyType))
    //                         this.setState({
    //                             propertyTypeSelectedElements: propertyTypeMap,
    //                         })
    //                     }}
    //                     className={
    //                         this.state.propertyTypeSelectedElements.get(propertyType) ?
    //                         "analysis_dashboard_property_selector_property_list_checkbox analysis_dashboard_property_selector_property_list_checkbox_active" :
    //                         "analysis_dashboard_property_selector_property_list_checkbox"}>

    //                 </div>
    //                 <p className="analysis_dashboard_property_selector_property_list_text">
    //                     {propertyType}
    //                 </p>
    //             </li>
    //         )
    //     }
    //     return elements;
    // }

    // renderPropertiesInSelector(properties) {
        
    //     let elements = [];
    //     elements.push(
    //         <div key={"property_address_all"}>
    //             <div  
    //                 onMouseDown={() => {
    //                     let propertyAddressMap = this.state.propertyAddressMap;
    //                     let allSelected = propertyAddressMap.get("All");
    //                     propertyAddressMap.set("All", !allSelected)
    //                     if (!allSelected) {
    //                         propertyAddressMap.forEach((key, value, map) => {
    //                             propertyAddressMap.set(value, true);
    //                         })
    //                     } else {
    //                         propertyAddressMap.forEach((key, value, map) => {
    //                             propertyAddressMap.set(value, false);
    //                         })
    //                     }
    //                     this.setState({
    //                         propertyAddressMap: propertyAddressMap,
    //                     })
    //                 }}
    //                 className={
    //                     this.state.propertyAddressMap.get("All") ?
    //                     "analysis_dashboard_property_selector_property_list_checkbox analysis_dashboard_property_selector_property_list_checkbox_active" :
    //                     "analysis_dashboard_property_selector_property_list_checkbox"}>

    //             </div>
    //             <p className="analysis_dashboard_property_selector_property_list_text">
    //                 All
    //             </p>
    //             <div className="clearfix"/>
    //         </div>  
    //     );

    //     properties.forEach((value, keyValue, map) => {
    //         let address = value[1];
    //         elements.push(
    //             <div key={address}>
    //                 <div
    //                     onMouseDown={() => {
    //                         let propertyAddressMapElems = this.state.propertyAddressMap;
    //                         propertyAddressMapElems.set(address, !propertyAddressMapElems.get(address));
    //                         this.setState({
    //                             propertyAddressMap: propertyAddressMapElems,
    //                         })
    //                     }}
    //                     className={
    //                         this.state.propertyAddressMap.get(address) ?
    //                         "analysis_dashboard_property_selector_property_list_checkbox analysis_dashboard_property_selector_property_list_checkbox_active" :
    //                         "analysis_dashboard_property_selector_property_list_checkbox"}>

    //                 </div>
    //                 <p className="analysis_dashboard_property_selector_property_list_text">
    //                     {address}
    //                 </p>
    //                 <div className="clearfix"/>
    //             </div>  
    //         )
    //     });
        
    //     let firstHalf = elements.slice(0, elements.length/2 + 1);
    //     let secondHalf = elements.slice(elements.length/2 + 1, elements.length);

    //     // Split the properties and display them side by side.
    //     return (
    //         <div>
    //             <div className="property_selector_left_box">
    //                 {firstHalf}
    //             </div>
    //             <div className="property_selector_right_box">
    //                 {secondHalf}
    //             </div>
    //         </div>
    //     );
    // }

    renderViewBox() {
        let barChartData = getHistoricalAnalysisData(this.state.historicalAnalysis);

        switch(this.state.viewToDisplay) {
        case general:
            return (
                <div>
                    <div className="analysis_dashboard_inner_box_top_cards_box">
                        <div className="analysis_dashboard_inner_box_top_cards_box_element">
                            <BsFillHouseFill className="analysis_dashboard_inner_box_top_cards_box_element_icon"/>
                            <IoMdAddCircle className="analysis_dashboard_inner_box_top_cards_box_element_add_icon"/>
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
                            <IoMdAddCircle className="analysis_dashboard_inner_box_top_cards_box_element_add_icon"/>
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
                            <IoMdAddCircle className="analysis_dashboard_inner_box_top_cards_box_element_add_icon"/>
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
                            <IoMdAddCircle className="analysis_dashboard_inner_box_top_cards_box_element_add_icon"/>
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
                                <IoMdAddCircle className="analysis_dashboard_inner_box_middle_box_element_add_icon"/>
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
                                <IoMdAddCircle className="analysis_dashboard_inner_box_middle_box_element_add_icon"/>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_title">
                                    ${numberWithCommas(this.state.propertiesSummary["total_property_manager_fee"])}
                                </p>
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_subtitle">
                                    in expenses this month
                                </p>
                            </div>
                            <div className="analysis_dashboard_inner_box_middle_cards_right_element_box">
                                <p className="analysis_dashboard_inner_box_middle_cards_right_element_box_header_title">
                                    Loan Payback
                                </p>
                                <IoMdAddCircle className="analysis_dashboard_inner_box_middle_box_element_add_icon"/>
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
                            <IoMdAddCircle className="analysis_dashboard_advanced_inner_box_top_cards_box_element_add_icon"/>
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
                            <IoMdAddCircle className="analysis_dashboard_advanced_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_text">
                                    {Number(this.state.propertiesSummary["average_ltv"].toFixed(2))} %
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_subtitle">
                                    average LTV ratio
                                </p>
                            </div>
                        </div>
                        <div className="analysis_dashboard_advanced_inner_box_top_cards_box_element">
                            <IoMdAddCircle className="analysis_dashboard_advanced_inner_box_top_cards_box_element_add_icon"/>
                            <div className="analysis_dashboard_inner_box_top_cards_box_element_text_box"> 
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_text">
                                    {Number(this.state.propertiesSummary["average_dti"].toFixed(2))} %
                                </p>
                                <div className="clearfix"/>
                                <p className="analysis_dashboard_advanced_inner_box_top_cards_box_element_subtitle">
                                    average DTI ratio
                                </p>
                            </div>
                        </div>
                        <div className="analysis_dashboard_advanced_inner_box_top_cards_box_element">
                            <IoMdAddCircle className="analysis_dashboard_advanced_inner_box_top_cards_box_element_add_icon"/>
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
                <div id="analysis_dashboard_parent_box">
                    <div id="analysis_dashboard_parent_inner_box">
                        <div className="analysis_dashboard_parent_inner_box_title">
                            <p className="analysis_dashboard_parent_inner_box_title_text">
                                Analysis
                            </p>
                        </div>
                        {this.state.isLoading ? <div></div> : 
                        <div>
                            <div className="clearfix"/>
                            {/* <div 
                                onMouseDown={() => this.setState({
                                    displayPropertySelector: !this.state.displayPropertySelector,
                                })}
                                className={this.state.displayPropertySelector ? 
                                    "analysis_dashboard_inner_box_property_selector_box analysis_dashboard_inner_box_property_selector_box_active":
                                    "analysis_dashboard_inner_box_property_selector_box"}>
                                <p className="analysis_dashboard_inner_box_property_selector_title">
                                    Property Selector
                                </p>
                                <FaCaretDown className={
                                    this.state.displayPropertySelector ? 
                                    "analysis_dashboard_inner_box_property_selector_icon analysis_dashboard_inner_box_property_selector_icon_active" :
                                    "analysis_dashboard_inner_box_property_selector_icon"}></FaCaretDown>
                            </div> */}
                            <div className="analysis_dashboard_view_selection_box">
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
                            </div>
                            <div className="clearfix"/>
                            {this.state.displayPropertySelector ? 
                                <div className="analysis_dashboard_property_selector_display_box">
                                    <div className="analysis_dashboard_property_selector_display_left_box">
                                        <p className="analysis_dashboard_property_selector_display_left_box_title">
                                            Filter by Property Types
                                        </p>
                                        <div className="clearfix"/>
                                        {this.renderPropertyTypesInSelector()}
                                    </div>
                                    <div className="analysis_dashboard_property_selector_display_right_box">
                                        <p className="analysis_dashboard_property_selector_display_left_box_title">
                                            Filter by Individual Property
                                        </p>
                                        <div className="property_selector_apply_button">
                                            Apply
                                        </div>
                                        <div className="clearfix"/>
                                        {this.renderPropertiesInSelector(this.state.properties)}
                                    </div>
                                </div> :
                                <div></div>
                            }
                            <div className="clearfix"/>
                            <div className="analysis_dashboard_inner_box">
                                {this.renderViewBox()}
                                <div className="clearfix"/>
                                <div className="analysis_dashboard_inner_box_ratios_box">
                                </div>
                            </div>
                        </div>}
                    </div>
                </div>
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

export default AnalysisDashboard;