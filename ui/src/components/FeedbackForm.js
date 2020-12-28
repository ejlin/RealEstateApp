import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/FeedbackForm.css';

import DashboardSidebar from './DashboardSidebar.js';

import { BsFillHouseFill } from 'react-icons/bs';
import { RiFileWarningFill, RiVipCrown2Fill } from 'react-icons/ri';
import { AiTwotoneSecurityScan } from 'react-icons/ai';

const general = "general";
const featureRequest = "feature_request";
const bugReport = "bug_report";
const securityIssue = "security_issue";

class FeedbackForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            toDisplay: general,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.renderForms = this.renderForms.bind(this);
    }

    handleFieldChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit(event) {
        event.preventDefault();

        var axiosAddPropertyURL = '/api/user/property/' + this.state.userID;
        axios({
            method: 'post',
            url: axiosAddPropertyURL,
            timeout: 5000,  // 5 seconds timeout
            data: {
                address: this.state.address,
                city: this.state.city,
                state: this.state.state,
                zip_code: this.state.zip_code,
                bought_date: this.state.bought_date,
                price_bought: parseFloat(this.state.price_bought),
                price_rented: parseFloat(this.state.price_rented),
                price_mortgage: parseFloat(this.state.price_mortgage),
                price_down_payment: parseFloat(this.state.price_down_payment),
                price_property_manager: parseFloat(this.state.price_property_manager),
                mortgage_company: this.state.mortgage_company,
                mortgage_interest_rate: parseFloat(this.state.mortgage_interest_rate),
                property_type: this.state.property_type
            }
        }).then(response => {
            console.log(response);
            this.setState({
                redirect: "/dashboard"
            })
        }).catch(error => console.error('timeout exceeded'));
    }

    renderForms() {
        switch(this.state.toDisplay) {
            case general:
                return (
                    <div className="feedback_form_actual_form_box">
                        <p className="feedback_form_actual_form_title">
                            General Feedback
                        </p>
                        <p className="feedback_form_actual_form_subtitle">
                            You are submitting this form as {this.state.user["first_name"]} {this.state.user["last_name"]}, {this.state.user["email"]}
                        </p>
                        
                    </div>
                )
            case featureRequest:
                return (
                    <div className="feedback_form_actual_form_box">
                        <p className="feedback_form_actual_form_title">
                            Feature Request
                        </p>
                        <p className="feedback_form_actual_form_subtitle">
                            You are submitting this form as {this.state.user["first_name"]} {this.state.user["last_name"]}, {this.state.user["email"]}
                        </p>
                        
                    </div>
                )
            case bugReport:
                return (
                    <div className="feedback_form_actual_form_box">
                        <p className="feedback_form_actual_form_title">
                            Bug Report
                        </p>
                        <p className="feedback_form_actual_form_subtitle">
                            You are submitting this form as {this.state.user["first_name"]} {this.state.user["last_name"]}, {this.state.user["email"]}
                        </p>
                        
                    </div>
                )
            case securityIssue:
                return (
                    <div className="feedback_form_actual_form_box">
                        <p className="feedback_form_actual_form_title">
                            Security Issue
                        </p>
                        <p className="feedback_form_actual_form_subtitle">
                            You are submitting this form as {this.state.user["first_name"]} {this.state.user["last_name"]}, {this.state.user["email"]}
                        </p>
                        
                    </div>
                )
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect,
                state: {
                    user: this.state.user,
                }
            }} />
        }
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        currentPage: "feedback"
                    }
                }}/>
                <div id="feedback_form_box">
                    <div id="feedback_form_inner_box">
                        <p className="feedback_form_inner_box_title">
                            Feedback
                        </p>
                        <p className="feedback_form_inner_box_subtitle">
                            Your feedback matters! Please use this form to report any issues you have encountered while using this website and/or any features you would love to see as we work to constantly improve our product. Thank you for your continued support!
                        </p>
                        <div id="feedback_form_inner_lower_box">
                            <div id="feedback_form_inner_lower_box_nav_bar">
                                <li 
                                    onClick={() => this.setState({
                                        toDisplay: general,
                                    })}
                                    className={
                                        this.state.toDisplay === general ? 
                                        "feedback_form_inner_lower_box_nav_bar_list feedback_form_inner_lower_box_nav_bar_list_active" : 
                                        "feedback_form_inner_lower_box_nav_bar_list"}>
                                    <BsFillHouseFill className="feedback_form_inner_lower_box_nav_bar_list_icon"></BsFillHouseFill>
                                    <p className="feedback_form_inner_lower_box_nav_bar_list_title">
                                        General
                                    </p>
                                </li>
                                <li 
                                    onClick={() => this.setState({
                                        toDisplay: featureRequest,
                                    })}
                                    className={
                                        this.state.toDisplay === featureRequest ? 
                                        "feedback_form_inner_lower_box_nav_bar_list feedback_form_inner_lower_box_nav_bar_list_active" : 
                                        "feedback_form_inner_lower_box_nav_bar_list"}>
                                    <RiVipCrown2Fill className="feedback_form_inner_lower_box_nav_bar_list_icon"></RiVipCrown2Fill>
                                    <p className="feedback_form_inner_lower_box_nav_bar_list_title">
                                        Feature Request
                                    </p>
                                </li>
                                <li 
                                    onClick={() => this.setState({
                                        toDisplay: bugReport,
                                    })}
                                    className={
                                        this.state.toDisplay === bugReport ? 
                                        "feedback_form_inner_lower_box_nav_bar_list feedback_form_inner_lower_box_nav_bar_list_active" : 
                                        "feedback_form_inner_lower_box_nav_bar_list"}>
                                    <RiFileWarningFill className="feedback_form_inner_lower_box_nav_bar_list_icon"></RiFileWarningFill>
                                    <p className="feedback_form_inner_lower_box_nav_bar_list_title">
                                        Bug Report
                                    </p>
                                </li>
                                <li 
                                    onClick={() => this.setState({
                                        toDisplay: securityIssue,
                                    })}
                                    className={
                                        this.state.toDisplay === securityIssue ? 
                                        "feedback_form_inner_lower_box_nav_bar_list feedback_form_inner_lower_box_nav_bar_list_active" : 
                                        "feedback_form_inner_lower_box_nav_bar_list"}>
                                    <AiTwotoneSecurityScan className="feedback_form_inner_lower_box_nav_bar_list_icon"></AiTwotoneSecurityScan>
                                    <p className="feedback_form_inner_lower_box_nav_bar_list_title">
                                        Security Issue
                                    </p>
                                </li>
                            </div>
                            <div id="feedback_form_inner_lower_box_right_box">
                                {this.renderForms()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default FeedbackForm;