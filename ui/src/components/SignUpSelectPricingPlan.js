import React from 'react';
import axios from 'axios';

import './CSS/Style.css';
import './CSS/SignUpSelectPricingPlan.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { capitalizeName } from './MainDashboard.js';

import { Redirect } from "react-router-dom";
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { IoCaretBackSharp } from 'react-icons/io5';

/* Stripe */
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import { FaMoneyCheck } from 'react-icons/fa';
import {CardElement, CardNumberElement, CardExpiryElement, CardCvcElement, PaymentRequestButtonElement} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_JJ1eMdKN0Hp4UFJ6kWXWO4ix00jtXzq5XG');

const planPage = "plan_page";
const paymentPage = "payment_page";

const starter = "starter";
const professional = "professional";
const enterprise = "enterprise";

const planToPriceObj = {starter: "9", professional: 49, enterprise: 169}

class SignUpSelectPricingPlan extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            form: this.props.location.state.form,
            displayPage: planPage,
            plan: starter
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        axios({
            method: 'post',
            url: '/api/user/signup',
            timeout: 5000,  // 5 seconds timeout
            data: {
                first_name: this.state.form["first_name"],
                last_name: this.state.form["last_name"],
                email: this.state.form["email"],
                password: this.state.form["password"],
                plan: this.state.plan,
            }
        })
        .then(response => {
            if (response != null) {
                this.setState({
                    currUser: response.data,
                    redirect: "/dashboard"
                });
            }
        }).catch(error => console.error('timeout exceeded'));
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect,
                state: {
                    user: this.state.currUser,
                }
            }} />
        }
        return (
            <div>
                <div className="clearfix"></div>
                {this.state.displayPage === planPage ? 
                <div className="sign_up_select_pricing_plan_parent_box">
                    <div className="sign_up_select_pricing_plan_title_box">
                        <p className="sign_up_select_pricing_plan_title_box_welcome">
                            Welcome, {capitalizeName(this.state.user["first_name"])}!
                        </p>
                        <p className="sign_up_select_pricing_plan_parent_box_title_box_steps">
                            <b>Step</b> <b>2</b> of <b>3</b>
                        </p>
                        <div className="clearfix"/>
                        <IoIosCheckmarkCircleOutline className="sign_up_select_pricing_plan_parent_box_title_box_icon"></IoIosCheckmarkCircleOutline>
                        <p className="sign_up_select_pricing_plan_parent_box_title_box_text">
                            Choose your plan
                        </p>
                        <div className="clearfix"/>
                        <p className="sign_up_select_pricing_plan_parent_box_title_box_subtext">
                            Enjoy 1 month of free trial. Downgrade or Upgrade at anytime. 
                        </p>
                    </div>
                    <div className="sign_up_select_pricing_plan_parent_box_upper">
                        <div className="sign_up_select_pricing_plan_parent_box_left_box">
                            <div className="sign_up_select_pricing_plan_parent_box_title_box">
                                <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box">
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Price
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Properties
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        File Storage
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Analytics
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Linked Bank Accounts
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Support
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        End-of-Year Tax friendly Reports
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="sign_up_select_pricing_plan_parent_box_right_box">
                            <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box">
                                <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box_title_box">
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_title">
                                        Starter
                                    </p>
                                </div>
                                <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box">
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        $9 / month
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Up to 3
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        3 GB
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Basic
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Yes
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Ticketed
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        No
                                    </p>
                                    <div 
                                        onClick={() => this.setState({
                                            displayPage: paymentPage,
                                            plan: starter
                                        })}
                                        className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_select_button">
                                        Select
                                    </div>
                                </div>

                            </div>
                            <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box selected">
                                <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box_title_box">
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_title">
                                        Professional
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_recommended_subtitle">
                                        (recommended)
                                    </p>
                                </div>
                                <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box">
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        $49 / month
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Up to 25
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        50 GB
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Advanced
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Yes
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Priority Ticketed
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Yes
                                    </p>
                                    <div 
                                        onClick={() => this.setState({
                                            displayPage: paymentPage,
                                            plan: professional
                                        })}
                                        className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_select_button">
                                        Select
                                    </div>
                                </div>
                            </div>
                            <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box">
                                <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box_title_box">
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_title">
                                        Enterprise
                                    </p>
                                </div>
                                <div className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box">
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        $169 / month
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Up to 100*
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        300 GB*
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Advanced
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Yes
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Dedicated Priority Ticketed
                                    </p>
                                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text">
                                        Yes
                                    </p>
                                    <div 
                                        onClick={() => this.setState({
                                            displayPage: paymentPage,
                                            plan: enterprise
                                        })}
                                        className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_select_button">
                                        Select
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="clearfix"/>
                    <p className="sign_up_select_pricing_plan_parent_box_right_box_element_box_middle_box_text_astericks_text">
                        * $1/additional property; $1/additional 5GB
                    </p>
                </div> : 
                <div>
                    <div className="sign_up_select_pricing_plan_parent_box">
                        <div className="sign_up_select_pricing_plan_title_box">
                            <p className="sign_up_select_pricing_plan_title_box_welcome">
                                Welcome, {capitalizeName(this.state.user["first_name"])}!
                            </p>
                            <p className="sign_up_select_pricing_plan_parent_box_title_box_steps">
                                <b>Step</b> <b>3</b> of <b>3</b>
                            </p>
                            <div className="clearfix"/>
                            <IoIosCheckmarkCircleOutline className="sign_up_select_pricing_plan_parent_box_title_box_icon"></IoIosCheckmarkCircleOutline>
                            <p className="sign_up_select_pricing_plan_parent_box_title_box_text">
                                Payment Information
                            </p>
                            <div className="clearfix"/>
                            <p className="sign_up_select_pricing_plan_parent_box_title_box_subtext">
                                Start your membership as soon as you set up your payment information.
                            </p>
                            <div className="payment_information_title">
                                <div 
                                    onClick={() => {
                                        this.setState({
                                            displayPage: planPage
                                        })
                                    }}
                                    className="payment_information_title_back_button">
                                    <IoCaretBackSharp className="payment_information_title_back_icon"></IoCaretBackSharp>
                                    <p className="payment_information_title_back_text">
                                        Back
                                    </p>
                                </div>
                                <p className="payment_information_title_text">
                                You have selected the {capitalizeName(this.state.plan)} plan
                            </p>
                            </div>
                            <div className="clearfix"/>
                            
                            <div className="payment_information_box">
                                <Elements stripe={stripePromise}>
                                    <CardElement
                                        options={{
                                            iconStyle: 'solid',
                                            style: {
                                                base: {
                                                iconColor: '#296CF6',
                                                color: '#296CF6',
                                                fontWeight: 650,
                                                fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                                                fontSize: '16px',
                                                fontSmoothing: 'antialiased',
                                                ':-webkit-autofill': {color: '#fce883'},
                                                '::placeholder': {color: 'grey'},
                                                },
                                                invalid: {
                                                    iconColor: 'grey',
                                                    color: 'red',
                                                }
                                            }
                                        }}
                                    >
                                    </CardElement>
                                </Elements>
                            </div>
                            <div className="clearfix"/>
                            <div className="payment_terms_text_box">
                                By clicking the "Start my Paid Membership" button below, you agree to our&nbsp;
                                <p className="payment_terms_link">Terms of Use,</p>
                                <p className="payment_terms_link"> Privacy Notice</p> 
                                &nbsp;and that ReiMei LLC. will automatically continue your membership and charge the monthly membership fee (currently ${planToPriceObj[this.state.plan]}) to your payment method until you cancel. You may cancel at any time to avoid future charges. To cancel, go to Settings and click "Cancel Plan".
                            </div>
                            <div className="clearfix"/>
                            <div className="payment_submit_button">
                                Start my Paid Membership
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        )
    }
}

export default SignUpSelectPricingPlan;