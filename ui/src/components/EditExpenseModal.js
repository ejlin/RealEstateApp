import React from 'react';
import axios from 'axios';

import './CSS/EditExpenseModal.css';
import './CSS/Style.css';

import DropdownSelect from './DropdownSelect.js';
import Loader from './Loader.js';
import { mapFileTypeToIcon } from './FilesDashboard.js';

import { IoCloseOutline } from 'react-icons/io5';
import { AiFillQuestionCircle} from 'react-icons/ai';
import { MdFileUpload } from 'react-icons/md';

import { capitalizeName } from '../utility/Util.js'; 

const All = "All";
const None = "None";

const file = "file";
const title = "title";
const description = "description";
const amount = "amount";
const date = "date";
const frequency = "frequency";
const properties = "properties";

let URLBuilder = require('url-join');
const once = "Once";

const frequencyOptions = ['Once', 'Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Semi-Annually', 'Annually'];

const getByValue = (map, searchValue) => {
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
    return null;
}

class EditExpenseModal extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            expense: this.props.data.state.expense,
            closeEditExpenseModal: this.props.data.state.closeEditExpenseModal,
            // user: this.props.data.state.user,

            // // propertiesMap maps propertyID to propertyAddress
            // propertiesMap: this.props.data.state.propertiesMap,
            // propertiesAddresses: Array.from(this.props.data.state.propertiesMap.values()),

            // currSelectedAssociatedProperties: [],
            // addExpense: this.props.data.state.addExpense,
            // closeEditExpenseModal: this.props.data.state.closeEditExpenseModal,

            // // By default, make the frequency once. We need to set the default here because we only handle onChange
            // frequency: once,
            // fileToUpload: null,
            // filteredList: [],
            // loadAddExpense: false,
        };
        // this.handleFieldChange = this.handleFieldChange.bind(this);
        // this.verifyAndAddExpense = this.verifyAndAddExpense.bind(this);
        // this.setParentList = this.setParentList.bind(this);
        // this.renderViewBox = this.renderViewBox.bind(this);
        // this.handleFileUploadChange = this.handleFileUploadChange.bind(this);
    }

    componentDidMount() {
        document.body.addEventListener('click', this.setState({
            filteredList: [],
        }));
    }

    // componentWillUnmount() {
    //     document.body.removeEventListener('click', this.setState({
    //         filteredList: [],
    //     }));
    // }

    // // handleFileUploadChange will reset our state.file value in the case the user changes the file to upload.
    // handleFileUploadChange(event) {
    //     let file = event.target.files[0];
    //     if (file !== null && file !== undefined) {
    //         this.setState({
    //             fileToUpload: file
    //         })
    //     }
    // }

    // handleFieldChange(e) {
    //     this.setState({ 
    //         [e.target.name]: e.target.value
    //      })
    // }

    // setParentList(properties) {
    //     this.setState({
    //         currSelectedAssociatedProperties: properties,
    //     })
    // }

    // verifyAndAddExpense() {
        
    //     // TODO: verify expense
    //     let expense = new FormData();
    //     expense.append(file, this.state.fileToUpload);
    //     expense.append(title, this.state.title);
    //     expense.append(description, this.state.description);
    //     expense.append(date, this.state.date);
    //     expense.append(amount, this.state.amount);
    //     expense.append(frequency, this.state.frequency);

    //     let currSelectedAssociatedProperties = this.state.currSelectedAssociatedProperties;
    //     let indexAll = currSelectedAssociatedProperties.indexOf(All);
    //     let indexNone = currSelectedAssociatedProperties.indexOf(None);

    //     let associatedProperties = [];
    //     let propertiesMap = this.state.propertiesMap;

    //     console.log(propertiesMap);

    //     if (indexAll >= 0) {
    //         // Add all of our properties.
    //         propertiesMap.forEach((value, key, map) => {
    //             // Add our propertyIDs
    //             associatedProperties.push(key);
    //         })
    //     } else if (indexNone >= 0) {
    //     } else {
    //         // Add all the ids of the properties selected.
    //         for (let i = 0; i < currSelectedAssociatedProperties.length; i++) {
    //             let currSelectedAssociatedProperty = currSelectedAssociatedProperties[i];
    //             console.log(currSelectedAssociatedProperty);
    //             let propertyID = getByValue(propertiesMap, currSelectedAssociatedProperty);
    //             if (propertyID !== null){
    //                 associatedProperties.push(propertyID);
    //             } else {
    //                 associatedProperties.push("None");
    //             }
    //         }
    //     }   

    //     expense.append(properties, associatedProperties);
    //     this.setState({
    //         loadAddExpense: true,
    //     })
    //     this.state.addExpense(expense);
    // }      

    renderFrequencyOptions() {

        let currFrequency = capitalizeName(this.state.expense["frequency"] ? this.state.expense["frequency"] : "Once"); 

        let options = [];
        options.push(
            <option>
                {currFrequency}
            </option>
        );
        for (let i = 0; i < frequencyOptions.length; i++) {
            let frequencyOption = frequencyOptions[i];
            if (frequencyOption != currFrequency) {
                options.push(
                    <option>
                        {frequencyOption}
                    </option>
                );
            }
    
        }
        return options;
    }

    renderViewBox() {
        return (
            <div>
                <input 
                    onChange={this.handleFieldChange} 
                    name="title" 
                    maxLength="30"
                    placeholder={this.state.expense["title"]}
                    className="edit_expense_modal_parent_box_title_input">
                </input>
                <textarea 
                    onChange={this.handleFieldChange} 
                    name="description"
                    maxLength="300" 
                    placeholder={this.state.expense["description"]}
                    className="edit_expense_modal_parent_box_title_textarea">
                </textarea>
                <div className="edit_expense_modal_parent_box_inner_box_input_box">
                    <p className="edit_expense_modal_parent_box_inner_box_right_box_title">
                        Date
                    </p>
                    <input 
                        onChange={this.handleFieldChange} 
                        name="date"
                        type="date" 
                        placeholder="2020/01/01"
                        className="edit_expense_modal_parent_box_inner_box_right_box_date_input">
                    </input>
                </div>
                <div className="edit_expense_modal_parent_box_inner_box_input_box">
                    <p className="edit_expense_modal_parent_box_inner_box_right_box_title">
                        Frequency
                    </p>
                    <select 
                        onChange={this.handleFieldChange} 
                        name="frequency"
                        className="edit_expense_modal_parent_box_inner_box_right_box_date_select">
                        {this.renderFrequencyOptions()}
                    </select>
                </div>
                <div className="edit_expense_modal_parent_box_inner_box_input_box">
                    <p className="edit_expense_modal_parent_box_inner_box_right_box_title">
                        Amount
                    </p>
                    <input 
                        onChange={this.handleFieldChange} 
                        name="amount"
                        type="text" 
                        placeholder={"$" + this.state.expense["amount"]}
                        className="edit_expense_modal_parent_box_inner_box_right_box_amount_input">
                    </input>
                </div>
                <div className="edit_expense_modal_info_text_box">
                    <p className="edit_expense_modal_parent_box_inner_box_right_box_title">
                        File
                    </p>
                </div>                        
                <label htmlFor="edit_expense_modal_upload_file_button" className="edit_expense_modal_upload_file_button_label">
                    {this.state.fileToUpload ? 
                    <div alt={this.state.fileToUpload["name"] ? this.state.fileToUpload["name"] : "Unknown File"}>
                        <div className="edit_expense_modal_upload_file_button_icon_box">
                            {mapFileTypeToIcon(this.state.fileToUpload["type"], "medium", false)}
                            <p className="edit_expense_modal_uploaded_file_name">
                                {this.state.fileToUpload["name"] ? this.state.fileToUpload["name"] : "Unable to Upload File"}
                            </p>
                        </div>
                    </div> : 
                    <div>
                        <MdFileUpload className="edit_expense_modal_upload_file_icon"></MdFileUpload>
                        <p className="edit_expense_modal_upload_file_title">
                            Choose File
                        </p>
                    </div>}
                </label>
                <input id="edit_expense_modal_upload_file_button" type="file" onChange={this.handleFileUploadChange}></input>
                <div className="clearfix"/>
                <div className="edit_expense_modal_info_text_box">
                    <div className="clearfix"/>
                    <p className="edit_expense_modal_parent_box_inner_box_right_box_title">
                        Associated Properties
                    </p>
                </div>                        
                {/* <DropdownSelect 
                    data={{
                        state: {
                            inputMap: this.state.propertiesMap,
                            inputList: this.state.propertiesAddresses,
                            includeNone: true,
                            includeAll: true,
                            placeholderText: "Add a Property",
                            closePotentialList: this.closePotentialList,
                            setParentList: this.setParentList,
                        }
                    }}
                /> */}
                <div
                    onClick={() => this.verifyAndAddExpense()}
                    className={this.state.loadAddExpense ? "edit_expense_modal_button loading_button" :
                        "edit_expense_modal_button"}>
                    {this.state.loadAddExpense ? 
                    <Loader data={{
                        state: {
                            class: "",
                        }
                    }}/> :
                    "Save"}
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                <div className="edit_expense_modal_parent_box">
                    <div className="edit_expense_modal_parent_box_title_box">
                        <IoCloseOutline 
                            onClick={() => {
                                this.state.closeEditExpenseModal();
                            }}
                            className="edit_expense_modal_parent_box_title_box_close_icon"></IoCloseOutline>
                    </div>
                    <div className="edit_expense_modal_parent_box_inner_box">
                        <p className="edit_expense_modal_parent_box_title">
                            Edit Expense 
                        </p>
                        <div className="clearfix"/>
                        <div className="edit_expense_modal_bottom_box">
                            {this.renderViewBox()}
                        </div>
                    </div>
                </div>
                <div className="edit_expense_modal_padding_bottom">
                </div>
            </div>
        )
    }
}

export default EditExpenseModal;