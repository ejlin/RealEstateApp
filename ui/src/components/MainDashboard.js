import React, { useEffect } from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/MainDashboard.css';
import './CSS/Style.css';

import 'react-circular-progressbar/dist/styles.css';

import MouseTooltip from 'react-sticky-mouse-tooltip';

import { capitalizeName, 
        numberWithCommas, 
        getHistoricalAnalysisData } from '../utility/Util.js';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import BarChart from '../charts/BarChart.js';

import { AiTwotonePushpin, AiFillQuestionCircle } from 'react-icons/ai';
import { FaDollarSign } from 'react-icons/fa';
import { RiPercentFill } from 'react-icons/ri';
import { BsFillHouseFill } from 'react-icons/bs';
import { ImArrowUp2, ImArrowDown2 } from 'react-icons/im';
import { IoIosWarning } from 'react-icons/io';

import 'chart.js'

export const getDaysInMonth = (month, year) => {
    return new Date(year, month+1, 0).getDate();
}

export const getDaysUntil = (rentDay) => {
    let today = new Date();
    let date = today.getDate();
    let year = today.getFullYear();
    let month = today.getMonth();

    let numDaysInMonth = getDaysInMonth(month, year);

    let daysUntilEndOfMonth = numDaysInMonth - date;
    return rentDay < date ? daysUntilEndOfMonth + rentDay : rentDay- date;
}

let URLBuilder = require('url-join');

