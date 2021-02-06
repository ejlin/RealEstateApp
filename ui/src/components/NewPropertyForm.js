import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/NewPropertyForm.css';

import DashboardSidebar from './DashboardSidebar.js';

import { BsFillHouseFill } from 'react-icons/bs';
import { AiTwotonePushpin } from 'react-icons/ai';
import { FaDollarSign } from 'react-icons/fa';

const generalInformation = "general_information";
const purchaseInformation = "purchase_information";
const incomeInformation = "income_information";
    
let URLBuilder = require('url-join');

class NewPropertyForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 'select'
        };

        this.state = {
            user: this.props.location.state.user,
            profilePicture: this.props.location.state.profilePicture,
            toDisplay: generalInformation,
            propertyType: "SFH",
            purchaseType: "mortgage",
            properties: []
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.propertyTypeOnChange = this.propertyTypeOnChange.bind(this);
        this.purchaseTypeOnChange = this.purchaseTypeOnChange.bind(this);
    }

    handleFieldChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit(event) {
        event.preventDefault();

        var axiosAddPropertyURL = URLBuilder('/api/user/property/', this.state.userID);
        axios({
            method: 'post',
            url: axiosAddPropertyURL,
            timeout: 5000,  // 5 seconds timeout
            data: {
                addressOne: this.state.addressOne,
                addressTwo: this.state.addressTwo,
                city: this.state.city,
                state: this.state.state,
                zip_code: this.state.zip_code,
                bought_date: this.state.bought_date,
                price_bought: parseFloat(this.state.price_bought),
                price_rented: parseFloat(this.state.price_rented),
                price_mortgage: parseFloat(this.state.price_mortgage),
                price_down_payment: parseFloat(this.state.price_down_payment),
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

    propertyTypeOnChange(e) {
        this.setState({
            propertyType: e.target.value
        });
    }

    purchaseTypeOnChange(e) {
        this.setState({
            purchaseType: e.target.value
        })
    }

    renderFormParts() {
        switch (this.state.toDisplay) {
            case generalInformation:
                return (
                    <div className="new_property_form_info_inner_box">
                        <p className="form_title">
                            Property Information
                        </p>
                        <div className="clearfix"/>
                        <p className="form_inner_box_subtitle">
                            Please input your property's general information
                        </p>
                        <div className="form_box">
                            <input 
                                placeholder="Address Line 1" 
                                className="new_property_form_input new_property_form_input_long" 
                                type="text" 
                                name="addressOne" 
                                onChange={this.handleFieldChange}/>
                            <input 
                                placeholder="APT or Suite #" 
                                className="new_property_form_input new_property_form_input_long" 
                                type="text" 
                                name="addressTwo" 
                                onChange={this.handleFieldChange}/>
                            <div className="clearfix"/>
                            <div className="">
                                <input 
                                    placeholder="City" 
                                    className="new_property_form_input_triple" 
                                    type="text" 
                                    name="city" 
                                    onChange={this.handleFieldChange} />
                                <input 
                                    placeholder="State" 
                                    className="new_property_form_input_triple" 
                                    type="text" 
                                    name="state" 
                                    onChange={this.handleFieldChange} />
                                <input 
                                    placeholder="Zip Code" 
                                    className="new_property_form_input_triple" 
                                    type="text" 
                                    name="zip_code" 
                                    onChange={this.handleFieldChange} />
                            </div>
                            <div className="clearfix"/>
                            <div className="form_footer_box">
                                <select className="form_select_input" onChange={this.propertyTypeOnChange}>
                                    <option name="SFH" value="SFH">
                                        Single Family Home
                                    </option>
                                    <option name="manufactured" value="manufactured">
                                        Manufactured
                                    </option>
                                    <option name="condo/ops" value="condo/ops">
                                        Condo/Ops
                                    </option>
                                    <option name="multi-family" value="multi-family">
                                        Multi-Family
                                    </option>
                                    <option name="apartment" value="apartment">
                                        Apartment
                                    </option>
                                    <option name="lot/land" value="lot/land">
                                        Lot/Land
                                    </option>
                                    <option name="townhome" value="townhome">
                                        Townhome
                                    </option>
                                    <option name="commercial" value="commercial">
                                        Commercial
                                    </option>
                                </select>
                                {
                                    this.state.propertyType === "apartment" || 
                                    this.state.propertyType === "multi-family" || 
                                    this.state.propertyType === "commercial" ? 
                                    <input 
                                        placeholder="# of Units" 
                                        className="new_property_form_input_short" 
                                        type="number" 
                                        name="number_of_units" 
                                        onChange={this.handleFieldChange} />:
                                    <div></div>
                                }
                                <div 
                                    onClick={() => this.setState({
                                        toDisplay: purchaseInformation
                                    })}
                                    className="form_continue_button">
                                    Continue
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case purchaseInformation:
                return (
                    <div className="new_property_form_info_inner_box">
                        <p className="form_title">
                            Purchase Information
                        </p>
                        <div className="clearfix"/>
                        <p className="form_inner_box_subtitle">
                            Please input information on how you purchased this property.
                        </p>
                        <div className="form_box">
                            {/* <label className="new_property_form_label">
                                Address: 
                            </label>
                            <p className="new_property_form_required">*</p>
                            <div className="clearfix"/> */}
                            <div className="">
                                <input 
                                    placeholder="$ Purchase Price" 
                                    className="new_property_form_input_triple" 
                                    type="number" 
                                    name="purchase_price" 
                                    onChange={this.handleFieldChange} />
                                <input 
                                    placeholder="Purchase Date: MM / YY" 
                                    className="new_property_form_input_triple" 
                                    type="text" 
                                    name="purchase_date" 
                                    onChange={this.handleFieldChange} />
                                <select id="form_select_input_purchase_type" className="form_select_input" onChange={this.purchaseTypeOnChange}>
                                    <option name="mortgage" value="mortgage">
                                        Mortgage
                                    </option>
                                    <option name="cash" value="cash">
                                        Cash
                                    </option>
                                    <option name="hard_money_loan" value="hard_money_loan">
                                        Hard Money Loan
                                    </option>
                                    <option name="hard_money_loan" value="hard_money_loan">
                                        Lease Option
                                    </option>
                                    <option name="hard_money_loan" value="hard_money_loan">
                                        Seller Finance
                                    </option>
                                    <option name="hard_money_loan" value="hard_money_loan">
                                        Loan
                                    </option>
                                    <option name="gift" value="gift">
                                        Gift/Inheritance
                                    </option>
                                    <option name="other" value="other">
                                        Other
                                    </option>
                                </select>
                            </div>
                            <div className="clearfix"/>
                            <div className="form_footer_box">
                                <div 
                                    onClick={() => this.setState({
                                        toDisplay: incomeInformation
                                    })}
                                    className="form_continue_button">
                                    Continue
                                </div>
                                <div 
                                    onClick={() => this.setState({
                                        toDisplay: generalInformation
                                    })}
                                    className="form_back_button">
                                    Back
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case incomeInformation:
                return(
                    <div className="new_property_form_info_inner_box">
                        <p className="form_title">
                            Income Information
                        </p>
                        <div className="clearfix"/>
                        <p className="form_inner_box_subtitle">
                            Please input information on your property's cash flow.
                        </p>
                        <div className="form_box">
                            <div className="">
                                <input 
                                    placeholder="$ Monthly Rent" 
                                    className="new_property_form_input_triple" 
                                    type="number" 
                                    name="monthly_rent" 
                                    onChange={this.handleFieldChange} />
                                <input 
                                    placeholder="Purchase Date: MM / YY" 
                                    className="new_property_form_input_triple" 
                                    type="text" 
                                    name="state" 
                                    onChange={this.handleFieldChange} />
                                <select id="form_select_input_purchase_type" className="form_select_input" onChange={this.purchaseTypeOnChange}>
                                    <option name="mortgage" value="mortgage">
                                        Mortgage
                                    </option>
                                    <option name="cash" value="cash">
                                        Cash
                                    </option>
                                    <option name="hard_money_loan" value="hard_money_loan">
                                        Hard Money Loan
                                    </option>
                                    <option name="hard_money_loan" value="hard_money_loan">
                                        Lease Option
                                    </option>
                                    <option name="hard_money_loan" value="hard_money_loan">
                                        Seller Finance
                                    </option>
                                    <option name="hard_money_loan" value="hard_money_loan">
                                        Loan
                                    </option>
                                    <option name="gift" value="gift">
                                        Gift/Inheritance
                                    </option>
                                    <option name="other" value="other">
                                        Other
                                    </option>
                                </select>
                            </div>
                            <div className="clearfix"/>
                            <div className="form_footer_box">
                                <div 
                                    onClick={() => this.setState({
                                        toDisplay: incomeInformation
                                    })}
                                    className="form_continue_button">
                                    Add Property
                                </div>
                                <div 
                                    onClick={() => this.setState({
                                        toDisplay: generalInformation
                                    })}
                                    className="form_back_button">
                                    Back
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: 
                break;
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
                        profilePicture: this.state.profilePicture
                    }
                }}/>
                <div id="new_property_form_box">
                    <div className="new_property_form_inner_box">
                        <p className="new_property_dashboard_title_box_title">
                            New Property
                        </p>
                        <div className="new_property_dashboard_bottom_box">
                            <div className="new_property_dashboard_bottom_left_box">
                                <li 
                                    onClick={() => this.setState({
                                        toDisplay: generalInformation
                                    })}
                                    className={
                                    this.state.toDisplay === generalInformation ?
                                    "new_property_dashboard_bottom_left_box_list new_property_dashboard_bottom_left_box_list_active" :
                                    "new_property_dashboard_bottom_left_box_list"}>
                                    <BsFillHouseFill className={
                                        this.state.toDisplay === generalInformation ? 
                                        "new_property_dashboard_bottom_left_box_list_icon new_property_dashboard_bottom_left_box_list_icon_active" : 
                                        "new_property_dashboard_bottom_left_box_list_icon"
                                    }></BsFillHouseFill>
                                    <p className={
                                        this.state.toDisplay === generalInformation ?
                                        "new_property_dashboard_bottom_left_box_list_text new_property_dashboard_bottom_left_box_list_text_active" :
                                        "new_property_dashboard_bottom_left_box_list_text"
                                    }>
                                        Property
                                    </p>
                                </li>
                                <li onClick={() => this.setState({
                                        toDisplay: purchaseInformation
                                    })}
                                    className={
                                    this.state.toDisplay === purchaseInformation ?
                                    "new_property_dashboard_bottom_left_box_list new_property_dashboard_bottom_left_box_list_active" :
                                    "new_property_dashboard_bottom_left_box_list"}>
                                    <AiTwotonePushpin className={
                                        this.state.toDisplay === purchaseInformation ? 
                                        "new_property_dashboard_bottom_left_box_list_icon new_property_dashboard_bottom_left_box_list_icon_active" : 
                                        "new_property_dashboard_bottom_left_box_list_icon"
                                    }></AiTwotonePushpin>
                                    <p className={
                                        this.state.toDisplay === purchaseInformation ?
                                        "new_property_dashboard_bottom_left_box_list_text new_property_dashboard_bottom_left_box_list_text_active" :
                                        "new_property_dashboard_bottom_left_box_list_text"
                                    }>
                                        Purchase Info
                                    </p>
                                </li>
                                <li onClick={() => this.setState({
                                        toDisplay: incomeInformation
                                    })}
                                    className={
                                    this.state.toDisplay === incomeInformation ?
                                    "new_property_dashboard_bottom_left_box_list new_property_dashboard_bottom_left_box_list_active" :
                                    "new_property_dashboard_bottom_left_box_list"}>
                                    <FaDollarSign className={
                                        this.state.toDisplay === incomeInformation ? 
                                        "new_property_dashboard_bottom_left_box_list_icon new_property_dashboard_bottom_left_box_list_icon_active" : 
                                        "new_property_dashboard_bottom_left_box_list_icon"
                                    }></FaDollarSign>
                                    <p className={
                                        this.state.toDisplay === incomeInformation ?
                                        "new_property_dashboard_bottom_left_box_list_text new_property_dashboard_bottom_left_box_list_text_active" :
                                        "new_property_dashboard_bottom_left_box_list_text"
                                    }>
                                        Income Info
                                    </p>
                                </li>
                            </div>
                            <div className="new_property_dashboard_bottom_right_box">
                                {this.renderFormParts()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default NewPropertyForm;