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
            user: this.props.location.state.user,
            vacantProperties: 0,
            yearAgoTotalEstimateWorth: 0,
            properties: [],
            isLoading: true,
            profilePicture: this.props.location.state.profilePicture
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
        var url = '/api/user/property/summary/' + this.state.user["id"];
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            var propertiesSummary = response.data;
            this.setState({
                totalEstimateWorth: this.numberWithCommas(propertiesSummary["total_estimate_worth"]),
                totalNetWorth: this.numberWithCommas(propertiesSummary["total_net_worth"]),
                totalRent: this.numberWithCommas(propertiesSummary["total_rent"]),
                totalCost: this.numberWithCommas(Number(propertiesSummary["total_cost"].toFixed(2))),
                annualRateOfReturn: Number(propertiesSummary["annual_rate_of_return"].toFixed(3)),
                totalProperties: this.numberWithCommas(propertiesSummary["total_properties"]),
                averageLTV: Number(propertiesSummary["average_ltv"].toFixed(2)),
                averageDTI: Number(propertiesSummary["average_dti"].toFixed(2)),
                missingEstimate: propertiesSummary["missing_estimate"],
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
                                        Welcome, {this.capitalizeName(this.state.user["first_name"])}
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