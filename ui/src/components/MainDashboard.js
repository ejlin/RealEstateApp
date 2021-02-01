import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/MainDashboard.css';
import './CSS/Style.css';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { capitalizeName } from '../utility/Util.js';

import PropertyCard from './PropertyCard.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import BarChart from '../charts/BarChart.js';

import { AiTwotonePushpin } from 'react-icons/ai';
import { FaDollarSign } from 'react-icons/fa';
import { RiPercentFill } from 'react-icons/ri';
import { BsFillHouseFill } from 'react-icons/bs';
import { ImArrowUp2, ImArrowDown2 } from 'react-icons/im';
import { IoIosWarning } from 'react-icons/io';

import { IoMdAddCircle } from 'react-icons/io';

import { LineChart, PieChart } from 'react-chartkick'
import 'chart.js'
import { VictoryLine, VictoryAxis, VictoryChart } from 'victory';

import { XAxis, Bar } from 'recharts';

export const getDaysInMonth = (month, year) => {
    return new Date(year, month+1, 0).getDate();
}

export const getDaysUntil = (rentDay) => {
    var today = new Date();
    var date = today.getDate();
    var year = today.getFullYear();
    var month = today.getMonth();

    var numDaysInMonth = getDaysInMonth(month, year);

    var daysUntilEndOfMonth = numDaysInMonth - date;
    return rentDay < date ? daysUntilEndOfMonth + rentDay : rentDay- date;
}

