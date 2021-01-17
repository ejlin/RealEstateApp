import React from 'react';
import axios from 'axios';

import './CSS/ExpandedExpenseCard.css';
import './CSS/Style.css';

import { capitalizeName, numberWithCommas } from './MainDashboard.js';
import { convertDate } from './ExpensesDashboard.js';

import { 
    IoCalendarClearSharp, 
    IoCloseOutline, 
    IoArrowRedoSharp, 
    IoCalendarClear, 
    IoCardSharp, 
    IoDocumentTextSharp, 
    IoAttachSharp,
    IoFlag } from 'react-icons/io5';
import { SiGooglecalendar } from 'react-icons/si';
import { FaMoneyCheck } from 'react-icons/fa';

let URLBuilder = require('url-join');

class ExpandedExpenseCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            expense: this.props.data.state.expense,
            setActiveExpandedExpenseCard: this.props.data.state.setActiveExpandedExpenseCard,
        };
    }

    componentDidMount() {

        let userID = this.state.user["id"];
        let getPropertiesListURL = URLBuilder('api/user/property/', userID);

        const getPropertiesRequest = axios.get(getPropertiesListURL);
        const getExpensesRequest = axios.get(getExpensesListURL);

        axios.all(
            [getPropertiesRequest, getExpensesRequest]
        ).then(axios.spread((...responses) => {
            const propertiesRequestReponse = responses[0];
            const expensesRequestResponse = responses[1];

            /* Handle our properties response */
            let propertiesList = propertiesRequestReponse.data;
            let propertiesMap = new Map();
            for (let i = 0; i < propertiesList.length; i++) {
                let property = propertiesList[i];
                let propertyID = property["id"];
                let propertyAddress = property["address"];
                propertiesMap.set(propertyID, propertyAddress);
            }
            /* Set 'None' and 'All' to handle cases where expenses are not mapped to any/are mapped to all properties */
            propertiesMap.set("None", "None");
            propertiesMap.set("All", "All");

            /* Handle our expenses response */
            let expensesMap = new Map();
            // response.data is an array of expenses. Order them by property IDs -> expenses.
            let expenses = expensesRequestResponse.data.sort(
                this.getSortFunction(this.state.currFieldToggledDirectionIsUp, this.state.currFieldToggled)
            );
            for (let i = 0; i < expenses.length; i++) {
                let expense = expenses[i];
                expensesMap.set(expense["id"], expense);
            }

            this.setState({
                propertiesMap: propertiesMap,
                expenses: expenses,
                expensesMap: expensesMap,
                isLoading: false
            });
        })).catch(errors => {
            console.log(errors);
        });
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
                                {this.state.expense["file_id"]}
                            </p>
                        </div>
                    </div>
                    <div className="expanded_expense_card_body_right_box">

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