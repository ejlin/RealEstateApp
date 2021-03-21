import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/NewPropertyForm.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { BsFillHouseFill } from 'react-icons/bs';
import { AiTwotonePushpin } from 'react-icons/ai';
import { FaDollarSign } from 'react-icons/fa';

const generalInformation = "general_information";
const purchaseInformation = "purchase_information";
const incomeInformation = "income_information";

const Lob = "Lob";
const Custom = "Custom";
    
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
            properties: [],
            addressToUse: Lob,
        };
        this.addProperty = this.addProperty.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.propertyTypeOnChange = this.propertyTypeOnChange.bind(this);
        this.purchaseTypeOnChange = this.purchaseTypeOnChange.bind(this);

        this.renderSuggestedAddress = this.renderSuggestedAddress.bind(this);

        this.isEqualAddress = this.isEqualAddress.bind(this);
        this.validatePropertyWithLob = this.validatePropertyWithLob.bind(this);
    }

    handleFieldChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    addProperty() {

        let axiosAddPropertyURL = URLBuilder('/api/user/property/', this.state.user["id"]);
        axios({
            method: 'post',
            url: axiosAddPropertyURL,
            timeout: 5000,  // 5 seconds timeout
            data: {
                address_one: this.state.address_one,
                address_two: this.state.address_two,
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
                property_type: this.state.propertyType
            }
        }).then(response => {
            console.log(response);
            this.setState({
                redirect: "/dashboard"
            })
        }).catch(error => {
            console.log(error);
        }
        // console.error('timeout exceeded')
        );
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

    validatePropertyWithLob() {

        let validatePropertyURL = URLBuilder('/api/validate/property');

        axios({
            method: 'post',
            url: validatePropertyURL,
            // timeout: 15000,  // 15 seconds timeout
            data: {
                address_one: this.state.address_one,
                address_two: this.state.address_two,
                city: this.state.city,
                state: this.state.state,
                zip_code: this.state.zip_code,
            }
        }).then(response => {
            let lobVerifiedAddress = response.data;
            if (this.isEqualAddress(lobVerifiedAddress)) {
                // Send a create request
                this.addProperty();
            } else {
                // Send a popup to the user asking them to verify address.
                this.setState({
                    lobVerfiedAddress: lobVerifiedAddress,
                    displayAddressVerificationBox: true,
                });
            }
        }).catch(error => {
            console.log(error);
            // error('timeout exceeded')
        });
    }

    // isEqualAddress will compare the Lob verified address we received and compare it
    // with the one the user sent us. If it's different, we return false; otherwise true.
    isEqualAddress(lobAddress) {
        if (lobAddress["address_line1"] && this.state.address_one) {
            if (lobAddress["address_line1"].toLowerCase() !== this.state.address_one.toLowerCase()) {
                return false;
            }
        }
        if (lobAddress["address_line2"] && this.state.address_two) {
            if (lobAddress["address_line2"].toLowerCase() !== this.state.address_two.toLowerCase()) {
                return false;
            }
        }
        if (lobAddress["address_city"] && this.state.city) {
            if (lobAddress["address_city"].toLowerCase() !== this.state.city.toLowerCase()) {
                return false;
            }
        }
        if (lobAddress["address_state"] && this.state.state) {
            if (lobAddress["address_state"].toLowerCase() !== this.state.state.toLowerCase()) {
                return false;
            }
        }
        if (lobAddress["address_zip"] && this.state.zip_code) {
            if (lobAddress["address_zip"].toLowerCase() !== this.state.zip_code.toLowerCase()) {
                return false;
            }  
        }
        return true;
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
                        <div className="clearfix"/>
                        <div className="form_box">
                            <label className="new_property_form_input_label">
                                ADDRESS LINE 1
                            </label>
                            <input 
                                // placeholder="Address Line 1" 
                                className="new_property_form_input new_property_form_input_long" 
                                type="text" 
                                name="address_one" 
                                onChange={this.handleFieldChange}/>
                            <label className="new_property_form_input_label">
                                APT OR SUITE #
                            </label>
                            <input 
                                // placeholder="APT or Suite #" 
                                className="new_property_form_input new_property_form_input_long" 
                                type="text" 
                                name="address_two" 
                                onChange={this.handleFieldChange}/>
                            <div className="clearfix"/>
                            <div className="">
                                <div className="new_property_form_input_triple_box">
                                    <label className="new_property_form_input_label">
                                        CITY
                                    </label>
                                    <input 
                                        // placeholder="City" 
                                        className="new_property_form_input new_property_form_input_triple" 
                                        type="text" 
                                        name="city" 
                                        onChange={this.handleFieldChange} />
                                </div>
                                <div className="new_property_form_input_triple_box">
                                    <label className="new_property_form_input_label">
                                        STATE
                                    </label>
                                    <input 
                                        // placeholder="State" 
                                        className="new_property_form_input_triple" 
                                        type="text" 
                                        name="state" 
                                        onChange={this.handleFieldChange} />
                                </div>
                                <div className="new_property_form_input_triple_box">
                                    <label className="new_property_form_input_label">
                                        ZIP CODE
                                    </label>
                                    <input 
                                        // placeholder="Zip Code" 
                                        className="new_property_form_input_triple" 
                                        type="text" 
                                        name="zip_code" 
                                        onChange={this.handleFieldChange} />
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <div className="form_footer_box">
                                <div style={{
                                    float: "left",
                                    width: "calc((100% - 50px - 3px)/3)",
                                }}>
                                    <label className="new_property_form_input_label">
                                        PROPERTY TYPE
                                    </label>
                                    <div className="clearfix"/>
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
                                </div>
                                {
                                    this.state.propertyType === "apartment" || 
                                    this.state.propertyType === "multi-family" || 
                                    this.state.propertyType === "commercial" ? 
                                    <div style={{
                                        float: "left",
                                        marginLeft: "25px",
                                        paddingBottom: "0px",
                                        width: "calc(((100% - 50px)/3) - 30px)",
                                    }}>
                                        <label className="new_property_form_input_label">
                                            # OF UNITS
                                        </label>
                                        <div className="clearfix"/>
                                        <input 
                                            // placeholder="# of Units" 
                                            className="new_property_form_input_short" 
                                            type="number" 
                                            name="number_of_units" 
                                            onChange={this.handleFieldChange} />
                                    </div>:
                                    <div></div>
                                }
                            </div>
                            <div style={{
                                float: "left",
                                marginTop: "25px",
                                paddingBottom: "25px",
                                width: "100%",
                            }}>
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
                            <label className="new_property_form_input_label">
                                PURCHASE PRICE
                            </label>
                            <input 
                                // placeholder="$ Purchase Price" 
                                className="new_property_form_input new_property_form_input_triple" 
                                type="number" 
                                name="purchase_price" 
                                onChange={this.handleFieldChange} />
                            <div className="clearfix"/>
                            <div style={{
                                float: "left",
                                width: "calc(50% - 12.5px)",
                            }}>
                                <label className="new_property_form_input_label">
                                    PURCHASE DATE: MM/YY
                                </label>
                                <input 
                                    // placeholder="Purchase Date: MM / YY" 
                                    className="new_property_form_input_triple" 
                                    type="text" 
                                    name="purchase_date" 
                                    onChange={this.handleFieldChange} />
                            </div>
                            <div style={{
                                float: "right",
                                width: "calc(50% - 12.5px)",
                            }}>
                                <label className="new_property_form_input_label">
                                    PURCHASE TYPE
                                </label>
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
                                <div style={{
                                    float: "left",
                                    marginTop: "25px",
                                    paddingBottom: "25px",
                                    width: "100%",
                                }}>
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
                                <label className="new_property_form_input_label">
                                    $ MONTHLY RENT
                                </label>
                                <input 
                                    // placeholder="$ Monthly Rent" 
                                    className="new_property_form_input new_property_form_input_triple" 
                                    type="number" 
                                    name="monthly_rent" 
                                    onChange={this.handleFieldChange} />
                                <div className="clearfix"/>
                                <label className="new_property_form_input_label">
                                    PURCHASE DATE: MM/YY
                                </label>
                                <input 
                                    // placeholder="Purchase Date: MM / YY" 
                                    className="new_property_form_input new_property_form_input_triple" 
                                    type="text" 
                                    name="state" 
                                    onChange={this.handleFieldChange} />
                                <div className="clearfix"/>
                                <label className="new_property_form_input_label">
                                    PURCHASE TYPE
                                </label>
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
                                <div style={{
                                    float: "left",
                                    marginTop: "25px",
                                    paddingBottom: "25px",
                                    width: "100%",
                                }}>
                                    <div 
                                        style={{
                                            backgroundColor: "#296cf6",
                                            color: "white",
                                        }}
                                        onClick={() => {
                                            this.validatePropertyWithLob()
                                        }}
                                        className="form_continue_button">
                                        Add Property
                                    </div>
                                    <div 
                                        onClick={() => this.setState({
                                            toDisplay: purchaseInformation
                                        })}
                                        className="form_back_button">
                                        Back
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: 
                break;
        }
    }

    renderSuggestedAddress() {
        return (
            <div className="full-background-tint">
                <div style={{
                    backgroundColor: "#f5f5fa",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                    marginLeft: "calc((100% - 330px - 700px)/2 - 25px)",
                    marginRight: "calc((100% - 330px - 700px)/2 + 25px)",
                    marginTop: "200px",
                    position: "absolute",
                    width: "700px",
                }}>
                    <div style={{
                        marginBottom: "25px",
                        marginLeft: "7.5%",
                        marginTop: "25px",
                        width: "85%",
                    }}>
                        <p style={{
                            fontWeight: "bold",
                            fontSize: "1.1em",
                        }}>
                            Your Address
                        </p>
                        <div 
                            onMouseDown={() => {
                                this.setState({
                                    addressToUse: Custom,
                                })
                            }}
                            style={{
                                backgroundColor: "#f5f5fa",
                                border: this.state.addressToUse === Custom ? "2px solid #296CF6" : "2px solid #f5f5fa",
                                borderRadius: "8px",
                                marginTop: "15px",
                                paddingBottom: "15px",
                                paddingLeft: "25px",
                                paddingRight: "25px",
                                paddingTop: "15px",
                            }}>
                            {/* {this.state.address_one} */}
                            <p style={{
                                fontSize: "1.1em",
                            }}>{this.state.address_one}</p>
                            <p style={{
                                fontSize: "1.1em",
                            }}>{this.state.address_two}</p>
                            <p style={{
                                fontSize: "1.1em",
                            }}>
                            {this.state.city}, {this.state.state} {this.state.zip_code}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: "grey",
                        float: "left",
                        height: "1px",
                        marginBottom: "7.5px",
                        marginLeft: "5%",
                        marginRight: "5%",
                        marginTop: "7.5px",
                        width: "90%"
                    }}>
                    </div>
                    <div style={{
                        float: "left",
                        marginBottom: "24px",
                        marginLeft: "7.5%",
                        marginTop: "15px",
                        width: "85%",
                    }}>
                        <p style={{
                            fontWeight: "bold",
                            fontSize: "1.1em",
                        }}>
                            Suggested Address
                        </p>
                        <div 
                            onMouseDown={() => {
                                this.setState({
                                    addressToUse: Lob,
                                })
                            }}
                            style={{
                                backgroundColor: "#f5f5fa",
                                border: this.state.addressToUse === Lob ? "2px solid #296CF6" : "2px solid #f5f5fa",
                                borderRadius: "8px",
                                marginTop: "15px",
                                paddingBottom: "15px",
                                paddingLeft: "25px",
                                paddingRight: "25px",
                                paddingTop: "15px",
                            }}>
                            {/* {this.state.address_one} */}
                            <p style={{
                                fontSize: "1.1em",
                            }}>{this.state.lobVerfiedAddress["address_line1"]}</p>
                            <p style={{
                                fontSize: "1.1em",
                            }}>{this.state.lobVerfiedAddress["address_line2"]}</p>
                            <p style={{
                                fontSize: "1.1em",
                            }}>
                            {this.state.lobVerfiedAddress["address_city"]}, {this.state.lobVerfiedAddress["address_state"]} {this.state.lobVerfiedAddress["address_zip"]}
                            </p>
                        </div>
                    </div>
                    <div className="clearfix"/>
                    <div 
                        onMouseDown={() => {
                            this.addProperty()
                        }}
                        style={{
                            backgroundColor: "#296CF6",
                            borderRadius: "8px",
                            color: "white",
                            cursor: "pointer",
                            float: "right",
                            fontWeight: "bold",
                            marginBottom: "25px",
                            marginRight: "7.5%",
                            padding: "10px 15px 10px 15px",
                            textAlign: "center",
                            userSelect: "none",
                        }}>
                        Continue
                    </div>
                </div>
            </div>
        );
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
                
                <div style={{
                    backgroundColor: "#f5f5fa",
                    float: "left",
                    height: "100vh",
                    marginLeft: "250px",
                    width: "calc(100% - 250px - 375px)",
                }}>
                    <div className="page-white-background">
                        <div style={{
                            float: "left",
                            paddingBottom: "10px",
                            paddingTop: "10px",
                            textAlign: "center",
                            width: "100%",
                        }}>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.1em",
                                height: "50px",
                                lineHeight: "40px",
                            }}>
                                NEW PROPERTY
                            </p>
                            <div className="clearfix"/>
                            <div className="page-title-bar-divider"></div>
                        </div>
                        { this.state.displayAddressVerificationBox ? 
                            this.renderSuggestedAddress() :
                        <div></div>}
                        <div style={{
                            display: "inline-block",
                            marginLeft: "40px",
                            marginRight: "40px",
                            marginTop: "40px",
                            textAlign: "center",
                            width: "calc((100% - 80px))",
                        }}>
                            <div>
                                <BsFillHouseFill style={{
                                    border: "3px solid #296cf6",
                                    borderRadius: "50%",
                                    color: "#296cf6",
                                    display: "inline-block",
                                    height: "35px",
                                    padding: "10px",
                                    width: "35px",
                                }}/>
                                <div style={{
                                    backgroundColor: this.state.toDisplay === purchaseInformation || this.state.toDisplay === incomeInformation ? "#296cf6" : "#d3d3d3",
                                    display: "inline-block",
                                    height: "5px",
                                    marginBottom: "25px",
                                    width: "65px",
                                }}></div>
                                <AiTwotonePushpin style={{
                                    border: this.state.toDisplay === purchaseInformation || this.state.toDisplay === incomeInformation ? "3px solid #296cf6" : "3px solid #d3d3d3",
                                    borderRadius: "50%",
                                    color: this.state.toDisplay === purchaseInformation || this.state.toDisplay === incomeInformation ? "#296cf6" : "#d3d3d3",
                                    display: "inline-block",
                                    height: "35px",
                                    padding: "10px",
                                    width: "35px",
                                }}/>
                                <div style={{
                                    backgroundColor: this.state.toDisplay === incomeInformation ? "#296cf6" : "#d3d3d3",
                                    display: "inline-block",
                                    height: "5px",
                                    marginBottom: "25px",
                                    width: "65px",
                                }}></div>
                                <FaDollarSign style={{
                                    border: this.state.toDisplay === incomeInformation ? "3px solid #296cf6" : "3px solid #d3d3d3",
                                    borderRadius: "50%",
                                    color: this.state.toDisplay === incomeInformation ? "#296cf6" : "#d3d3d3",
                                    display: "inline-block",
                                    height: "35px",
                                    padding: "10px",
                                    width: "35px",
                                }}/>
                            </div>
                            <div className="clearfix"></div>
                            <div style={{
                                marginLeft: "40px",
                                marginRight: "40px",
                                width: "calc(100% - 80px)",
                            }}></div>
                            {/* <div style={{
                                float: "left",
                                width: "250px",
                            }}>
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
                            </div> */}
                            <div className="clearfix"/>
                            <div style={{
                                float: "left",
                                width: "100%",
                            }}>
                                {this.renderFormParts()}
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

export default NewPropertyForm;