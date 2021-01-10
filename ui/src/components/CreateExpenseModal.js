import React from 'react';
import axios from 'axios';

import './CSS/CreateExpenseModal.css';
import './CSS/Style.css';

import DropdownSelect from './DropdownSelect.js';
import { mapFileTypeToIcon } from './FilesDashboard.js';

import { IoCloseOutline, IoSettingsSharp } from 'react-icons/io5';
import { GoFileDirectory } from 'react-icons/go';
import { BsFillHouseFill } from 'react-icons/bs';
import { AiFillQuestionCircle} from 'react-icons/ai';
import { MdFileUpload } from 'react-icons/md';

const All = "All";
const None = "None";

const title = "title";
const description = "description";
const amount = "amount";
const date = "date";
const frequency = "frequency";
const properties = "properties";

const general = "general";
const upload_file = "upload_file";
const associate_properties = "associate_properties";

class CreateExpenseModal extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            currSelectedAssociatedProperties: [],
            addExpense: this.props.data.state.addExpense,
            closeCreateExpenseModal: this.props.data.state.closeCreateExpenseModal,
            isLoading: true,
            // By default, make the frequency once. We need to set the default here because we only handle onChange
            frequency: "Once",
            pageToDisplay: general,
            filteredList: [],
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.verifyExpense = this.verifyExpense.bind(this);
        this.setParentList = this.setParentList.bind(this);
        this.renderViewBox = this.renderViewBox.bind(this);
        this.handleFileUploadChange = this.handleFileUploadChange.bind(this);
    }

    componentDidMount() {

        document.body.addEventListener('click', this.setState({
            filteredList: [],
        }));

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
                isLoading: false
            });
        }).catch(error => {
            console.log(error);
            this.setState({
                isPropertiesLoading: false
            })
        });
    }

    componentWillUnmount() {
        document.body.removeEventListener('click', this.setState({
            filteredList: [],
        }));
    }

    handleFileUploadChange(event) {
        var file = event.target.files[0];
        if (file !== null && file !== undefined) {
            this.setState({
                fileToUpload: file
            })
        }
    }

    handleFieldChange(e) {
        this.setState({ 
            [e.target.name]: e.target.value
         })
    }

    setParentList(properties) {
        this.setState({
            currSelectedAssociatedProperties: properties,
        })
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

    renderViewBox() {
        switch (this.state.pageToDisplay) {
            case general:
                return (
                    <div>
                        <input 
                            onChange={this.handleFieldChange} 
                            name="title" 
                            maxLength="30"
                            placeholder="Name (max 30 char.)" 
                            className="create_expense_modal_parent_box_title_input">
                        </input>
                        <textarea 
                            onChange={this.handleFieldChange} 
                            name="description"
                            maxLength="300" 
                            placeholder="Description (max 300 char.)" 
                            className="create_expense_modal_parent_box_title_textarea">
                        </textarea>
                        <div className="create_expense_modal_parent_box_inner_box_input_box">
                            <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                                Date
                            </p>
                            <input 
                                onChange={this.handleFieldChange} 
                                name="date"
                                type="date" 
                                className="create_expense_modal_parent_box_inner_box_right_box_date_input">
                            </input>
                        </div>
                        <div className="create_expense_modal_parent_box_inner_box_input_box">
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
                        </div>
                        <div className="create_expense_modal_parent_box_inner_box_small_input_box">
                            <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                                Amount
                            </p>
                            <input 
                                onChange={this.handleFieldChange} 
                                name="amount"
                                type="text" 
                                placeholder="$" 
                                className="create_expense_modal_parent_box_inner_box_right_box_amount_input">
                            </input>
                        </div>
                        <div
                            onClick={() => this.setState({
                                pageToDisplay: upload_file,
                            })} 
                            className="create_expense_modal_button">
                            Continue
                        </div>
                    </div>
                );
            case upload_file:
                return (
                    <div>
                        <div className="create_expense_modal_info_text_box">
                            <p className="create_expense_modal_info_text_box_text">
                                <AiFillQuestionCircle className="create_expense_modal_info_text_box_icon"></AiFillQuestionCircle>
                                Upload any file associated with this expense. Eg: Receipt, Invoice, Proof of Funds, etc.
                            </p>
                            <div className="clearfix"/>
                            <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                                Attach a File
                            </p>
                        </div>                        
                        <label htmlFor="create_expense_modal_upload_file_button" className="create_expense_modal_upload_file_button_label">
                            {this.state.fileToUpload ? 
                            <div alt={this.state.fileToUpload["name"] ? this.state.fileToUpload["name"] : "Unknown File"}>
                                <div className="create_expense_modal_upload_file_button_icon_box">
                                    {mapFileTypeToIcon(this.state.fileToUpload["type"], false)}
                                    <p className="create_expense_modal_uploaded_file_name">
                                        {this.state.fileToUpload["name"] ? this.state.fileToUpload["name"] : "Unable to Upload File"}
                                    </p>
                                </div>
                            </div> : 
                            <div>
                                <MdFileUpload className="create_expense_modal_upload_file_icon"></MdFileUpload>
                                <p className="files_dashboard_upload_file_title">
                                    Choose File
                                </p>
                            </div>}
                        </label>
                        <input id="create_expense_modal_upload_file_button" type="file" onChange={this.handleFileUploadChange}></input>
                        <div
                            onClick={() => {
                                this.setState({
                                    pageToDisplay: associate_properties
                                })
                            }}
                            className="create_expense_modal_button">
                            Continue
                        </div>
                    </div>
                )
            case associate_properties:
                return (
                    <div>
                        <div className="create_expense_modal_info_text_box">
                            <p className="create_expense_modal_info_text_box_text">
                                <AiFillQuestionCircle className="create_expense_modal_info_text_box_icon"></AiFillQuestionCircle>
                                Add properties that this expense pertains to. This allows for even distribution of expenses across multiple properties and better overall calculations. If there are no properties associated with this expense, choose 'None'. 
                            </p>
                            <div className="clearfix"/>
                            <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                                Associated Properties
                            </p>
                        </div>                        
                        <DropdownSelect 
                            filteredList={this.state.filteredList}
                            data={{
                                state: {
                                    inputMap: this.state.properties,
                                    inputList: this.state.propertyAddresses,
                                    includeNone: true,
                                    includeAll: true,
                                    placeholderText: "Add a Property",
                                    setParentList: this.setParentList,
                                    closePotentialList: this.closePotentialList,
                                }
                            }}
                        />
                        <div
                            className="create_expense_modal_button">
                            Add Expense
                        </div>
                    </div>
                );
            default:
                return (
                    <div>
                    </div>
                );
        }
    }

    render() {
        return (
            <div>
                {this.state.isLoading? <div></div> :
                <div>
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
                            <div className="clearfix"/>
                            <div className="create_expense_modal_bottom_box">
                                <div className="create_expense_modal_nav_bar_box">
                                    <li 
                                        onClick={() => this.setState({
                                            pageToDisplay: general,
                                        })} 
                                        className={this.state.pageToDisplay === general ? 
                                            "create_expense_modal_nav_bar_list create_expense_modal_nav_bar_list_active" :
                                            "create_expense_modal_nav_bar_list"}>
                                        <IoSettingsSharp className="create_expense_modal_nav_bar_list_icon"></IoSettingsSharp>
                                        <p className="create_expense_modal_nav_bar_list_text">
                                            General
                                        </p>
                                    </li>
                                    <li 
                                        onClick={() => this.setState({
                                            pageToDisplay: upload_file,
                                        })} 
                                        className={this.state.pageToDisplay === upload_file ? 
                                            "create_expense_modal_nav_bar_list create_expense_modal_nav_bar_list_active" :
                                            "create_expense_modal_nav_bar_list"}>
                                        <GoFileDirectory className="create_expense_modal_nav_bar_list_icon"></GoFileDirectory>
                                        <p className="create_expense_modal_nav_bar_list_text">
                                            Upload File
                                        </p>
                                    </li>
                                    <li 
                                        onClick={() => this.setState({
                                            pageToDisplay: associate_properties,
                                        })} 
                                        className={this.state.pageToDisplay === associate_properties ? 
                                            "create_expense_modal_nav_bar_list create_expense_modal_nav_bar_list_active" :
                                            "create_expense_modal_nav_bar_list"}>
                                        <BsFillHouseFill className="create_expense_modal_nav_bar_list_icon"></BsFillHouseFill>
                                        <p className="create_expense_modal_nav_bar_list_text">
                                            Properties
                                        </p>
                                    </li>
                                </div>
                                <div className="create_expense_modal_actual_box">
                                    {this.renderViewBox()}
                                </div>
                            </div>
                            {/* 
                            <div className="create_expense_modal_parent_box_inner_box_left_box">
                                <p className="create_expense_modal_parent_box_inner_box_right_box_title">
                                    Associated Properties
                                </p>
                                <DropdownSelect data={{
                                    state: {
                                        inputMap: this.state.properties,
                                        inputList: this.state.propertyAddresses,
                                        includeNone: true,
                                        includeAll: true,
                                        placeholderText: "Add a Property",
                                        setParentList: this.setParentList,
                                    }
                                }}
                                />
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
                            <div className="clearfix"/> */}
                            
                        </div>
                    </div>
                    <div className="create_expense_modal_padding_bottom">
                    </div>
                </div>}
            </div>
        )
    }
}

export default CreateExpenseModal;