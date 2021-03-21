import React from 'react';
import axios from 'axios';

import './CSS/ExpensesTable.css';
import './CSS/Style.css';

import CreateExpenseModal from './CreateExpenseModal.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import ExpenseCard from './ExpenseCard.js';
import ExpandedExpenseCard from './ExpandedExpenseCard.js';

import { BsArrowUp } from 'react-icons/bs';
import { RiErrorWarningFill } from 'react-icons/ri';

export function convertDate(date){

    date = date.split("T")[0];

    let split = date.split("-");

    let day = split[2];
    let month = split[1];
    let year = split[0];

    return month + "/" + day + "/" + year;
}

let URLBuilder = require('url-join');

// sortByStringField is a custom sort comparator function that allows us to sort our
// elements according to the field we want if the field is a string. 
function sortByStringField(isUp, field){
    return function(x, y) {
        return isUp ? x[field].localeCompare(y[field]) : y[field].localeCompare(x[field]);
    }
}

// sortByStringSliceField is a custom sort comparator function that allows us to sort our
// elements according to the field we want if the field is a string slice. 
function sortByStringSliceField(isUp, field){
    return function(x, y) {
        if (x[field] === undefined || y[field] === undefined) {
            return isUp ? 1 : -1;
        }
        
        if (x[field].length === 0 || y[field].length === 0){
            return x[field].length - y[field].length;
        }
        if (x.length !== y.length) {
            if (x.length > y.length) {
                return isUp ? 1 : -1;
            } else if (x.length < y.length) {
                return isUp ? -1 : 1;
            }
            return 0;
        }
        let fieldX = x[field][0];
        let fieldY = y[field][0];
        return isUp ? fieldX.localeCompare(fieldY) : fieldY.localeCompare(fieldX);
    }
}

function sortByTimeField(isUp, field) {
    return function(x, y) {
        let xDate = new Date(x[field]);
        let yDate = new Date(y[field]);
        console.log(xDate);
        console.log(yDate);
        if (xDate > yDate) {
            return isUp ? 1 : -1;
        } else if (xDate < yDate) {
            return isUp ? -1 : 1;
        }
        return 0;
    }
}

function sortByFrequencyField(isUp, field){
    return function(x, y) {

        let order = ['once', 'daily', 'weekly', 'bi-weekly', 'monthly', 'semi-annually', 'annually'];
        console.log(x[field]);
        console.log(y[field]);
        let xIdx = order.indexOf(x[field]);
        let yIdx = order.indexOf(y[field]);

        if (xIdx < yIdx) {
            return isUp? -1 : 1;
        } else if (xIdx > yIdx) {
            return isUp? 1 : -1;
        }
        return 0;
    }
}

function sortByNumField(isUp, field){
    return function(x, y) {
        if (x[field] > y[field]){
            return isUp ? 1 : -1;
        } else if (x[field] < y[field]){
            return isUp ? -1 : 1;
        } else {
            return 0;
        }
    }
}

const title = "title";
const properties = "properties";
const frequency = "frequency";
const date = "date";
const amount = "amount";
const defaultFieldToggled = "last_modified_at";

