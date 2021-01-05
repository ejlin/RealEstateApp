import React from 'react';
import axios from 'axios';

import './CSS/CreateExpenseModal.css';
import './CSS/Style.css';

import { IoCloseOutline } from 'react-icons/io5';
import { IoMdAdd } from 'react-icons/io';

class CreateExpenseModal extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            closeCreateExpenseModal: this.props.data.state.closeCreateExpenseModal,
        };

        this.renderAssociatedProperties = this.renderAssociatedProperties.bind(this);
        this.displayPotentialAssociatedProperties = this.displayPotentialAssociatedProperties.bind(this);
    }

    componentDidMount() {
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
                properties: [...propertiesMap],
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

    displayPotentialAssociatedProperties(e) {
        var elements = [];
        var value = e.target.value;
        if (value.length === 0) {
            this.setState({
                filteredAssociatedProperties: [],
            })
            return;
        }

        var propertyAddresses = this.state.propertyAddresses;
        var filteredAddresses = propertyAddresses.filter(address => address.startsWith(value));
        for (var i = 0; i < filteredAddresses.length; i++) {
            elements.push(
                <div>
                    {filteredAddresses[i]}
                </div>
            );
        }
        this.setState({
            filteredAssociatedProperties: elements,
        })
    }

    renderAssociatedProperties() {
        var elements = [];
        elements.push(
            <div>
                <input 
                    onChange={this.displayPotentialAssociatedProperties}
                    placeholder="Add a property" 
                    className="create_expense_modal_associated_properties_input"></input>
                {this.state.filteredAssociatedProperties}
            </div>
        );
        return elements;
    }

    render() {
        return (
            <div className="create_expense_modal_parent_box">
                <div className="create_expense_modal_parent_box_title_box">
                    <IoCloseOutline 
                        onClick={() => {
                            this.state.closeCreateExpenseModal();
                        }}
                        className="create_expense_modal_parent_box_title_box_close_icon"></IoCloseOutline>
                </div>
                <div className="create_expense_modal_parent_box_inner_box">
                    <p className="create_expense_modal_parent_box_title">
                        Add an Expense 
                    </p>
                    <input placeholder="Title" className="create_expense_modal_parent_box_title_input">
                    </input>
                    <textarea maxlength="500" placeholder="Description (max 500 char.)" className="create_expense_modal_parent_box_title_textarea">
                    </textarea>
                    <div className="create_expense_modal_parent_box_inner_box_left_box">
                        <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                            Associated Properties
                        </p>
                        {this.renderAssociatedProperties()}
                    </div>
                    <div className="create_expense_modal_parent_box_inner_box_right_box">
                        <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                            Expense Date
                        </p>
                        <input type="date" className="create_expense_modal_parent_box_inner_box_right_box_date_input">
                        </input>
                        <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                            Expense Amount
                        </p>
                        <input type="text" placeholder="$" className="create_expense_modal_parent_box_inner_box_right_box_date_input">
                        </input>
                        <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                            Frequency
                        </p>
                        <select className="create_expense_modal_parent_box_inner_box_right_box_date_select">
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
                    </div>
                    <div className="clearfix"/>
                    <div className="create_expense_modal_parent_box_inner_box_bottom_box">
                        <div className="create_expense_modal_parent_box_inner_box_bottom_box_add_button">
                            Add Expense
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CreateExpenseModal;