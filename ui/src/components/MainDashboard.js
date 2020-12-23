import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/MainDashboard.css';
import './CSS/Style.css';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import PropertyCard from './PropertyCard.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { AiTwotonePushpin } from 'react-icons/ai';
import { FaDollarSign } from 'react-icons/fa';
import { RiPercentFill } from 'react-icons/ri';
import { BsFillHouseFill } from 'react-icons/bs';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

import { BarChart, XAxis, Bar } from 'recharts';

class MainDashboard extends React.Component {
    constructor(props) {
        super(props);
        if (this.props == null) {
            this.setState({                   
                redirect: "/dashboard"
            });
        }
        this.state = {
            userID: this.props.location.state.id,
            firstName: this.props.location.state.firstName,
            lastName: this.props.location.state.lastName,
            email: this.props.location.state.email,
            username: this.props.location.state.username,
            vacantProperties: 0,
            yearAgoTotalEstimateWorth: 0,
            properties: [],
            isLoading: true
        };

        this.numberWithCommas = this.numberWithCommas.bind(this);
        this.capitalizeName = this.capitalizeName.bind(this);
        this.getDate = this.getDate.bind(this);
        this.estimateLostRent = this.estimateLostRent.bind(this);
        this.ltvToText = this.ltvToText.bind(this);
        this.dtiToText = this.dtiToText.bind(this);
        this.getTrailingTwelveMonths = this.getTrailingTwelveMonths.bind(this);
    }

    componentDidMount() {
        var url = '/api/user/property/' + this.state.userID;
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            var properties = response.data;
            var totalEstimateWorth = 0;
            var totalNetWorth = 0;
            var totalRent = 0;
            var totalCost = 0;
            var totalDownPayment = 0;
            var totalLoan = 0;
            var totalProperties = properties.length;
            var missingEstimate = false;

            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                totalEstimateWorth += property["price_estimate"];
                totalNetWorth += property["price_bought"];
                totalRent += property["price_rented"];
                totalCost += property["price_mortgage"] + (property["price_property_manager"] * property["price_rented"] / 100.0);
                totalDownPayment += property["price_down_payment"];

                var loan = property["price_bought"] - property["price_down_payment"];
                totalLoan += loan;

                if (property["price_estimate"] && property["price_estimate"] != 0.00) { 
                    totalEstimateWorth += property["price_estimate"];
                } else {
                    totalEstimateWorth += property["price_bought"];
                    missingEstimate = true;
                }
            }

            var averageLTV = totalLoan / totalEstimateWorth * 100;
            var userMonthlySalary = this.state.userSalary ? this.state.userSalary / 12 : 0;
            var averageDTI = totalCost / (totalRent + userMonthlySalary) * 100;

            var annualRateOfReturn = totalDownPayment === 0 ? 0 : (totalRent - totalCost) / totalDownPayment * 100 * 12

            this.setState({
                properties: properties.map((property, i) => 
                <div key={i}>
                    <PropertyCard data={{
                        state: {
                            property_details: property
                        }
                    }}/>
                </div>
                ),
                totalEstimateWorth: this.numberWithCommas(totalEstimateWorth),
                totalNetWorth: this.numberWithCommas(totalNetWorth),
                totalRent: this.numberWithCommas(totalRent),
                totalCost: this.numberWithCommas(Number(totalCost.toFixed(2))),
                annualRateOfReturn: Number(annualRateOfReturn.toFixed(3)),
                totalProperties: this.numberWithCommas(totalProperties),
                averageLTV: Number(averageLTV.toFixed(2)),
                averageDTI: Number(averageDTI.toFixed(2)),
                missingEstimate: missingEstimate,
                isLoading: false
            });

        }).catch(error => console.log(error));
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    capitalizeName(x) {
        return x.charAt(0).toUpperCase() + x.slice(1);
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
                            id: this.state.userID,
                            firstName: this.state.firstName,
                            lastName: this.state.lastName,
                            email: this.state.email,
                            username: this.state.username,
                            totalEstimateWorth: this.state.totalEstimateWorth,
                            missingEstimate: this.state.missingEstimate,
                            currentPage: "overview"
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
                                        Welcome, {this.capitalizeName(this.state.firstName)}
                                    </p>
                                </div>
                                <div id="main_dashboard_summary_cards_box">
                                    <div className="main_dashboard_summary_cards">
                                        <BsFillHouseFill id="main_dashboard_summary_cards_icon_properties" className="main_dashboard_summary_cards_icon"></BsFillHouseFill>
                                        <div className="main_dashboard_summary_cards_text_box">
                                            <p className="main_dashboard_summary_cards_title">
                                                {this.state.totalProperties ? this.state.totalProperties : 0}
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
                                    <div id="main_dashboard_bottom_box_left">
                                        <p className="main_dashboard_bottom_box_title">
                                            Portfolio Growth
                                        </p>
                                        <div id="main_dashboard_portfolio_growth_parent">
                                            <BarChart width={630} height={275} barSize={25}
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
                                        </div>  
                                    </div>
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