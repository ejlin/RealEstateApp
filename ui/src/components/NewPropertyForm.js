import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/NewPropertyForm.css';

import DashboardSidebar from './DashboardSidebar.js';

class NewPropertyForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 'select'
        };

        this.state = {
            user: this.props.location.state.user,
            profilePicture: this.props.location.state.profilePicture,
            properties: []
        };

        console.log(this.state.email);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
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
                    <p className="new_property_dashboard_title_box_title">
                        New Property
                    </p>
                    <div id="new_property_form_inner_box">
                        <form onSubmit={this.handleSubmit} id="new_property_form">
                            <p className="new_property_form_subtitle">
                                Property Information
                            </p>
                            <div className="clearfix"/>
                            <div className="new_property_form_long_box">
                                <label className="new_property_form_label">
                                Address: 
                                </label>
                                <p className="new_property_form_required">*</p>
                                <div className="clearfix"/>
                                <input placeholder="1 Smith Ln" className="new_property_form_input new_property_form_input_long" type="text" name="address" onChange={this.handleFieldChange}/>
                            </div>
                            <br></br>
                            <div className="clearfix"/>
                            <div className="new_property_form_triple_box">
                                <div className="new_property_form_input_triple new_property_form_input_triple_first_child">
                                    <label className="new_property_form_label">
                                    City:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <input placeholder="San Diego" className="new_property_form_input" type="text" name="city" onChange={this.handleFieldChange} />
                                </div>
                                <div className="new_property_form_input_triple">
                                    <label className="new_property_form_label">
                                    State:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <input placeholder="CA" className="new_property_form_input" type="text" name="state" onChange={this.handleFieldChange} />
                                </div>
                                <div className="new_property_form_input_triple">
                                    <label className="new_property_form_label">
                                    Zip Code:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <input placeholder="00000" className="new_property_form_input" type="text" name="zip_code" onChange={this.handleFieldChange} />
                                </div>
                            </div>
                            <br></br>
                            <div className="clearfix"/>
                            <div className="new_property_form_double_box">
                                <div className="new_property_form_input_double_box">
                                    <label className="new_property_form_label">
                                    Purchase Price:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <input placeholder="100000" className="new_property_form_input_double" type="text" name="price_bought" onChange={this.handleFieldChange} />
                                </div>
                                <div className="new_property_form_input_double_box new_property_form_input_double_box_second_child">
                                    <label className="new_property_form_label">
                                    Purchase Date:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <input placeholder="MM/YYYY" className="new_property_form_input_double" type="text" name="bought_date" onChange={this.handleFieldChange} />
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <div className="new_property_form_double_box">
                                <div className="new_property_form_input_double_box">
                                    <label className="new_property_form_label">
                                    Property Type:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <select id="new_property_form_property_type_select" name="property_type" value={this.state.value} onChange={this.handleFieldChange}>
                                        <option value="default">Select Property Type</option>
                                        <option value="SFH">SFH</option>
                                        <option value="Manufactured">Manufactured</option>
                                        <option value="Condo/Op">Condo/Op</option>
                                        <option value="Multi-family">Multi-Family</option>
                                        <option value="Apartment">Apartment</option>
                                        <option value="Lot/Land">Lot/Land</option>
                                        <option value="Townhome">Townhome</option>
                                        <option value="Commercial">Commercial</option>
                                    </select>
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <p className="new_property_form_subtitle">
                                Income Information
                            </p>
                            <div className="clearfix"/>
                            <div className="new_property_form_input_triple">
                                <label className="new_property_form_label">
                                Monthly Rent:
                                </label>
                                <p className="new_property_form_required">*</p>
                                <div className="clearfix"/>
                                <input placeholder="$ / month" className="new_property_form_input" type="number" name="price_rented" onChange={this.handleFieldChange} />
                            </div>
                            <div className="clearfix"/>
                            <p className="new_property_form_subtitle">
                                Mortgage Information
                            </p>
                            <div className="clearfix"/>
                            <div className="new_property_form_long_box">
                                <label className="new_property_form_label">
                                Mortgage Company: 
                                </label>
                                <div className="clearfix"/>
                                <input placeholder="Smith Mortgage" className="new_property_form_input new_property_form_input_long" type="text" name="mortgage_company" onChange={this.handleFieldChange}/>
                            </div>
                            <br></br>
                            <div className="clearfix"/>
                            <div className="new_property_form_triple_box">
                                <div className="new_property_form_input_triple new_property_form_input_triple_first_child">
                                    <label className="new_property_form_label">
                                    Down Payment:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <input placeholder="10000" className="new_property_form_input" type="text" name="price_down_payment" onChange={this.handleFieldChange} />
                                </div>
                                <div className="new_property_form_input_triple">
                                    <label className="new_property_form_label">
                                    Monthly Payment:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <input placeholder="$ / month" className="new_property_form_input" type="text" name="price_mortgage" onChange={this.handleFieldChange} />
                                </div>
                                <div className="new_property_form_input_triple">
                                    <label className="new_property_form_label">
                                    Interest Rate:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <input placeholder="3.50%" className="new_property_form_input" type="text" name="mortgage_interest_rate" onChange={this.handleFieldChange} />
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <p className="new_property_form_subtitle">
                                Property Management
                            </p>
                            <div className="clearfix"/>
                            <div className="new_property_form_long_box">
                                <input type="checkbox" id="new_property_form_property_manager_checkbox"></input>
                                <label className="new_property_form_label">
                                    This property is managed by a property manager
                                </label>
                                <p className="new_property_form_required">*</p>
                                <div className="clearfix"/>
                            </div> 
                            <br></br>
                            <div className="new_property_form_triple_box">
                                <div className="new_property_form_input_triple new_property_form_input_triple_first_child">
                                    <label className="new_property_form_label">
                                    Management Rate:
                                    </label>
                                    <p className="new_property_form_required">*</p>
                                    <div className="clearfix"/>
                                    <input placeholder="6% / month" className="new_property_form_input" type="text" name="price_property_manager" onChange={this.handleFieldChange} />
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <input id="new_property_submit_button" type="submit" value="Add Property"></input>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default NewPropertyForm;