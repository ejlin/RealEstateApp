import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/MainDashboard.css';
import './CSS/Style.css';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import PropertyCard from './PropertyCard.js';
import DashboardSidebar from './DashboardSidebar.js';

import { AiFillBank, AiTwotonePushpin } from 'react-icons/ai';
import { FaDollarSign } from 'react-icons/fa';
import { RiPercentFill } from 'react-icons/ri';
import { FaHashtag } from 'react-icons/fa';
import { BsFillHouseFill } from 'react-icons/bs';
import { IoMdNotifications } from 'react-icons/io';

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
            firstName: this.props.location.state.first_name,
            lastName: this.props.location.state.last_name,
            email: this.props.location.state.email,
            vacantProperties: 0,
            properties: []
        };

        this.numberWithCommas = this.numberWithCommas.bind(this);
        this.capitalizeName = this.capitalizeName.bind(this);
        this.getDate = this.getDate.bind(this);
        this.estimateLostRent = this.estimateLostRent.bind(this);
        this.ltvToText = this.ltvToText.bind(this);
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
            var totalProperties = properties.length;
            var totalLoan = 0;
            var totalEquity = 0;
            var totalEstimate = 0;

            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                totalEstimateWorth += property["price_estimate"];
                totalNetWorth += property["price_bought"];
                totalRent += property["price_rented"];
                totalCost += property["price_mortgage"] + (property["price_property_manager"] * property["price_rented"] / 100.0);
                totalDownPayment += property["price_down_payment"];

                var loan = property["price_bought"] - property["price_down_payment"];
                totalLoan += loan;
                totalEquity += property["price_estimate"] && property["price_estimate"] != 0.00 ? property["price_estimate"] - loan : property["price_down_payment"]
                totalEstimate += property["price_estimate"] && property["price_estimate"] != 0.00 ? property["price_estimate"] : property["price_bought"];
            }

            var averageLTV = totalLoan / totalEstimate * 100

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
                averageLTV: Number(averageLTV.toFixed(2))
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
        } else {
            return "Excellent LTV"
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
                        id: this.state.userID,
                        first_name: this.state.firstName,
                        last_name: this.state.lastName,
                        email: this.state.email
                    }
                }}/>
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

                            </div>
                            <div id="main_dashboard_bottom_box_right">
                                <div id="main_dashboard_occupied_box">
                                    <div className="main_dashboard_occupid_circle_parent">
                                        <div id="main_dashboard_occupied_circle_text_box">
                                            <p id="main_dashboard_occupied_circle_text_box_title">
                                                {this.state.propertiesVacant ? (this.state.totalProperties - this.state.propertiesVacant) : this.state.totalProperties}
                                            </p>
                                            <p id="main_dashboard_occupied_circle_text_box_subtitle">
                                                { this.state.propertiesVacant && this.state.totalProperties - this.state.propertiesVacant > 1 ? "properties" : "property" } rented
                                            </p>
                                            <p id="main_dashboard_occupied_circle_text_box_footer">
                                                ${this.state.vacantProperties ? 0 : this.estimateLostRent(this.state.vacantProperties)} / month in estimated lost income
                                            </p>
                                        </div>
                                        <div id="main_dashboard_occupied_circle_box">
                                            <CircularProgressbar 
                                                value={(this.state.totalProperties - this.state.vacantProperties) / this.state.totalProperties * 100}
                                                text={`${(this.state.totalProperties - this.state.vacantProperties) / this.state.totalProperties * 100}%`}
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
                                    <div className="main_dashboard_occupid_circle_parent">
                                        <div id="main_dashboard_occupied_circle_text_box">
                                            <p id="main_dashboard_occupied_circle_text_box_title">
                                                {this.state.averageLTV ? this.state.averageLTV : 0}%
                                            </p>
                                            <p id="main_dashboard_occupied_circle_text_box_subtitle">
                                                Average LTV
                                            </p>
                                            <p id="main_dashboard_occupied_circle_text_box_footer">
                                                {this.ltvToText(this.state.averageLTV)}
                                            </p>
                                        </div>
                                        <div id="main_dashboard_occupied_circle_box">
                                            <CircularProgressbar 
                                                value={this.state.averageLTV}
                                                text={`${this.state.averageLTV}%`}
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
                                </div>  
                            </div>
                        </div>
                    </div>
                </div>
                <div id="main_dashboard_summary">
                    <div id="main_dashboard_summary_estimated_net_worth">
                        <p id="main_dashboard_summary_estimated_net_worth_subtitle">
                            Estimated Net Worth
                        </p>
                        <div className="clearfix"/>
                        <p id="main_dashboard_summary_estimated_net_worth_title">
                            ${this.totalEstimateWorth ? this.totalEstimateWorth : 0}
                        </p>
                    </div>
                    <div id="main_dashboard_summary_notifications">
                        <IoMdNotifications id="main_dashboard_summary_notifications_icon"></IoMdNotifications>
                        <p id="main_dashboard_summary_notifications_title">
                            Notifications
                        </p>
                        <div className="clearfix"/>
                        {this.state.notifications ? this.state.notifications : 
                        <div id="main_dashboard_summary_notifications_no_notifications">
                            <p id="main_dashboard_summary_notifications_no_notifications_text">
                                No notifications
                            </p>
                        </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default MainDashboard;