class ExpensesTable extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            expenses: this.props.data.state.expenses,
            expensesMap: this.props.data.state.expensesMap,
            propertiesMap: this.props.data.state.propertiesMap,
            isSpecificProperty: this.props.data.state.isSpecificProperty,
            specificPropertyAddress: this.props.data.state.specificPropertyAddress,
            setActiveExpandedExpenseCard: this.props.data.state.setActiveExpandedExpenseCard,
            displayAddExpense: this.props.data.state.displayAddExpense,
            host: window.location.protocol + "//" + window.location.host,
        };
        this.displayEditExpenseModal = this.displayEditExpenseModal.bind(this);
        this.expenseFormDataToExpense = this.expenseFormDataToExpense.bind(this);
        this.deleteExpense = this.deleteExpense.bind(this);
        this.renderExpenseTableElements = this.renderExpenseTableElements.bind(this);
        this.setToggleFields = this.setToggleFields.bind(this);
        this.getSortFunction = this.getSortFunction.bind(this);
        this.handleSearchBar = this.handleSearchBar.bind(this);
        this.renderActiveSearchExpenses = this.renderActiveSearchExpenses.bind(this);
        this.renderNoExpenses = this.renderNoExpenses.bind(this);
        this.convertExpenseToExpenseCard = this.convertExpenseToExpenseCard.bind(this);
        this.setActiveExpandedExpenseCard = this.setActiveExpandedExpenseCard.bind(this);
        this.renderPageLoadingView = this.renderPageLoadingView.bind(this);
    }

    /* We make two API requests when our component mounts. We make an api call to return the list of
     * properties associated with the user. We also make an API request to return the list of
     * expenses associated with the user.
     */
    componentDidMount() {
    }

    handleSearchBar(e) {
        let searchValue = e.target.value.toLowerCase().replace(/\s/g, "");
        this.setState({
            activeSearchExpenses: this.state.expenses.filter(expense => {
                return expense["title"].toLowerCase().replace(/\s/g, "").startsWith(searchValue);
            })
        })
    }

    expenseFormDataToExpense(expenseFormData) {
        let object = [];
        for (const [key, value]  of expenseFormData) {
            object[key] = value;
        }
        return object;
    }

    setActiveExpandedExpenseCard(expense) {
        this.state.setActiveExpandedExpenseCard(expense);
    }

    deleteExpense(expenseID) {

        let userID = this.state.user["id"];
        let host = this.state.host;
        let deleteExpenseURL = URLBuilder(host, 'api/user/expenses/', userID, expenseID);
        
        axios({
            method: 'delete',
            url: deleteExpenseURL,
        }).then(response => {
            let expensesMap = this.state.expensesMap;
            expensesMap.delete(expenseID);

            this.setState({
                expensesMap: expensesMap,
            })
        }).catch(error => {
            console.log(error)
        })
    }

    displayEditExpenseModal(expense) {
        this.setState({
            expenseToEdit: expense,
        })
    }

    setToggleFields(field) {
        // This is a state machine. If the currFieldToggled is not this field,
        // set it to be in the "UP" direction. If it already is and in the "UP" direction,
        // then we set it to be the "DOWN" direction. If it is already in the "DOWN" direction,
        // then we set it to be the default (allow the user to cycle back to the original state). 
        if (this.state.currFieldToggled !== field) {
            this.setState({
                currFieldToggledDirectionIsUp: true,
                currFieldToggled: field,
            })
        } else {
            if (this.state.currFieldToggledDirectionIsUp) {
                this.setState({
                    currFieldToggledDirectionIsUp: false,
                    currFieldToggled: field,
                })
            } else {
                this.setState({
                    currFieldToggledDirectionIsUp: true,
                    currFieldToggled: defaultFieldToggled,
                })
            }
            
        } 
    }

    getSortFunction(field, isUp) {
        switch(field) {
            case title:
                return sortByStringField(isUp, field);
            case date:
                return sortByTimeField(isUp, field);
            case frequency:
                return sortByFrequencyField(isUp, field);
            case properties: 
                return sortByStringSliceField(isUp, field);
            case amount:
            case defaultFieldToggled:
                return sortByNumField(isUp, field);
            default: 
        }
    }

    renderExpenseTableElements() {

        let expensesMap = this.state.expensesMap;
        // We need to sort our expensesMap by the current user selection.
        let sortFn = this.getSortFunction(this.state.currFieldToggled, this.state.currFieldToggledDirectionIsUp);
        // let sortedExpensesArr = expensesMap.entries().sort(sortFn);
        let expensesArr = [];
        expensesMap.forEach((expense, expenseID, map) => {
            expensesArr.push(expense);
        })

        let elements = [];

        let expenses = expensesArr.sort(sortFn);

        for (let i = 0; i < expenses.length; i++) {
            let expense = expenses[i];

            let expenseCard = this.convertExpenseToExpenseCard(expense);
            elements.push(expenseCard);
        }
        if (elements.length > 0 ) {
            return elements;
        }
        return this.renderNoExpenses();
    }

    convertExpenseToExpenseCard(expense) {
        let expenseProperties = expense["properties"] ? expense["properties"] : ["None"];
        let propertiesMap = this.state.propertiesMap;


        let properties = [];

        // If this is for a specific property, just put the property's address here.
        if (this.state.isSpecificProperty && this.state.specificPropertyAddress) {
            properties.push(
                <p className="expenses_table_first_row_subtitle">
                    {this.state.specificPropertyAddress}
                </p>
            )
        } else {
            if (expenseProperties.length > 0) {
                // 2 are for "None" and "All". It means all the properties were added.
                if (expenseProperties.length === propertiesMap.size - 2) {
                    properties.push(
                        <p className="expenses_table_first_row_subtitle">
                            {"All"}
                        </p>
                    );
                } else {
                    /* If we have more than 5 associated properties, only show the first 5 */
                    let maxLength = expenseProperties.length < 5 ? expenseProperties.length : 5;
                    for (let j = 0; j < maxLength; j++) {
                        let expensePropertyID = expenseProperties[j];
                        properties.push(
                            <p className="expenses_table_first_row_subtitle">
                                {propertiesMap.has(expensePropertyID) ? propertiesMap.get(expensePropertyID) : "None"}
                            </p>
                        );
                    }
                    /* If we have more than 5 associated properties, only show the first 5 and show an element saying "more" */
                    if (expenseProperties.length > maxLength) {
                        properties.push(
                            <p className="expenses_table_first_row_subtitle">
                                {"More..."}
                            </p>
                        )
                    }
                }
            } else {
                properties.push(
                    <p className="expenses_table_first_row_subtitle">
                        {"None"}
                    </p>
                );
            }
        }
        
        return (
            <ExpenseCard key={expense["id"]} data={{
                state: {
                    properties: properties,
                    expense: expense,
                    deleteExpense: this.deleteExpense,
                    displayEditExpenseModal: this.displayEditExpenseModal,
                    setActiveExpandedExpenseCard: this.setActiveExpandedExpenseCard,
                }
            }}/>
        );
    }

    renderActiveSearchExpenses() {
        if (this.state.activeSearchExpenses && this.state.activeSearchExpenses.length > 0){
            let activeSearchExpenses = this.state.activeSearchExpenses;
            let elements = [];
            for (let i = 0; i < activeSearchExpenses.length; i++) {
                let activeSearchExpense = activeSearchExpenses[i];
                elements.push(this.convertExpenseToExpenseCard(activeSearchExpense));
            }
            return elements;
        }
        return this.renderNoExpenses();
    }

    renderNoExpenses() {
        return (
            <div style={{
                borderRadius: "8px",
                height: "50px",
                marginBottom: "20px",
                marginTop: "100px",
                padding: "10px 0px 10px 0px",
                position: "relative",
                textAlign: "center",
                width: "100%",
            }}>
                {/* <RiErrorWarningFill className="expenses_dashboard_body_inner_box_no_expenses_inner_box_icon"></RiErrorWarningFill> */}
                <p style={{
                    color: "black",
                    fontSize: "1.1em",
                    marginLeft: "calc((100% - 120px)/2)",
                    marginTop: "0px",
                    width: "120px",
                }}>
                    No Expenses
                </p>
                <div 
                    onMouseDown={() => {this.state.displayAddExpense()}}
                    className="opacity"
                    style={{
                        backgroundColor: "#296cf6",
                        borderRadius: "50px",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.10), 0 6px 10px 0 rgba(0, 0, 0, 0.09)",
                        cursor: "pointer",
                        display: "inline-block",
                        marginTop: "15px",
                        padding: "7.5px 15px 7.5px 15px",
                    }}>
                    <p style={{
                        color: "white",
                    }}>
                        Add an Expense to Start
                    </p>
                </div>
            </div>
        )
    }

    renderPageLoadingView() {
        return (
            <div className="expenses_dashboard_body_inner_box">
                <div className="expenses_dashboard_body_inner_box_most_recent_box">
                <div className="expenses_table">
                    <div className="expenses_table_title_row">
                        
                    </div>
                </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div style={{
                backgroundColor: "white",
                // boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                borderRadius: "10px",
                float: "left",
                minHeight: "650px",
                minWidth: "1000px",
                paddingBottom: "25px",
                overflowX: "scroll",
                overflowY: "hidden",
                width: "100%",
            }}>
                <div className="expenses_table_title_row">
                    <div className="expenses_table_down_icon_box">
                    </div>
                    <div className="expenses_table_first_row_long">
                        <p className="expenses_table_first_row_title">
                            Name
                        </p>
                        <BsArrowUp 
                            onClick={() => {
                                this.setToggleFields(title);
                            }}
                            className={this.state.currFieldToggled === title && this.state.currFieldToggledDirectionIsUp ?
                                "expenses_table_arrow_icon toggled_icon"
                                : "expenses_table_arrow_icon"}></BsArrowUp>
                    </div>
                    <div className="expenses_table_first_row_long">
                        <p className="expenses_table_first_row_title">
                            Properties
                        </p>
                        <BsArrowUp 
                            onClick={() => {
                                this.setToggleFields(properties);
                            }}
                            className={this.state.currFieldToggled === properties && this.state.currFieldToggledDirectionIsUp ?
                                "expenses_table_arrow_icon toggled_icon"
                                : "expenses_table_arrow_icon"}></BsArrowUp>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <p className="expenses_table_first_row_title">
                            Frequency
                        </p>
                        <BsArrowUp 
                            onClick={() => {
                                this.setToggleFields(frequency);
                            }}
                            className={this.state.currFieldToggled === frequency && this.state.currFieldToggledDirectionIsUp ?
                                "expenses_table_arrow_icon toggled_icon"
                                : "expenses_table_arrow_icon"}></BsArrowUp>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <p className="expenses_table_first_row_title">
                            Date
                        </p>
                        <BsArrowUp 
                            onClick={() => {
                                this.setToggleFields(date);
                            }}
                            className={this.state.currFieldToggled === date && this.state.currFieldToggledDirectionIsUp ?
                                "expenses_table_arrow_icon toggled_icon"
                                : "expenses_table_arrow_icon"}></BsArrowUp>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <p className="expenses_table_first_row_title">
                            Amount
                        </p>
                        <BsArrowUp 
                            onClick={() => {
                                this.setToggleFields(amount);
                            }}
                            className={this.state.currFieldToggled === amount && this.state.currFieldToggledDirectionIsUp ?
                                "expenses_table_arrow_icon toggled_icon"
                                : "expenses_table_arrow_icon"}></BsArrowUp>
                    </div>
                </div>
                <div className="clearfix"/>
                <div className="expenses_table_title_row_divider">
                </div>
                <div className="expenses_table_body">
                    { (this.state.expenses === null || this.state.expenses === undefined || this.state.expenses.length === 0) ? this.renderNoExpenses() :
                        (this.state.activeSearchExpenses && (this.state.activeSearchExpenses.length > 0 || document.getElementById("expenses_dashboard_search_bar").value !== "")) ? 
                        this.renderActiveSearchExpenses() :
                        (this.state.expenses ?
                            this.renderExpenseTableElements() : 
                        this.renderNoExpenses()
                        )
                    }
                </div>
            </div>
        );
    }
}

export default ExpensesTable;