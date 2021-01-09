import React from 'react';
import axios from 'axios';

import './CSS/PropertyModal.css';
import './CSS/Style.css';

import { IoCloseOutline, IoTrashSharp } from 'react-icons/io5';

const All = "All";
const None = "None";

const title = "title";
const description = "description";
const amount = "amount";
const date = "date";
const frequency = "frequency";
const properties = "properties";

class PropertyModal extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            currSelectedAssociatedProperties: [],
            addExpense: this.props.data.state.addExpense,
            closePropertyModal: this.props.data.state.closePropertyModal,
        };
        this.closePotentialAssociatedProperties = this.closePotentialAssociatedProperties.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.renderAssociatedProperties = this.renderAssociatedProperties.bind(this);
        this.displayPotentialAssociatedProperties = this.displayPotentialAssociatedProperties.bind(this);
        this.removeSelectedAssociatedProperty = this.removeSelectedAssociatedProperty.bind(this);
        this.verifyExpense = this.verifyExpense.bind(this);
    }

    componentDidMount() {
        document.body.addEventListener('click', this.closePotentialAssociatedProperties);

        // Load our properties list.
        axios({
            method: 'get',
            url:  'api/user/property/' + this.state.user["id"],
        }).then(response => {
            var propertiesList = response.data;

            var propertiesMap = new Map();
            var propertyAddresses = [];
            for (var i = 0; i < propertiesList.length; i++) {
                var propertyID = propertiesList[i]["id"];
                var propertyAddress = propertiesList[i]["address"];
                // map property address to id.
                propertiesMap.set(propertyAddress, propertyID);
                propertyAddresses.push(propertyAddress);
            }
            this.setState({
                properties: propertiesMap,
                propertyAddresses: propertyAddresses,
                isPropertiesLoading: false
            });
        }).catch(error => {
            console.log(error);
            this.setState({
                isPropertiesLoading: false
            })
        });
    }

    componentWillUnmount() {
        document.body.removeEventListener('click', this.closePotentialAssociatedProperties);
    }

    closePotentialAssociatedProperties() {
        this.setState({
            filteredAssociatedProperties: [],
        })
    }

    handleFieldChange(e) {
        this.setState({ 
            [e.target.name]: e.target.value
         })
    }

    displayPotentialAssociatedProperties(e) {

        var selectedPropertyInput = document.getElementById("associated_properties_input");

        var elements = [];
        var value = e.target.value;
        var currSelectedAssociatedProperties = this.state.currSelectedAssociatedProperties;

        var allIndex = currSelectedAssociatedProperties.indexOf(All);
        if (allIndex < 0){
            elements.push(
                <div 
                    onClick={() => {
                        var currSelectedAssociatedProperties = this.state.currSelectedAssociatedProperties;
                        currSelectedAssociatedProperties.push(All);
                        // Remove None from our list if we add a non-None element.
                        let index = currSelectedAssociatedProperties.indexOf(None);
                        if (index >= 0) {
                            currSelectedAssociatedProperties.splice(index, 1);
                        }
                        // reset the search bar to empty.
                        selectedPropertyInput.value = "";
                        this.setState({
                            currSelectedAssociatedProperties: [...currSelectedAssociatedProperties],
                            filteredAssociatedProperties: null,
                        })
                    }} 
                    className="associated_properties_dropdown_elements">
                    {All}
                </div>
            );
        }
        
        var noneIndex = currSelectedAssociatedProperties.indexOf(None);
        if (noneIndex < 0){
            elements.push(
                <div 
                    onClick={() => {
                        var currSelectedAssociatedProperties = this.state.currSelectedAssociatedProperties;
                        currSelectedAssociatedProperties = [None];
                        // reset the search bar to empty.
                        selectedPropertyInput.value = "";
                        this.setState({
                            currSelectedAssociatedProperties: [...currSelectedAssociatedProperties],
                            filteredAssociatedProperties: null,
                        })
                    }} 
                    className="associated_properties_dropdown_elements">
                    {None}
                </div>
            );
        }

        var propertyAddresses = this.state.propertyAddresses;
        var filteredAddresses = propertyAddresses.filter(address => address.startsWith(value));
        for (var i = 0; i < filteredAddresses.length; i++) {
            let filteredAddress = filteredAddresses[i];
            var index = currSelectedAssociatedProperties.indexOf(filteredAddress);
            // Only show properties that are not currently selected.
            if (index < 0){
                elements.push(
                    <div 
                        onClick={() => {
                            var currSelectedAssociatedProperties = this.state.currSelectedAssociatedProperties;
                            currSelectedAssociatedProperties.push(filteredAddress);
                            // Remove None from our list if we add a non-None element.
                            let index = currSelectedAssociatedProperties.indexOf(None);
                            if (index >= 0) {
                                currSelectedAssociatedProperties.splice(index, 1);
                                console.log(currSelectedAssociatedProperties);
                            }
                            // reset the search bar to empty.
                            selectedPropertyInput.value = "";
                            this.setState({
                                currSelectedAssociatedProperties: [...currSelectedAssociatedProperties],
                                filteredAssociatedProperties: null,
                            })
                        }} 
                        className="associated_properties_dropdown_elements">
                        {filteredAddresses[i]}
                    </div>
                );
            }
        }
        this.setState({
            filteredAssociatedProperties: elements,
        })
    }

    removeSelectedAssociatedProperty(addressToRemove) {
        var currSelectedAssociatedProperties = this.state.currSelectedAssociatedProperties;
        var index = currSelectedAssociatedProperties.indexOf(addressToRemove);
        currSelectedAssociatedProperties.splice(index, 1);
        this.setState({
            currSelectedAssociatedProperties: currSelectedAssociatedProperties,
        })
    }

    renderAssociatedProperties() {
        var elements = [];

        var currSelectedAssociatedProperties = this.state.currSelectedAssociatedProperties;
        for (var i = 0; i < currSelectedAssociatedProperties.length; i++) {
            
            let currSelectedAssociatedProperty = currSelectedAssociatedProperties[i];
            elements.push(
                <div className="current_selected_associated_properties">
                    <p className="current_selected_associated_properties_text">
                        {currSelectedAssociatedProperty}
                    </p>
                    <IoTrashSharp 
                        onClick={() => this.removeSelectedAssociatedProperty(currSelectedAssociatedProperty)}
                        className="current_selected_associated_properties_icon"></IoTrashSharp>
                </div>
            );
        }

        var wrappedElements = [];

        if (elements.length > 0) {
            wrappedElements.push(
                <div className="associated_properties_selected_parent_box">
                    {elements}
                </div>
            );
        }
        
        wrappedElements.push(
            <div>
                <input 
                    id="associated_properties_input"
                    onClick={(e) => {
                        this.displayPotentialAssociatedProperties(e);
                        e.stopPropagation();
                    }}
                    
                    onChange={this.displayPotentialAssociatedProperties}
                    placeholder="Add a property" 
                    className="create_expense_modal_associated_properties_input"></input>
                <div className="clearfix"/>
                {this.state.filteredAssociatedProperties && this.state.filteredAssociatedProperties.length > 0 ?
                <div className="create_expense_modal_associated_properties_filtered_properties_box">
                    {this.state.filteredAssociatedProperties}
                </div>:
                <div></div>}
            </div>
        );
        return wrappedElements;
    }

    verifyExpense() {
        
        // TODO: verify expense
        var expense = new FormData();
        expense.append(title, this.state.title);
        expense.append(description, this.state.description);
        expense.append(date, this.state.date);
        expense.append(amount, this.state.amount);
        expense.append(frequency, this.state.frequency);

        var currSelectedAssociatedProperties = this.state.currSelectedAssociatedProperties;
        var indexAll = currSelectedAssociatedProperties.indexOf(All);
        var indexNone = currSelectedAssociatedProperties.indexOf(None);

        var associatedProperties = [];
        var propertiesMap = this.state.properties;

        if (indexAll >= 0) {
            // Add all of our properties.
            propertiesMap.forEach((value, key, map) => {
                associatedProperties.push(value);
            })
        } else if (indexNone >= 0) {
        } else {
            // Add all the ids of the properties selected.
            for (var i = 0; i < currSelectedAssociatedProperties.length; i++) {
                let currSelectedAssociatedProperty = currSelectedAssociatedProperties[i];
                if (propertiesMap.has(currSelectedAssociatedProperty)) {
                    associatedProperties.push(propertiesMap.get(currSelectedAssociatedProperty));
                }
            }
        }   

        expense.append(properties, associatedProperties);
        
        this.state.addExpense(expense);
    }

    render() {
        return (
            <div>
                <div className="create_expense_modal_parent_box">
                    <div className="create_expense_modal_parent_box_title_box">
                        <IoCloseOutline 
                            onClick={() => {
                                this.state.closePropertyModal();
                            }}
                            className="create_expense_modal_parent_box_title_box_close_icon"></IoCloseOutline>
                    </div>
                    <div className="create_expense_modal_parent_box_inner_box">
                        <p className="create_expense_modal_parent_box_title">
                            Add an Expense 
                        </p>
                        <input 
                            onChange={this.handleFieldChange} 
                            name="title" 
                            maxLength="30"
                            placeholder="Title (max 30 char.)" 
                            className="create_expense_modal_parent_box_title_input">
                        </input>
                        <textarea 
                            onChange={this.handleFieldChange} 
                            name="description"
                            maxLength="300" 
                            placeholder="Description (max 300 char.)" 
                            className="create_expense_modal_parent_box_title_textarea">
                        </textarea>
                        <div className="create_expense_modal_parent_box_inner_box_left_box">
                            <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                                Associated Properties
                            </p>
                            <div className="create_expense_modal_render_associated_properties_box">
                                {this.renderAssociatedProperties()}
                            </div>
                        </div>
                        <div className="create_expense_modal_parent_box_inner_box_right_box">
                            <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                                Expense Date
                            </p>
                            <input 
                                onChange={this.handleFieldChange} 
                                name="date"
                                type="date" 
                                className="create_expense_modal_parent_box_inner_box_right_box_date_input">
                            </input>
                            <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                                Expense Amount
                            </p>
                            <input 
                                onChange={this.handleFieldChange} 
                                name="amount"
                                type="text" 
                                placeholder="$" 
                                className="create_expense_modal_parent_box_inner_box_right_box_date_input">
                            </input>
                            <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                                Frequency
                            </p>
                            <select 
                                onChange={this.handleFieldChange} 
                                name="frequency"
                                className="create_expense_modal_parent_box_inner_box_right_box_date_select">
                                <option>
                                    Once
                                </option>
                                <option>
                                    Daily
                                </option>
                                <option>
                                    Weekly
                                </option>
                                <option>
                                    Bi-Weekly
                                </option>
                                <option>
                                    Monthly
                                </option>
                                <option>
                                    Semi-Annually
                                </option>
                                <option>
                                    Annually
                                </option>
                            </select>
                            <div className="clearfix"/>
                            <div 
                                onClick={() => {
                                    this.verifyExpense()
                                }}
                                className="create_expense_modal_parent_box_inner_box_bottom_box_add_button">
                                Add Expense
                            </div>
                        </div>
                        <div className="clearfix"/>
                        
                    </div>
                </div>
                <div className="create_expense_modal_padding_bottom">
                </div>
            </div>
        )
    }
}

export default PropertyModal;