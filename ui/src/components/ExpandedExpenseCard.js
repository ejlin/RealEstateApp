import React from 'react';
import axios from 'axios';

import './CSS/ExpandedExpenseCard.css';
import './CSS/Style.css';

import { capitalizeName } from '../utility/Util.js'; 

import { numberWithCommas } from './MainDashboard.js';
import { convertDate } from './ExpensesDashboard.js';

import DropdownSelect from './DropdownSelect.js';

import { trimTrailingName } from '../utility/Util.js';

import { MdEdit } from 'react-icons/md';

import { IoMdAttach } from 'react-icons/io';
import { IoTrashSharp } from 'react-icons/io5';

import { 
    IoCalendarClearSharp, 
    IoCloseOutline, 
    IoArrowRedoSharp, 
    IoCalendarClear, 
    IoCardSharp, 
    IoDocumentTextSharp, 
    IoAttachSharp,
    IoFlag,
    IoPaperPlane } from 'react-icons/io5';
import { BsFillHouseFill } from 'react-icons/bs';

let URLBuilder = require('url-join');

const frequencyOptions = ['Once', 'Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Semi-Annually', 'Annually'];

class ExpandedExpenseCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            expense: this.props.data.state.expense,
            propertiesMap: this.props.data.state.propertiesMap,
            setActiveExpandedExpenseCard: this.props.data.state.setActiveExpandedExpenseCard,
            editInputs: false,
            isLoading: true,
        };

        this.handleFileUploadChange = this.handleFileUploadChange.bind(this);
        this.renderAssociatedPropertiesTags = this.renderAssociatedPropertiesTags.bind(this);
        this.renderFrequencyOptions = this.renderFrequencyOptions.bind(this);
    }

    componentDidMount() {

        let userID = this.state.user["id"];
        let fileID = this.state.expense["file_id"];
        console.log(fileID);
        if (fileID !== null && fileID !== undefined && fileID !== "") {
            let getFileURL = URLBuilder('api/user/files/', userID, fileID);

            const getFileRequest = axios.get(getFileURL);
    
            axios.all(
                [getFileRequest]
            ).then(axios.spread((...responses) => {
                const fileRequestResponse = responses[0];
    
                // Response is an object with
                // [id, name, created_at, last_modified_at, get_signed_url]
                let file = fileRequestResponse.data;
    
                this.setState({
                    file: file,
                    isLoading: false,
                })
            })).catch(errors => {
                console.log(errors);
            });
        }
    }

    // handleFileUploadChange will reset our state.file value in the case the user changes the file to upload.
    handleFileUploadChange(event) {
        var file = event.target.files[0];
        if (file !== null && file !== undefined) {
            this.setState({
                fileToUpload: file
            })
        }
    }

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

    renderAssociatedPropertiesTags() {

        let expense = this.state.expense;
        let propertiesMap = this.state.propertiesMap;

        let properties = [];
        let expenseProperties = expense["properties"];
        if (!expenseProperties) {
            properties.push(
                <div className="expanded_expense_card_property_tag">
                    <p className="expanded_expense_card_property_tag_text">
                        None
                    </p>
                </div>
            );
            return properties;
        }

        for (let i = 0; i < expenseProperties.length; i++) {
            let propertyID = expenseProperties[i];
            // Only add if we can map a property id to an address.
            if (propertiesMap.has(propertyID)) {
                let address = propertiesMap.get(propertyID);
                properties.push(
                    <div className="expanded_expense_card_property_tag">
                        <p className="expanded_expense_card_property_tag_text">
                            {trimTrailingName(address, 18)}
                        </p>
                        {
                            this.state.editInputs ?
                            <IoTrashSharp className="expanded_expense_card_property_tag_trash_can_icon"></IoTrashSharp>:
                            <div></div>
                        }
                    </div>
                );
            }
        }

        return properties;
    }

    render() {
        return (
            <div className="expanded_expense_card_box" key={"active_expanded_expense_card"}>
                <div className="expanded_expense_card_title_box">
                    {
                        this.state.editInputs ? 
                        <input 
                            placeholder={capitalizeName(this.state.expense["title"])}
                            className="expanded_expense_title_input">
                        </input> :
                        <p className="expanded_expense_card_title_text">
                            {capitalizeName(this.state.expense["title"])}
                        </p>
                    }
                    <IoCloseOutline 
                        onClick={() => this.state.setActiveExpandedExpenseCard(null)}
                        className="expanded_expense_card_title_box_close_icon"></IoCloseOutline>
                    <p onClick={() => {
                            if (this.state.editInputs) {
                                this.setState({
                                    fileToUpload: null,
                                })
                            }
                            this.setState({
                                editInputs: !this.state.editInputs,
                            })
                        }} 
                        className="expanded_expense_card_title_box_edit_icon">
                        {
                            this.state.editInputs ? 
                            "Cancel":
                            "Edit"
                        }
                    </p>
                </div>
                <div className="expanded_expense_card_body_box">
                    <div className="expanded_expense_card_inner_body_box">
                        <div className="expanded_expense_card_body_left_box_element_box">
                            <IoCalendarClear className="expanded_expense_card_body_left_box_element_box_icon"></IoCalendarClear>
                            <p className="expanded_expense_card_body_left_box_element_box_text">
                                Date
                            </p>
                            {
                                this.state.editInputs ? 
                                <input 
                                    type="date"
                                    className="expanded_expense_card_body_amount_input">
                                </input> :
                                <p className="expanded_expense_card_body_left_box_element_box_actual_text">
                                    {convertDate(this.state.expense["date"])}
                                </p>
                            }
                            
                        </div>
                        <div className="expanded_expense_card_element_divider"></div>
                        <div className="expanded_expense_card_body_left_box_element_box">
                            <IoCardSharp className="expanded_expense_card_body_left_box_element_box_icon"></IoCardSharp>
                            <p className="expanded_expense_card_body_left_box_element_box_text">
                                Amount
                            </p>
                            {
                                this.state.editInputs ? 
                                <input 
                                    placeholder={"$" + numberWithCommas(this.state.expense["amount"])}
                                    className="expanded_expense_card_body_amount_input">
                                </input> :
                                <p className="expanded_expense_card_body_left_box_element_box_actual_text">
                                    ${numberWithCommas(this.state.expense["amount"])}
                                </p>
                            }
                            
                        </div>
                        <div className="expanded_expense_card_element_divider"></div>
                        <div className="expanded_expense_card_body_left_box_element_box">
                            <IoFlag className="expanded_expense_card_body_left_box_element_box_icon"></IoFlag>
                            <p className="expanded_expense_card_body_left_box_element_box_text">
                                Frequency
                            </p>
                            {
                                this.state.editInputs ?
                                <select 
                                    onChange={this.handleFieldChange} 
                                    name="frequency"
                                    className="expanded_expense_card_body_frequency_input">
                                    {this.renderFrequencyOptions()}
                                </select> : 
                                <p className="expanded_expense_card_body_left_box_element_box_actual_text">
                                    {capitalizeName(this.state.expense["frequency"])}
                                </p>
                            }
                        </div>
                        <div className="expanded_expense_card_element_divider"></div>
                        <div className="expanded_expense_card_body_left_box_element_box">
                            <IoDocumentTextSharp className="expanded_expense_card_body_left_box_element_box_icon"></IoDocumentTextSharp>
                            <p className="expanded_expense_card_body_left_box_element_box_text">
                                File
                            </p>
                            <p 
                                onClick={() => {
                                    if (this.state.file && this.state.file["get_signed_url"] && !this.state) {
                                        let url = this.state.file["get_signed_url"];
                                        if (url !== "") {
                                            window.open(url, '_blank', 'noopener,noreferrer')
                                        }
                                    } 
                                }}
                                className={
                                    this.state.file && this.state.file["name"] ?
                                    "expanded_expense_card_body_left_box_element_box_actual_text expanded_expense_card_file_link" :
                                    "expanded_expense_card_body_left_box_element_box_actual_text"
                                }>
                                <input id="expanded_expense_card_upload_file_button" type="file" onChange={this.handleFileUploadChange}></input>
                                {
                                    this.state.file && this.state.file["name"] ? 
                                    (
                                        this.state.editInputs ? 
                                        (
                                            <div>
                                                <label htmlFor="expanded_expense_card_upload_file_button" className="expanded_expense_card_attach_file_button">
                                                    {
                                                        this.state.fileToUpload ? 
                                                        <p className="expense_card_attach_file_text">
                                                            {trimTrailingName(this.state.fileToUpload["name"], 20)}
                                                        </p>:
                                                        <div>
                                                            <IoMdAttach className="expanse_card_attach_file_icon"></IoMdAttach>
                                                            <p className="expense_card_attach_file_text">
                                                                Change File
                                                            </p>
                                                        </div>
                                                    }
                                                </label>
                                            </div>
                                        ):
                                        trimTrailingName(this.state.file["name"], 20) 
                                    ): 
                                    (
                                        this.state.editInputs ?
                                        (
                                            <div>
                                                <label htmlFor="expanded_expense_card_upload_file_button" className="expanded_expense_card_attach_file_button">
                                                    {
                                                        this.state.fileToUpload ? 
                                                        <p className="expense_card_attach_file_text">
                                                            {trimTrailingName(this.state.fileToUpload["name"], 20)}
                                                        </p>:
                                                        <div>
                                                            <IoMdAttach className="expanse_card_attach_file_icon"></IoMdAttach>
                                                            <p className="expense_card_attach_file_text">
                                                                Attach a File
                                                            </p>
                                                        </div>
                                                    }
                                                </label>
                                            </div>
                                        ):
                                        "None"
                                    )
                                }
                            </p>
                        </div>
                        <div className="expanded_expense_card_element_divider"></div>
                    </div>
                    <div className="expanded_expense_card_body_associated_properties_box">
                        <BsFillHouseFill className="expanded_expense_card_body_left_box_element_box_icon"></BsFillHouseFill>
                        <p className="expanded_expense_card_body_left_box_element_box_text">
                            Properties
                        </p>
                        <div className="clearfix"></div>
                        {this.renderAssociatedPropertiesTags()}
                        {
                            this.state.editInputs ?
                            <DropdownSelect 
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
                            />:
                            <div></div>
                        }
                        <div className="clearfix"/>
                    </div>
                    <div className="clearfix"/>
                    <div className="expanded_expense_card_element_divider"></div>         
                    <div className="expanded_expense_card_body_associated_properties_box">
                        <IoPaperPlane className="expanded_expense_card_body_left_box_element_box_icon"></IoPaperPlane>
                        <p className="expanded_expense_card_body_left_box_element_box_text">
                            Description
                        </p>
                        <div className="clearfix"></div>
                        {
                            this.state.editInputs ?
                            <textarea 
                                placeholder={this.state.expense["description"]}
                                className="expanded_expense_card_body_textarea_input"
                            ></textarea> :
                            <p className="expanded_expense_card_body_left_box_element_box_subtext">
                                {this.state.expense["description"]}
                            </p>
                        }
                    </div>
                    {
                        this.state.editInputs ?
                        <div className="expanded_expense_card_save_edits_button">
                            Save
                        </div>:
                        <div></div>
                    }
                </div>
            </div>
        );
    }
}

export default ExpandedExpenseCard;