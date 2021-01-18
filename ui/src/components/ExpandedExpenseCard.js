import React from 'react';
import axios from 'axios';

import './CSS/ExpandedExpenseCard.css';
import './CSS/Style.css';

import { capitalizeName, numberWithCommas } from './MainDashboard.js';
import { convertDate } from './ExpensesDashboard.js';

import { trimTrailingName } from '../utility/Util.js';

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

class ExpandedExpenseCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            expense: this.props.data.state.expense,
            propertiesMap: this.props.data.state.propertiesMap,
            setActiveExpandedExpenseCard: this.props.data.state.setActiveExpandedExpenseCard,
            isLoading: true,
        };

        this.renderAssociatedPropertiesTags = this.renderAssociatedPropertiesTags.bind(this);
    }

    componentDidMount() {

        let userID = this.state.user["id"];
        let fileID = this.state.expense["file_id"];
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

    renderAssociatedPropertiesTags() {

        let expense = this.state.expense;
        let propertiesMap = this.state.propertiesMap;

        let properties = [];
        let expenseProperties = expense["properties"];

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
                    <p className="expanded_expense_card_title_text">
                        {capitalizeName(this.state.expense["title"])}
                    </p>
                    <IoCloseOutline 
                        onClick={() => this.state.setActiveExpandedExpenseCard(null)}
                        className="expanded_expense_card_title_box_close_icon"></IoCloseOutline>
                </div>
                <div className="expanded_expense_card_body_box">
                    <div className="expanded_expense_card_inner_body_box">
                        <div className="expanded_expense_card_body_left_box_element_box">
                            <IoCalendarClear className="expanded_expense_card_body_left_box_element_box_icon"></IoCalendarClear>
                            <p className="expanded_expense_card_body_left_box_element_box_text">
                                Date
                            </p>
                            <p className="expanded_expense_card_body_left_box_element_box_actual_text">
                                {convertDate(this.state.expense["date"])}
                            </p>
                        </div>
                        <div className="expanded_expense_card_body_left_box_element_box">
                            <IoCardSharp className="expanded_expense_card_body_left_box_element_box_icon"></IoCardSharp>
                            <p className="expanded_expense_card_body_left_box_element_box_text">
                                Amount
                            </p>
                            <p className="expanded_expense_card_body_left_box_element_box_actual_text">
                                ${numberWithCommas(this.state.expense["amount"])}
                            </p>
                        </div>
                        <div className="expanded_expense_card_body_left_box_element_box">
                            <IoFlag className="expanded_expense_card_body_left_box_element_box_icon"></IoFlag>
                            <p className="expanded_expense_card_body_left_box_element_box_text">
                                Frequency
                            </p>
                            <p className="expanded_expense_card_body_left_box_element_box_actual_text">
                                {capitalizeName(this.state.expense["frequency"])}
                            </p>
                        </div>
                        <div className="expanded_expense_card_body_left_box_element_box">
                            <IoDocumentTextSharp className="expanded_expense_card_body_left_box_element_box_icon"></IoDocumentTextSharp>
                            <p className="expanded_expense_card_body_left_box_element_box_text">
                                File
                            </p>
                            <p className="expanded_expense_card_body_left_box_element_box_actual_text">
                                {this.state.file && this.state.file["name"] ? trimTrailingName(this.state.file["name"], 20) : "None"}
                            </p>
                        </div>
                    </div>
                    {this.state.expense["properties"] ? 
                    <div className="expanded_expense_card_body_associated_properties_box">
                        <BsFillHouseFill className="expanded_expense_card_body_left_box_element_box_icon"></BsFillHouseFill>
                        <p className="expanded_expense_card_body_left_box_element_box_text">
                            Properties
                        </p>
                        <div className="clearfix"></div>
                        {this.renderAssociatedPropertiesTags()}
                    </div> : <div></div>}
                    <div className="expanded_expense_card_body_associated_properties_box">
                        <IoPaperPlane className="expanded_expense_card_body_left_box_element_box_icon"></IoPaperPlane>
                        <p className="expanded_expense_card_body_left_box_element_box_text">
                            Description
                        </p>
                        <div className="clearfix"></div>
                        <p className="expanded_expense_card_body_left_box_element_box_subtext">
                            {this.state.expense["description"]}
                        </p>
                    </div>
                    {/* <p className="expanded_expense_card_name_text expanded_expense_card_description_text">
                        {this.state.expense["description"]}
                    </p> */}

                    {/* <div className="expanded_expense_card_bullet_point_box">
                        <IoCalendarClearSharp className="expanded_expense_card_bullet_point_box_icon"></IoCalendarClearSharp>
                        <p className="expanded_expense_card_bullet_point_box_text">
                            {convertDate(this.state.expense["date"])}
                        </p>
                    </div>
                    <div className="expanded_expense_card_bullet_point_box">
                        <IoArrowRedoSharp className="expanded_expense_card_bullet_point_box_icon"></IoArrowRedoSharp>
                        <p className="expanded_expense_card_bullet_point_box_text">
                            {capitalizeName(this.state.expense["frequency"])}
                        </p>
                    </div>
                    <div className="expanded_expense_card_bullet_point_box">
                        <FaMoneyCheck className="expanded_expense_card_bullet_point_box_icon"></FaMoneyCheck>
                        <p className="expanded_expense_card_bullet_point_box_text">
                            ${numberWithCommas(this.state.expense["amount"])}
                        </p>
                    </div> */}
                </div>
            </div>
        );
    }
}

export default ExpandedExpenseCard;