export const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class MainDashboard extends React.Component {
    constructor(props) {
        super(props);
        if (this.props == null) {
            this.setState({                   
                redirect: "/dashboard"
            });
        }
        this.state = {
            user: this.props.location.state.user,
            vacantProperties: 0,
            yearAgoTotalEstimateWorth: 0.0,
            properties: [],
            isLoading: true,
            profilePicture: this.props.location.state.profilePicture,
            yoyGrowthToggleIsYear: true
        };

        this.getDate = this.getDate.bind(this);
        this.estimateLostRent = this.estimateLostRent.bind(this);
        this.ltvToText = this.ltvToText.bind(this);
        this.dtiToText = this.dtiToText.bind(this);
        this.getTrailingTwelveMonths = this.getTrailingTwelveMonths.bind(this);
    }

    componentDidMount() {
        var url = '/api/user/summary/' + this.state.user["id"];
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            var userSummary = response.data;
            var propertiesSummary = userSummary["properties_summary"];
            var expensesSummary = userSummary["expenses_summary"];
            this.setState({
                // totalEstimateWorth: propertiesSummary["total_estimate_worth"] numberWithCommas(propertiesSummary["total_estimate_worth"]),
                totalEstimateWorth: propertiesSummary["total_estimate_worth"],
                totalNetWorth: numberWithCommas(propertiesSummary["total_net_worth"]),
                totalRent: numberWithCommas(propertiesSummary["total_rent"]),
                totalCost: numberWithCommas(Number(propertiesSummary["total_cost"].toFixed(2))),
                annualRateOfReturn: Number(propertiesSummary["annual_rate_of_return"].toFixed(3)),
                totalProperties: numberWithCommas(propertiesSummary["total_properties"]),
                averageLTV: Number(propertiesSummary["average_ltv"].toFixed(2)),
                averageDTI: Number(propertiesSummary["average_dti"].toFixed(2)),
                missingEstimate: propertiesSummary["missing_estimate"],
                totalCurrentlyRented: propertiesSummary["total_currently_rented"],
                rentPaymentDateMap: propertiesSummary["rent_payment_date_map"],
                mortgagePaymentDateMap: propertiesSummary["mortgage_payment_date_map"],
                totalExpenses: expensesSummary["total_expenses"],
                isLoading: false
            });

        }).catch(error => console.log(error));

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



    getDate() {
        var monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = today.getMonth();
        var yyyy = today.getFullYear();

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
    
    getTrailingTwelveMonths() {
        var monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var today = new Date();
        var mm = today.getMonth();

        var numMonths = 12;

        var firstBackwardsMonth = monthArr.slice(0, mm + 1);
        var lastBackwardsMonth = monthArr.slice(mm + 1, numMonths);

        var trailingMonths = lastBackwardsMonth.concat(firstBackwardsMonth);
        return trailingMonths;
    }

    renderRentCollected() {
        return (
            <div className="main_dashboard_bottom_left_box_bottom_inner_box_text_box">
                <p className="main_dashboard_bottom_left_box_bottom_inner_box_text_box_title_two">
                    $6,600
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
        var mortgagePaymentDateMap = this.state.mortgagePaymentDateMap;
        var timeline = [];

        for (const [key, value] of Object.entries(mortgagePaymentDateMap)) {
            var daysUntil;
            var iKey = parseInt(key);
            var daysUntil = getDaysUntil(iKey);
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

        var sortedTimeline = timeline.sort();

        if (!expandedView) {
            return sortedTimeline.slice(0, 1);
        }
        return sortedTimeline;
    }

    renderRentPaymentDateMap(expandedView) {
        var rentPaymentDateMap = this.state.rentPaymentDateMap;

        var timeline = [];

        for (const [key, value] of Object.entries(rentPaymentDateMap)) {
            var iKey = parseInt(key);
            var daysUntil = getDaysUntil(iKey)
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

        var sortedTimeline = timeline.sort();
        if (sortedTimeline.length < 3) {
            sortedTimeline.push(
                <div className="rent_schedule_bullet_point_box">
                    <p className="rent_schedule_bullet_point_no_more_text">
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
        return (
            <div>
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
                    {this.state.isLoading ? <div></div> : 
                    <div>
                        <div id="main_dashboard_parent">
                            <div id="main_dashboard_title">
                                <div id="main_dashboard_welcome_box">
                                    <p id="main_dashboard_welcome_box_date">
                                        {this.getDate()}
                                    </p>
                                    <p id="main_dashboard_welcome_box_name">
                                        Welcome, {capitalizeName(this.state.user["first_name"])}
                                    </p>
                                </div>
                                <div id="main_dashboard_summary_cards_box">
                                    <div className="main_dashboard_summary_cards">
                                        <BsFillHouseFill id="main_dashboard_summary_cards_icon_properties" className="main_dashboard_summary_cards_icon"></BsFillHouseFill>
                                        <div className="main_dashboard_summary_cards_text_box">
                                            <p className="main_dashboard_summary_cards_title">
                                                {this.state.totalProperties ? this.state.totalProperties : 0} total
                                            </p>   
                                            <p className="main_dashboard_summary_cards_subtitle">
                                                {this.state.totalProperties > 1 ? "properties" : "property"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="main_dashboard_summary_cards">
                                        <FaDollarSign id="main_dashboard_summary_cards_icon_monthly_income" className="main_dashboard_summary_cards_icon"></FaDollarSign>
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
                                        <RiPercentFill id="main_dashboard_summary_cards_icon_monthly_arr" className="main_dashboard_summary_cards_icon"></RiPercentFill>
                                        <div className="main_dashboard_summary_cards_text_box">
                                            <p className="main_dashboard_summary_cards_title">
                                                {this.state.annualRateOfReturn ? this.state.annualRateOfReturn : 0.00}%
                                            </p>   
                                            <p className="main_dashboard_summary_cards_subtitle">
                                                annual rate of return
                                            </p>
                                        </div>
                                    </div>
                                    <div className="main_dashboard_summary_cards">
                                        <AiTwotonePushpin id="main_dashboard_summary_cards_icon_monthly_total_cost" className="main_dashboard_summary_cards_icon"></AiTwotonePushpin>
                                        <div className="main_dashboard_summary_cards_text_box">
                                            <p className="main_dashboard_summary_cards_title">
                                            ${this.state.totalCost ? this.state.totalCost : 0.00}
                                            </p>   
                                            <p className="main_dashboard_summary_cards_subtitle">
                                                monthly cost
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div id="main_dashboard_bottom_box">
                                    <div id="main_dashboard_bottom_left_box">
                                        <div className="main_dashboard_bottom_left_box_top">
                                            <p className="main_dashboard_box_title">
                                                Portfolio Growth
                                            </p>
                                            <div className="clearfix"/>
                                            <BarChart 
                                                height={"270"}
                                                xAxisColor={"grey"}
                                                barColor={"#296CF6"}
                                                capitalizeXAxis={true}
                                                marginTop={"20"}
                                                displayTooltip={true}
                                                data={[
                                                {x: "JAN", y: 61}, 
                                                {x: "FEB", y: 25}, 
                                                {x: "MAR", y: 16}, 
                                                {x: "APR", y: 28}, 
                                                {x: "MAY", y: 11}, 
                                                {x: "JUN", y: 9}, 
                                                {x: "JUL", y: 10}, 
                                                {x: "AUG", y: 13}, 
                                                {x: "SEP", y: 17}, 
                                                {x: "OCT", y: 20}, 
                                                {x: "NOV", y: 18}, 
                                                {x: "DEC", y: 28}
                                            ]}/>
                                            <div className="clearfix"/>
                                            {/* <VictoryChart
                                                width={"700"}
                                                height={"250"}
                                                padding={{
                                                    left: 50,
                                                    right: 50,
                                                    top: 0,
                                                    bottom: 60
                                                }}>
                                            <VictoryLine 
                                                interpolation="natural"
                                                style={{
                                                    data: {
                                                        stroke: "#296CF6",
                                                        strokeWidth: "3",
                                                    }
                                                }}
                                                minDomain={{ 
                                                    x: 0,
                                                    y: 0
                                                }}
                                                // labels= {({ datum }) => datum.y}
                                                width={"700"}
                                                
                                                data={[
                                                    {x: "Jan", y: 61}, 
                                                    {x: "Feb", y: 25}, 
                                                    {x: "Mar", y: 16}, 
                                                    {x: "Apr", y: 28}, 
                                                    {x: "May", y: 11}, 
                                                    {x: "Jun", y: 9}, 
                                                    {x: "Jul", y: 10}, 
                                                    {x: "Aug", y: 13}, 
                                                    {x: "Sep", y: 17}, 
                                                    {x: "Oct", y: 20}, 
                                                    {x: "Nov", y: 18}, 
                                                    {x: "Dec", y: 28}
                                                ]} /> */}
                                                {/* <VictoryAxis
                                                    dependentAxis
                                                    tickFormat={(y) => {
                                                            // const dateObj = new Date(x);
                                                            // const year = dateObj.getFullYear().toString().substr(-2);
                                                            // const month = dateObj.toLocaleString('en-us', { month: 'short' });           
                                                            // return `${month}/${year}`;       
                                                            return y;                                            
                                                    }}                                             
                                                /> */}
                                                {/* <VictoryAxis
                                                    tickFormat={(x) => {
                                                            // const dateObj = new Date(x);
                                                            // const year = dateObj.getFullYear().toString().substr(-2);
                                                            // const month = dateObj.toLocaleString('en-us', { month: 'short' });           
                                                            // return `${month}/${year}`;       
                                                            return x;                                            
                                                    }}                                             
                                                />
                                            </VictoryChart> */}
                                        </div>
                                        <div className="main_dashboard_bottom_left_box_bottom">
                                            <div className="main_dashboard_bottom_left_box_bottom_inner_box">
                                                <p className="main_dashboard_box_title">
                                                    Mortgages/Loans
                                                </p>
                                                <IoMdAddCircle className="main_dashboard_box_icon"></IoMdAddCircle>
                                                <div className="clearfix"/>
                                                {this.renderMortgagePaymentDateMap()}
                                            </div>
                                            <div className="main_dashboard_bottom_left_box_bottom_inner_box">
                                                <p className="main_dashboard_box_title">
                                                    Rent Collected
                                                </p>
                                                <IoMdAddCircle className="main_dashboard_box_icon"></IoMdAddCircle>
                                                <div className="clearfix"/>
                                                {this.renderRentCollected()}                                                
                                            </div>
                                            <div className="main_dashboard_bottom_left_box_bottom_inner_box">
                                                <p className="main_dashboard_box_title">
                                                    Expenses
                                                </p>
                                                <IoMdAddCircle className="main_dashboard_box_icon"></IoMdAddCircle>
                                                <div className="clearfix"/>
                                                {this.renderAdditionalExpensesCollected()}      
                                            </div>
                                        </div>
                                    </div>
                                    <div id="main_dashboard_bottom_right_box">
                                        <div className="main_dashboard_key_insights_box">
                                            <div>
                                                <p className="main_dashboard_box_title">
                                                    Rent Schedule
                                                </p>
                                                <IoMdAddCircle className="main_dashboard_box_icon"></IoMdAddCircle>
                                            </div>
                                            <div className="clearfix"/>
                                            {this.renderRentPaymentDateMap(false)}
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
                                                        yoyGrowthToggleIsYear: false
                                                    })}
                                                    className={
                                                        !this.state.yoyGrowthToggleIsYear ?
                                                        "main_dashboard_yoy_growth_toggle_element main_dashboard_yoy_growth_toggle_element_active" :
                                                        "main_dashboard_yoy_growth_toggle_element"}>
                                                    Month
                                                </div>
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
                                            </div>
                                            {this.state.totalEstimateWorth >= this.state.yearAgoTotalEstimateWorth ?
                                             <ImArrowUp2 id="main_dashboard_yoy_icon"></ImArrowUp2> : 
                                             <ImArrowDown2 id="main_dashboard_yoy_icon"></ImArrowDown2>}
                                             <p className="main_dashboard_yoy_growth_title">
                                                 {Number(15.5.toFixed(1))}%
                                             </p>
                                             <div className="clearfix"/>
                                             <p className="main_dashboard_yoy_subtitle">
                                                Your portfolio {this.state.totalEstimateWorth >= this.state.yearAgoTotalEstimateWorth ? "grew" : "decreased"} from {numberWithCommas(this.state.yearAgoTotalEstimateWorth)} to {numberWithCommas(this.state.totalEstimateWorth)} year over year
                                            </p>
                                        </div>
                                        
                                    </div>
                                    {/* <div id="main_dashboard_bottom_box_left">
                                        <p className="main_dashboard_bottom_box_title">
                                            Portfolio Growth
                                        </p>
                                        <div id="main_dashboard_portfolio_growth_parent">
                                            <BarChart width={600} height={275} barSize={25}
                                            data={[
                                                {name: 'Jan', uv: 423},
                                                {name: 'Feb', uv: 423},
                                                {name: 'Mar', uv: 423},
                                                {name: 'Apr', uv: 423},
                                                {name: 'May', uv: 423},
                                                {name: 'Jun', uv: 423},
                                                {name: 'Jul', uv: 433},
                                                {name: 'Aug', uv: 433},
                                                {name: 'Sep', uv: 443},
                                                {name: 'Oct', uv: 445},
                                                {name: 'Nov', uv: 446},
                                                {name: "Dec '20", uv: 450},
                                            ]}>
                                                <XAxis dataKey="name" />
                                                <Bar dataKey="uv" fill="#63B0F8" />
                                            </BarChart>
                                        </div>
                                        <div id="main_dashboard_yoy_box">
                                            {this.state.totalEstimateWorth >= this.state.yearAgoTotalEstimateWorth ? <MdTrendingUp id="main_dashboard_yoy_icon"></MdTrendingUp> : <MdTrendingDown id="main_dashboard_yoy_icon"></MdTrendingDown>}
                                            <div id="main_dashboard_yoy_text_box">
                                                <p id="main_dashboard_yoy_title">
                                                    15.5% Year over Year Growth
                                                </p>
                                                <p id="main_dashboard_yoy_subtitle">
                                                    Your portfolio {this.state.totalEstimateWorth >= this.state.yearAgoTotalEstimateWorth ? "grew" : "decreased"} from {this.state.totalEstimateWorth} to {this.state.yearAgoTotalEstimateWorth} year over year
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="main_dashboard_bottom_box_right">
                                        <p className="main_dashboard_bottom_box_title">
                                            Key Insights
                                        </p>
                                        <div id="main_dashboard_occupied_box">
                                            <div id="main_dashboard_occupied_circle_parent_first_child" className="main_dashboard_occupied_circle_parent">
                                                <div id="main_dashboard_occupied_circle_text_box">
                                                    <p id="main_dashboard_occupied_circle_text_box_title">
                                                        {this.state.propertiesVacant ? (this.state.totalProperties - this.state.propertiesVacant) : this.state.totalProperties}
                                                    </p>
                                                    <p id="main_dashboard_occupied_circle_text_box_subtitle">
                                                        { this.state.propertiesVacant && this.state.totalProperties - this.state.propertiesVacant > 1 ? "properties" : "property" } currently rented
                                                    </p>
                                                    <p id="main_dashboard_occupied_circle_text_box_footer">
                                                        ${this.state.vacantProperties ? 0 : this.estimateLostRent(this.state.vacantProperties)} / month in estimated lost income
                                                    </p>
                                                </div>
                                                <div id="main_dashboard_occupied_circle_box">
                                                    <CircularProgressbar 
                                                        value={this.state.totalProperties ? (this.state.totalProperties - this.state.vacantProperties) / this.state.totalProperties * 100 : 0}
                                                        text={`${this.state.totalProperties ? (this.state.totalProperties - this.state.vacantProperties) / this.state.totalProperties * 100 : 0}%`}
                                                        background
                                                        backgroundPadding={5}
                                                        styles={buildStyles({
                                                        backgroundColor: "#EE9E77",
                                                        textColor: "#fff",
                                                        pathColor: "#fff",
                                                        trailColor: "transparent",
                                                        })}/>
                                                </div>
                                            </div>
                                            <div className="clearfix"/>
                                            <div className="main_dashboard_occupied_circle_parent">
                                                <div id="main_dashboard_occupied_circle_text_box">
                                                    <p id="main_dashboard_occupied_circle_text_box_title">
                                                        {this.state.averageLTV ? this.state.averageLTV : 0}%
                                                    </p>
                                                    <p id="main_dashboard_occupied_circle_text_box_subtitle">
                                                        Average Loan To Value Ratio
                                                    </p>
                                                    <p id="main_dashboard_occupied_circle_text_box_footer">
                                                        {this.ltvToText(this.state.averageLTV)}
                                                    </p>
                                                </div>
                                                <div id="main_dashboard_occupied_circle_box">
                                                    <CircularProgressbar 
                                                        value={this.state.averageLTV ? this.state.averageLTV : 0}
                                                        text={`${this.state.averageLTV ? this.state.averageLTV : 0}%`}
                                                        background
                                                        backgroundPadding={5}
                                                        styles={buildStyles({
                                                        backgroundColor: "#85bb65",
                                                        textColor: "#fff",
                                                        pathColor: "#fff",
                                                        trailColor: "transparent",
                                                        })}/>
                                                </div>
                                            </div>
                                            <div className="clearfix"/>
                                            <div className="main_dashboard_occupied_circle_parent">
                                                <div id="main_dashboard_occupied_circle_text_box">
                                                    <p id="main_dashboard_occupied_circle_text_box_title">
                                                        {this.state.averageDTI ? this.state.averageDTI : 0}%
                                                    </p>
                                                    <p id="main_dashboard_occupied_circle_text_box_subtitle">
                                                        Average Debt To Income Ratio
                                                    </p>
                                                    <p id="main_dashboard_occupied_circle_text_box_footer">
                                                        {this.dtiToText(this.state.averageDTI)}
                                                    </p>
                                                </div>
                                                <div id="main_dashboard_occupied_circle_box">
                                                    <CircularProgressbar 
                                                        value={this.state.averageDTI ? this.state.averageDTI : 0}
                                                        text={`${this.state.averageDTI ? this.state.averageDTI : 0}%`}
                                                        background
                                                        backgroundPadding={5}
                                                        styles={buildStyles({
                                                        backgroundColor: "#296CF6",
                                                        textColor: "#fff",
                                                        pathColor: "#fff",
                                                        trailColor: "transparent",
                                                        })}/>
                                                </div>
                                            </div>
                                        </div>   */}
                                    {/* </div> */}
                                </div>
                            </div>
                        </div>
                        <NotificationSidebar data={{
                            state: {
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