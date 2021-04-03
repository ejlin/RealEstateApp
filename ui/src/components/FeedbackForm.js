import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/FeedbackForm.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { BsFillHouseFill } from 'react-icons/bs';
import { RiFileWarningFill, RiVipCrown2Fill } from 'react-icons/ri';
import { AiTwotoneSecurityScan } from 'react-icons/ai';
import { MdAccountCircle } from 'react-icons/md';

const general = "general";
const featureRequest = "feature_request";
const bugReport = "bug_report";
const securityIssue = "security_issue";
const accountIssue = "account_issue";

class FeedbackForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            profilePicture: this.props.location.state.profilePicture,
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
                        <input type="text" placeholder="Title" className="feedback_form_actual_form_title_input"></input>
                        <div className="clearfix"/>
                        <textarea 
                            type="textarea" 
                            placeholder="Please describe your general feedback." 
                            className="feedback_form_actual_form_title_textarea"></textarea>
                        <div id="feedback_form_actual_form_checkbox_box">
                            <div className="feedback_form_actual_form_submit_button">
                                Submit
                            </div>
                        </div>
                    </div>
                )
            case featureRequest:
                return (
                    <div className="feedback_form_actual_form_box">
                        <input type="text" placeholder="Title" className="feedback_form_actual_form_title_input"></input>
                        <div className="clearfix"/>
                        <textarea 
                            type="textarea" 
                            placeholder="Please describe your feature request. The more details you can provide, the more we can understand how this feature will help you and your investments." 
                            className="feedback_form_actual_form_title_textarea"></textarea>
                        <div id="feedback_form_actual_form_checkbox_box">
                            <div
                                className={
                                    this.state.featureRequestCheckbox ? 
                                    "feedback_form_actual_form_checkbox" : 
                                    "feedback_form_actual_form_checkbox"}
                                onClick={() => this.setState({
                                    featureRequestCheckbox: !this.state.featureRequestCheckbox
                                })}>
                                <div
                                    className={
                                        this.state.featureRequestCheckbox ? 
                                        "feedback_form_actual_form_checkbox_inner_box feedback_form_actual_form_checkbox_inner_box_active" : 
                                        "feedback_form_actual_form_checkbox_inner_box"
                                    }>
                                </div>
                            </div>
                            <p className="feedback_form_actual_form_checkbox_text">
                                I consent to being contacted regarding any follow up work required for this feature request.
                            </p>
                            <div className="feedback_form_actual_form_submit_button">
                                Submit
                            </div>
                        </div>
                        <div className="clearfix"/>
                    </div>
                )
            case bugReport:
                return (
                    <div className="feedback_form_actual_form_box">
                        <input type="text" placeholder="Title" className="feedback_form_actual_form_title_input"></input>
                        <div className="clearfix"/>
                        <textarea 
                            type="textarea" 
                            placeholder="Please describe your bug report. The more details you can provide, the more we can quickly identify and fix this bug. Please be as descriptive as possible on how to re-create this bug." 
                            className="feedback_form_actual_form_title_textarea"></textarea>
                        <div className="clearfix"/>
                        <div id="feedback_form_actual_form_select_box">
                            <select className="feedback_form_select_input">
                                <option value="" disabled selected>Severity</option>
                                <option>Business Critical</option>
                                <option>Severely impacting majority of operations</option>
                                <option>Operation efficiency impacted</option>
                                <option>Minor annoyance</option>
                            </select>
                            <div className="feedback_form_actual_form_submit_button">
                                Submit
                            </div>
                        </div>
                    </div>
                )
            case securityIssue:
                return (
                    <div className="feedback_form_actual_form_box">
                        <input type="text" placeholder="Title" className="feedback_form_actual_form_title_input"></input>
                        <div className="clearfix"/>
                        <textarea 
                            type="textarea" 
                            placeholder="Please describe the security issue. The more details you can provide, the more we can quickly identify and fix this vulnerability." 
                            className="feedback_form_actual_form_title_textarea"></textarea>
                        <div className="clearfix"/>
                        <div id="feedback_form_actual_form_select_box">
                            <select className="feedback_form_select_input">
                                <option value="" disabled selected>Severity</option>
                                <option>Critical</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                            <div className="feedback_form_actual_form_submit_button">
                                Submit
                            </div>
                        </div>
                    </div>
                )
            case accountIssue:
                return (
                    <div className="feedback_form_actual_form_box">
                        <input type="text" placeholder="Title" className="feedback_form_actual_form_title_input"></input>
                        <div className="clearfix"/>
                        <textarea 
                            type="textarea" 
                            placeholder="Please describe your account's issue." 
                            className="feedback_form_actual_form_title_textarea"></textarea>
                        <div className="clearfix"/>
                        <div id="feedback_form_actual_form_select_box">
                            <select className="feedback_form_select_input">
                                <option value="" disabled selected>I have an issue with...</option>
                                <option>Billing</option>
                                <option>Cancellation</option>
                            </select>
                            <div className="feedback_form_actual_form_submit_button">
                                Submit
                            </div>
                        </div>
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
                        profilePicture: this.state.profilePicture,
                        currentPage: "feedback"
                    }
                }}/>
                <div id="feedback_form_box">
                    <div className="page-white-background">
                        <div style={{
                            float: "left",
                            paddingBottom: "10px",
                            paddingTop: "10px",
                            width: "100%",
                        }}>
                            <p style={{
                                float: "left",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.1em",
                                lineHeight: "40px",
                                marginLeft: "calc((100% - 200px)/2)",
                                width: "200px",
                            }}>
                                FEEDBACK
                            </p>
                        </div>
                        <div className="clearfix"/>
                        <div className="page-title-bar-divider"></div>
                        <div style={{
                            float: "left",
                            height: "calc(100vh - 50px - 50px - 50px)",
                            marginLeft: "40px",
                            marginRight: "40px",
                            width: "calc(100% - 80px)",
                        }}>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.0em",
                                marginTop: "25px",
                            }}>
                                Your feedback matters! Please use this form to report any issues you have encountered while using this website and/or any features you would love to see as we work to constantly improve our product. Thank you for your continued support!
                            </p>
                            <p style={{
                                marginTop: "15px",
                            }}>
                                You are submitting this form as {this.state.user["first_name"]} {this.state.user["last_name"]}, {this.state.user["email"]}
                            </p>
                            <div style={{
                                float: "left",
                                marginTop: "25px",
                                width: "100%",
                            }}>
                                <div>
                                    <li 
                                        onClick={() => this.setState({
                                            toDisplay: general,
                                        })}
                                        className={
                                            this.state.toDisplay === general ? 
                                            "feedback_form_inner_lower_box_nav_bar_list feedback_form_inner_lower_box_nav_bar_list_active" : 
                                            "feedback_form_inner_lower_box_nav_bar_list"}>
                                        <BsFillHouseFill className={
                                            this.state.toDisplay === general ? 
                                            "feedback_form_inner_lower_box_nav_bar_list_icon feedback_form_inner_lower_box_nav_bar_list_icon_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_icon"
                                        }></BsFillHouseFill>
                                        <p className={
                                            this.state.toDisplay === general ?
                                            "feedback_form_inner_lower_box_nav_bar_list_title feedback_form_inner_lower_box_nav_bar_list_title_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_title"
                                        }>
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
                                        <RiVipCrown2Fill className={
                                            this.state.toDisplay === featureRequest ? 
                                            "feedback_form_inner_lower_box_nav_bar_list_icon feedback_form_inner_lower_box_nav_bar_list_icon_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_icon"
                                        }></RiVipCrown2Fill>
                                        <p className={
                                            this.state.toDisplay === featureRequest ?
                                            "feedback_form_inner_lower_box_nav_bar_list_title feedback_form_inner_lower_box_nav_bar_list_title_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_title"
                                        }>
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
                                        <RiFileWarningFill className={
                                            this.state.toDisplay === bugReport ? 
                                            "feedback_form_inner_lower_box_nav_bar_list_icon feedback_form_inner_lower_box_nav_bar_list_icon_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_icon"
                                        }></RiFileWarningFill>
                                        <p className={
                                            this.state.toDisplay === bugReport ?
                                            "feedback_form_inner_lower_box_nav_bar_list_title feedback_form_inner_lower_box_nav_bar_list_title_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_title"
                                        }>
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
                                        <AiTwotoneSecurityScan className={
                                            this.state.toDisplay === securityIssue ? 
                                            "feedback_form_inner_lower_box_nav_bar_list_icon feedback_form_inner_lower_box_nav_bar_list_icon_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_icon"
                                        }></AiTwotoneSecurityScan>
                                        <p className={
                                            this.state.toDisplay === securityIssue ?
                                            "feedback_form_inner_lower_box_nav_bar_list_title feedback_form_inner_lower_box_nav_bar_list_title_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_title"
                                        }>
                                            Security Issue
                                        </p>
                                    </li>
                                    <li 
                                        onClick={() => this.setState({
                                            toDisplay: accountIssue,
                                        })}
                                        className={
                                            this.state.toDisplay === accountIssue ? 
                                            "feedback_form_inner_lower_box_nav_bar_list feedback_form_inner_lower_box_nav_bar_list_active" : 
                                            "feedback_form_inner_lower_box_nav_bar_list"}>
                                        <MdAccountCircle className={
                                            this.state.toDisplay === accountIssue ? 
                                            "feedback_form_inner_lower_box_nav_bar_list_icon feedback_form_inner_lower_box_nav_bar_list_icon_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_icon"
                                        }></MdAccountCircle>
                                        <p className={
                                            this.state.toDisplay === accountIssue ?
                                            "feedback_form_inner_lower_box_nav_bar_list_title feedback_form_inner_lower_box_nav_bar_list_title_active" :
                                            "feedback_form_inner_lower_box_nav_bar_list_title"
                                        }>
                                            Account Issue
                                        </p>
                                    </li>
                                </div>
                                {this.renderForms()}
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
            </div>
        )
    }
}

export default FeedbackForm;