class MainDashboard extends React.Component {
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
            vacantProperties: 0,
            yearAgoTotalEstimateWorth: 0.0,
            properties: [],
            profilePicture: this.props.location.state.profilePicture,
            host: window.location.protocol + "//" + window.location.host,
            yoyGrowthToggleIsYear: true,
            mouseActiveTooltipText: null,
            redirect: redirect,
            isLoading: true,
        };

        this.getDate = this.getDate.bind(this);
        this.estimateLostRent = this.estimateLostRent.bind(this);
        this.ltvToText = this.ltvToText.bind(this);
        this.dtiToText = this.dtiToText.bind(this);
    }

    componentDidMount() {

        let userID = this.state.user["id"];
        let host = this.state.host;

        let getSummaryURL = URLBuilder(host, '/api/user/summary', userID);
        let getProfilePictureURL = URLBuilder(host, '/api/user/settings/profile/picture', userID);

        const getSummaryRequest = axios.get(getSummaryURL);
        const getProfilePictureRequest = axios.get(getProfilePictureURL);

        axios.all(
            [getSummaryRequest, getProfilePictureRequest]
        ).then(axios.spread((...responses) => {
            const summaryRequestResponse = responses[0];
            const summary = summaryRequestResponse.data;

            // summary is an object containing three fields. 
            // 1. properties_summary
            // 2. historical_summary
            // 3. expenses_summary
            let propertiesSummary = summary["properties_summary"];
            let expensesSummary = summary["expenses_summary"];
            let historicalAnalysis = summary["historical_summary"];

            /* Handle our profile picture response */
            let profilePictureRequestResponse = responses[1];
            let profilePicture = profilePictureRequestResponse.data;

            this.setState({
                propertiesSummary: propertiesSummary,
                expensesSummary: expensesSummary,
                historicalAnalysis: historicalAnalysis,
                profilePicture: profilePicture,
                totalEstimateWorth: propertiesSummary["total_estimate_worth"],
                totalNetWorth: numberWithCommas(propertiesSummary["total_net_worth"]),
                totalRent: numberWithCommas(propertiesSummary["total_rent"]),
                totalCost: propertiesSummary["total_cost"] ? numberWithCommas(Number(propertiesSummary["total_cost"].toFixed(2))) : 0.0,
                annualRateOfReturn: propertiesSummary["annual_rate_of_return"] ? Number(propertiesSummary["annual_rate_of_return"].toFixed(3)) : 0.0,
                totalProperties: numberWithCommas(propertiesSummary["total_properties"]),
                averageLTV: propertiesSummary["average_ltv"] ? Number(propertiesSummary["average_ltv"].toFixed(2)) : 0.0,
                averageDTI: propertiesSummary["average_dti"] ? Number(propertiesSummary["average_dti"].toFixed(2)) : 0.0,
                missingEstimate: propertiesSummary["missing_estimate"],
                totalCurrentlyRented: propertiesSummary["total_currently_rented"],
                rentPaymentDateMap: propertiesSummary["rent_payment_date_map"],
                mortgagePaymentDateMap: propertiesSummary["mortgage_payment_date_map"],
                totalExpenses: expensesSummary["total_expenses"],
                isLoading: false
            }, () => {console.log(this.state.historicalAnalysis)});

            localStorage.setItem('total_estimate_worth', JSON.stringify(this.state.totalEstimateWorth));

        })).catch(errors => {
            console.log(errors);
            this.setState({
                isLoading: false,
            })
        });
    }

    // useEffect(() => {
    //     const loggedInUser = localStorage.getItem("user");
    //     if (loggedInUser) {
    //       const foundUser = JSON.parse(loggedInUser);
    //       setUser(foundUser);
    //     }
    //   }, []);

    getDate() {
        let monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = today.getMonth();
        let yyyy = today.getFullYear();

        return monthArr[mm] + ' ' + dd + ', ' + yyyy;
    }

    estimateLostRent(properties) {
        // look at historical rent prices.
        return 0;
    }

    ltvToText(ltv) {
        if (ltv >= 90.0) {
            return "Caution: Extremely High LTV";
        } else if (ltv >= 80.0){
            return "Warning: Fairly high LTV";
        } else if (ltv >= 70.0) {
            return "Good: Nearing fairly high LTV";
        } else if (ltv >= 40.0) {
            return "Great LTV";
        }
        return "Excellent LTV"
    }

    dtiToText(dti) {
        if (dti >= 43.0) {
            return "Caution: Extremely High DTI";
        } else if (dti >= 36.0){
            return "Warning: Fairly high DTI";
        } else if (dti >= 28.0) {
            return "Good: Nearing fairly high DTI";
        } 
        return "Great DTI";
    }        

    renderRentCollected() {
        return (
            <div className="main_dashboard_bottom_left_box_bottom_inner_box_text_box">
                <p className="main_dashboard_bottom_left_box_bottom_inner_box_text_box_title_two">
                    ${ this.state.rentCollected ? this.state.rentCollected : 0}
                </p>
                <div className="clearfix"/>
                <p className="main_dashboard_bottom_left_box_bottom_inner_box_text_box_subtitle_two">
                    total rent collected this month!
                </p>
            </div>  
        )
    }

    renderAdditionalExpensesCollected() {
        return (
            <div className="main_dashboard_bottom_left_box_bottom_inner_box_text_box">
                <p className="main_dashboard_bottom_left_box_bottom_inner_box_text_box_title_two">
                    ${this.state.totalExpenses ? numberWithCommas(this.state.totalExpenses) : 0}
                </p>
                <div className="clearfix"/>
                <p className="main_dashboard_bottom_left_box_bottom_inner_box_text_box_subtitle_two">
                    expenses this month
                </p>
            </div>  
        )
    }

    renderMortgagePaymentDateMap(expandedView) {
        let mortgagePaymentDateMap = this.state.mortgagePaymentDateMap;
        let timeline = [];

        if (!mortgagePaymentDateMap || mortgagePaymentDateMap === undefined) {
            return timeline;
        }
        for (const [key, value] of Object.entries(mortgagePaymentDateMap)) {
            let iKey = parseInt(key);
            let daysUntil = getDaysUntil(iKey);
            timeline.push(
                <div className="main_dashboard_bottom_left_box_bottom_inner_box_text_box">
                    {daysUntil === 0 ? 
                    <div>
                        <IoIosWarning 
                            className="main_dashboard_bottom_left_box_bottom_inner_box_text_box_icon"
                        ></IoIosWarning>
                        <p className="main_dashboard_bottom_left_box_bottom_inner_box_text_box_subtitle">
                            You have mortgage(s)/ loan(s) due today
                        </p>
                    </div> :
                    <div>
                        <p className="main_dashboard_bottom_left_box_bottom_inner_box_text_box_title_two">
                            {daysUntil < 10 ? "0" : ""}{daysUntil}
                        </p>
                        <div className="clearfix"/>
                        <p className="main_dashboard_bottom_left_box_bottom_inner_box_text_box_subtitle_two">
                            {daysUntil === 1 ? "day" : "days"} until your next Payment
                        </p>
                    </div>}
                </div>
            );
        }

        let sortedTimeline = timeline.sort();

        if (!expandedView) {
            return sortedTimeline.slice(0, 1);
        }
        return sortedTimeline;
    }

    renderRentPaymentDateMap(expandedView) {
        let rentPaymentDateMap = this.state.rentPaymentDateMap;

        let timeline = [];
        if (!rentPaymentDateMap || rentPaymentDateMap === undefined) {
            return timeline;
        }
        for (const [key, value] of Object.entries(rentPaymentDateMap)) {
            let iKey = parseInt(key);
            let daysUntil = getDaysUntil(iKey)
            timeline.push(
                <div className="rent_schedule_bullet_point_box">
                    <div className="rent_schedule_bullet_point">
                    </div>
                    <li key={daysUntil} className="rent_schedule_bullet_point_text">
                        {daysUntil} {daysUntil === 1 ? "day" : "days"} until {value["num_properties"]} {value["num_properties"] === 1 ? "property pays" : "properties pay"} ${numberWithCommas(value["total_rent"])} in rent
                    </li>
                </div>
            );
        }

        let sortedTimeline = timeline.sort();
        if (sortedTimeline.length < 3) {
            sortedTimeline.push(
                <div className="rent_schedule_bullet_point_box">
                    <p style={{
                        color: "grey",
                        fontSize: "1.0em",
                        fontWeight: "bold",
                        marginLeft: "20px",
                        paddingTop: "10px",
                        textAlign: "center",
                        width: "calc((100% - 40px))",
                    }}>
                        None other to Display
                    </p>
                </div>
            )
        }
        if (!expandedView) {
            return sortedTimeline.slice(0, 3);
        }
        return sortedTimeline;
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect
            }} />
        }
        let barChartData = getHistoricalAnalysisData(this.state.historicalAnalysis);
        return (
            <div>
                <MouseTooltip
                        visible={this.state.mouseActiveTooltipText !== null}
                        offsetX={15}
                        offsetY={10}
                        style={{
                            backgroundColor: "#f5f5fa",
                            borderRadius: "10px",
                            fontSize: "0.85em",
                            fontWeight: "bold",
                            paddingBottom: "5px",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                            paddingTop: "5px",
                            zIndex: "40",
                        }}
                    >
                        <span>{this.state.mouseActiveTooltipText}</span>
                    </MouseTooltip>
                <div>
                    <DashboardSidebar data={{
                        state: {
                            user: this.state.user,
                            totalEstimateWorth: this.state.totalEstimateWorth,
                            missingEstimate: this.state.missingEstimate,
                            currentPage: "overview",
                            profilePicture: this.state.profilePicture
                        }
                    }}/>
                    {this.state.isLoading ? 
                        <div style={{
                            backgroundColor: "#f5f5fa",
                            height: "100vh",
                            width: "100%",
                        }}
                        ></div> : 
                    <div>
                        <div style={{
                            backgroundColor: "#f5f5fa",
                            display: "block",
                            height: "100vh",
                            marginLeft: "250px",
                            overflow: "hidden",
                            width: "calc(100% - 250px - 375px)",
                            zIndex: "-1",
                        }}>
                            <div className="page-white-background">
                                <div style={{
                                    display: "inline-block",
                                    marginLeft: "40px",
                                    marginRight: "20px",
                                    width: "calc(100% - 80px)",
                                }}>
                                    <div style={{
                                        marginTop: "40px",
                                        height: "60px",
                                        width: "calc(100% - 120px)",
                                    }}>
                                        <p id="main_dashboard_welcome_box_date">
                                            {this.getDate()}
                                        </p>
                                        <p style={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "1.4em",
                                            // fontWeight: "bold",
                                        }}>
                                            Welcome, {capitalizeName(this.state.user["first_name"])}
                                        </p>
                                    </div>
                                    <div style={{
                                        backgroundColor: "#E9EDF6",
                                        borderRadius: "6px",
                                        float: "left",
                                        marginBottom: "15px",
                                        marginTop: "15px",
                                        minWidth: "calc(250px + 35px)",
                                        width: "calc(100%)",
                                    }}>
                                        <div className="main_dashboard_summary_cards">
                                            <BsFillHouseFill className="main_dashboard_summary_cards_icon"></BsFillHouseFill>
                                            <div className="main_dashboard_summary_cards_text_box">
                                                <p className="main_dashboard_summary_cards_title">
                                                    {this.state.totalProperties ? this.state.totalProperties : 0} total
                                                </p>   
                                                <p className="main_dashboard_summary_cards_subtitle">
                                                    {this.state.totalProperties === 1 ? "property" : "properties"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="main_dashboard_summary_cards">
                                            <FaDollarSign className="main_dashboard_summary_cards_icon"></FaDollarSign>
                                            <div className="main_dashboard_summary_cards_text_box">
                                                <p className="main_dashboard_summary_cards_title">
                                                    ${this.state.totalRent ? this.state.totalRent : 0}
                                                </p>   
                                                <p className="main_dashboard_summary_cards_subtitle">
                                                    monthly rent income
                                                </p>
                                            </div>
                                        </div>
                                        <div className="main_dashboard_summary_cards">
                                            <AiTwotonePushpin className="main_dashboard_summary_cards_icon"></AiTwotonePushpin>
                                            <div className="main_dashboard_summary_cards_text_box">
                                                <p className="main_dashboard_summary_cards_title">
                                                ${this.state.totalCost ? this.state.totalCost : 0.00}
                                                </p>   
                                                <p className="main_dashboard_summary_cards_subtitle">
                                                    monthly cost
                                                </p>
                                            </div>
                                        </div>
                                        <div className="main_dashboard_summary_cards">
                                            <RiPercentFill className="main_dashboard_summary_cards_icon"></RiPercentFill>
                                            <div className="main_dashboard_summary_cards_text_box">
                                                <p className="main_dashboard_summary_cards_title">
                                                    {this.state.annualRateOfReturn ? this.state.annualRateOfReturn : 0.00}%
                                                </p>   
                                                <p className="main_dashboard_summary_cards_subtitle">
                                                    annual rate of return
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="main_dashboard_bottom_box">
                                        <div id="main_dashboard_bottom_left_box">
                                            <div style={{
                                                backgroundColor: "#f5f5fa",
                                                borderRadius: "4px",
                                                height: "385px",
                                                paddingLeft: "20px",
                                                paddingRight: "20px",
                                                width: "calc(100% - 15px)",
                                            }}>
                                                <p className="main_dashboard_box_title">
                                                    Portfolio Growth
                                                </p>
                                                <div className="clearfix"/>
                                                <div className="main_dashboard_portfolio_growth_bar_chart_parent_box">
                                                    <BarChart 
                                                        height={"310"}
                                                        xAxisFontSize={"0.85em"}
                                                        yAxisFontSize={"0.9em"}
                                                        xAxisColor={"grey"}
                                                        yAxisColor={"grey"}
                                                        barColor={"#296CF6"}
                                                        capitalizeXAxis={true}
                                                        marginTop={"20"}
                                                        displayTooltip={true}
                                                        data={barChartData}/>
                                                </div>
                                            </div>
                                            <div className="main_dashboard_bottom_left_box_bottom">
                                                <div className="main_dashboard_bottom_left_box_bottom_inner_box">
                                                    <p className="main_dashboard_box_title">
                                                        Mortgages/Loans
                                                    </p>
                                                    <AiFillQuestionCircle 
                                                        onMouseEnter={() => {
                                                            let mouseToolTip = (
                                                                <div>
                                                                    <p>
                                                                        How many days until your next Payment.
                                                                    </p>
                                                                </div>
                                                            );
                                                            this.setState({
                                                                mouseActiveTooltipText: mouseToolTip,
                                                            })
                                                        }}
                                                        onMouseLeave={() => {
                                                            this.setState({
                                                                mouseActiveTooltipText: null,
                                                            })
                                                        }}
                                                        className="main_dashboard_box_icon"></AiFillQuestionCircle>
                                                    <div className="clearfix"/>
                                                    {this.renderMortgagePaymentDateMap()}
                                                </div>
                                                <div className="main_dashboard_bottom_left_box_bottom_inner_box">
                                                    <p className="main_dashboard_box_title">
                                                        Rent Collected
                                                    </p>
                                                    <AiFillQuestionCircle 
                                                        onMouseEnter={() => {
                                                            let mouseToolTip = (
                                                                <div>
                                                                    <p>
                                                                        All the rent/income you will/have collect this month.
                                                                    </p>
                                                                </div>
                                                            );
                                                            this.setState({
                                                                mouseActiveTooltipText: mouseToolTip,
                                                            })
                                                        }}
                                                        onMouseLeave={() => {
                                                            this.setState({
                                                                mouseActiveTooltipText: null,
                                                            })
                                                        }}
                                                        className="main_dashboard_box_icon"></AiFillQuestionCircle>
                                                    <div className="clearfix"/>
                                                    {this.renderRentCollected()}                                                
                                                </div>
                                                <div className="main_dashboard_bottom_left_box_bottom_inner_box">
                                                    <p className="main_dashboard_box_title">
                                                        Expenses
                                                    </p>
                                                    <AiFillQuestionCircle 
                                                        onMouseEnter={() => {
                                                            let mouseToolTip = (
                                                                <div>
                                                                    <p>
                                                                        Total expenses this month.
                                                                    </p>
                                                                </div>
                                                            );
                                                            this.setState({
                                                                mouseActiveTooltipText: mouseToolTip,
                                                            })
                                                        }}
                                                        onMouseLeave={() => {
                                                            this.setState({
                                                                mouseActiveTooltipText: null,
                                                            })
                                                        }}
                                                        className="main_dashboard_box_icon"></AiFillQuestionCircle>
                                                    <div className="clearfix"/>
                                                    {this.renderAdditionalExpensesCollected()}      
                                                </div>
                                            </div>
                                        </div>
                                        <div id="main_dashboard_bottom_right_box">
                                            <div style={{
                                                backgroundColor: "#f5f5fa",
                                                // border: "1px solid #d3d3d3", 
                                                borderRadius: "4px",
                                                // boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                                height: "287px",
                                                overflow: "hidden",
                                                width: "calc(100% - 2px)",
                                            }}>
                                                <div>
                                                    <p className="main_dashboard_box_title">
                                                        Rent Schedule
                                                    </p>
                                                    <AiFillQuestionCircle 
                                                        onMouseEnter={() => {
                                                            let mouseToolTip = (
                                                                <div>
                                                                    <p>
                                                                        Timeline of when you can expect your rent.
                                                                    </p>
                                                                </div>
                                                            );
                                                            this.setState({
                                                                mouseActiveTooltipText: mouseToolTip,
                                                            })
                                                        }}
                                                        onMouseLeave={() => {
                                                            this.setState({
                                                                mouseActiveTooltipText: null,
                                                            })
                                                        }}
                                                        className="main_dashboard_box_icon"></AiFillQuestionCircle>
                                                </div>
                                                <div className="clearfix"/>
                                                {
                                                    this.state.rentPaymentDateMap ? 
                                                    this.renderRentPaymentDateMap(false) :
                                                    <div>
                                                        <p style={{
                                                            marginTop: "20px",
                                                            textAlign: "center",
                                                        }}>
                                                            No Rent Schedule
                                                        </p>
                                                    </div>
                                                }
                                                {/* <div className="main_dashboard_key_insight_card">
                                                    <p className="main_dashboard_key_insight_card_title">
                                                        {this.state.totalCurrentlyRented ? this.state.totalCurrentlyRented : 0}
                                                    </p>
                                                    <p className="main_dashboard_occupied_circle_text_box_subtitle">
                                                        { this.state.totalCurrentlyRented > 1 ? "properties" : "property" } currently rented
                                                    </p>
                                                    <p id="main_dashboard_occupied_circle_text_box_footer">
                                                        ${this.state.vacantProperties ? 0 : this.estimateLostRent(this.state.vacantProperties)} / month in estimated lost income
                                                    </p>
                                                </div> */}
                                            </div>
                                            <div className="clearfix"/>
                                            <div id="main_dashboard_yoy_growth_box">
                                                <div className="main_dashboard_yoy_growth_toggle_box">
                                                    <div 
                                                        onClick={() => this.setState({
                                                            yoyGrowthToggleIsYear: true
                                                        })}
                                                        className={
                                                            this.state.yoyGrowthToggleIsYear ?
                                                            "main_dashboard_yoy_growth_toggle_element main_dashboard_yoy_growth_toggle_element_active" :
                                                            "main_dashboard_yoy_growth_toggle_element"}>
                                                        Year
                                                    </div>
                                                    <div 
                                                        onClick={() => this.setState({
                                                            yoyGrowthToggleIsYear: false
                                                        })}
                                                        className={
                                                            !this.state.yoyGrowthToggleIsYear ?
                                                            "main_dashboard_yoy_growth_toggle_element main_dashboard_yoy_growth_toggle_element_active" :
                                                            "main_dashboard_yoy_growth_toggle_element"}>
                                                        Month
                                                    </div>
                                                </div>
                                                { this.state.totalEstimateWorth >= this.state.yearAgoTotalEstimateWorth || this.state.totalEstimateWorth === 0.0 ?
                                                <ImArrowUp2 id="main_dashboard_yoy_icon"></ImArrowUp2> : 
                                                <ImArrowDown2 id="main_dashboard_yoy_icon"></ImArrowDown2>}
                                                <p className="main_dashboard_yoy_growth_title">
                                                    {Number(15.5.toFixed(1))}%
                                                </p>
                                                <div className="clearfix"/>
                                                <p className="main_dashboard_yoy_subtitle">
                                                    Your portfolio {this.state.totalEstimateWorth >= this.state.yearAgoTotalEstimateWorth ? "grew" : "decreased"} from ${numberWithCommas(this.state.yearAgoTotalEstimateWorth)} to ${numberWithCommas(this.state.totalEstimateWorth)} year over year
                                                </p>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <NotificationSidebar data={{
                            state: {
                                user: this.state.user,
                                totalEstimateWorth: this.state.totalEstimateWorth,
                                missingEstimate: this.state.missingEstimate 
                            }
                        }}/>
                    </div>}
                </div>
            </div>
        )
    }
}

export default MainDashboard;