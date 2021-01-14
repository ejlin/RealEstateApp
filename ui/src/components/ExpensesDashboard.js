import React from 'react';
import axios from 'axios';

import './CSS/ExpensesDashboard.css';
import './CSS/Style.css';

import CreateExpenseModal from './CreateExpenseModal.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import ExpenseCard from './ExpenseCard.js';

import { BsArrowUp } from 'react-icons/bs';

var URLBuilder = require('url-join');

// sortByStringField is a custom sort comparator function that allows us to sort our
// elements according to the field we want if the field is a string. 
function sortByStringField(isUp, field){
    return function(x, y) {
        return isUp ? x[field].localeCompare(y[field]) : y[field].localeCompare(x[field]);
    }
}

function sortByTimeField(isUp, field) {
    return function(x, y) {
        var xDate = new Date(x[field]);
        var yDate = new Date(y[field]);
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

        var order = ['once', 'daily', 'weekly', 'bi-weekly', 'monthly', 'semi-annually', 'annually'];
        console.log(x[field]);
        console.log(y[field]);
        var xIdx = order.indexOf(x[field]);
        var yIdx = order.indexOf(y[field]);

        if (xIdx < yIdx) {
            return isUp? -1 : 1;
        } else if (xIdx > yIdx) {
            return isUp? 1 : -1;
        }
        return 0;
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
        var fieldX = x[field][0];
        var fieldY = y[field][0];
        return isUp ? fieldX.localeCompare(fieldY) : fieldY.localeCompare(fieldX);
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

class ExpensesDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            profilePicture: this.props.location.state.profilePicture,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            propertiesMap: null,
            displayAddExpense: false,
            expensesMap: new Map(),
            isLoading: true,
            currFieldToggledDirectionIsUp: false,
            currFieldToggled: defaultFieldToggled,
            currExpensesSortFunc: null,
        };
        this.addExpense = this.addExpense.bind(this);
        this.closeCreateExpenseModal = this.closeCreateExpenseModal.bind(this);
        this.expenseFormDataToExpense = this.expenseFormDataToExpense.bind(this);
        // this.deleteExpense = this.deleteExpense.bind(this);
        this.renderExpenseTableTitle = this.renderExpenseTableTitle.bind(this);
        this.renderExpenseTableElements = this.renderExpenseTableElements.bind(this);
        this.setToggleFields = this.setToggleFields.bind(this);
        this.getSortFunction = this.getSortFunction.bind(this);
    }

    componentDidMount() {

        // Load our properties list.
        axios({
            method: 'get',
            url:  URLBuilder('api/user/property/',this.state.user["id"]),
        }).then(response => {

            var propertiesList = response.data

            var propertiesMap = new Map();
            for (var i = 0; i < propertiesList.length; i++) {
                var propertyID = propertiesList[i]["id"];
                var propertyAddress = propertiesList[i]["address"];
                propertiesMap.set(propertyID, propertyAddress);
            }
            /* Set 'None' and 'All' to handle cases where expenses are not mapped to any/are mapped to all properties */
            propertiesMap.set("None", "None");
            propertiesMap.set("All", "All");
            this.setState({
                propertiesMap: propertiesMap,
            });
        }).catch(error => {
            console.log(error);
            this.setState({
                isLoading: false
            })
        });

        axios({
            method: 'get',
            url: URLBuilder('api/user/expenses/',this.state.user["id"]),
        }).then(response => {

            var expenses = response.data;

            var expensesMap = this.state.expensesMap;
            // response.data is an array of expenses. Order them by property IDs -> expenses.
            var expenses = response.data.sort(
                this.getSortFunction(this.state.currFieldToggledDirectionIsUp, this.state.currFieldToggled)
            );
            console.log(expenses);
            for (var i = 0; i < expenses.length; i++) {
                let expense = expenses[i];
                expensesMap.set(expense["id"], expense);
            }
            this.setState({
                expenses: expenses,
                expensesMap: expensesMap,
                isLoading: false,
            }, () => console.log(this.state.expenses))
        }).catch(error => {

        })
    }

    closeCreateExpenseModal()  {
        this.setState({
            displayAddExpense: false
        })
    }

    expenseFormDataToExpense(expenseFormData) {
        var object = [];
        for (const [key, value]  of expenseFormData) {
            object[key] = value;
        }
        return object;
    }

    addExpense(expenseFormData) {
        axios({
            method: 'post',
            url: 'api/user/expenses/' + this.state.user["id"],
            data: expenseFormData
        }).then(response => {
            var expense = response.data;

            var expensesMap = this.state.expensesMap;
            expensesMap.set(expense["id"], expense);

            this.setState({
                expensesMap: expensesMap,
                displayAddExpense: false
            })
        }).catch(error => {
            console.log(error);
        })
    }

    // deleteExpense(expenseID, properties) {
    //     console.log(properties);
    //     axios({
    //         method: 'delete',
    //         url: 'api/user/expenses/' + this.state.user["id"] + "/" + expenseID,
    //     }).then(response => {
    //         console.log(response);
    //         var propertiesToExpenses = this.state.propertiesToExpenses;

    //         for (var i = 0; i < properties.length; i++) {
    //             let propertyID = properties[i];
    //             if (!propertiesToExpenses.has(propertyID)) {
    //                 continue;
    //             }
    //             let propertiesToExpensesArr = propertiesToExpenses.get(propertyID);
    //             for (var j = 0; j < propertiesToExpensesArr.length; j++) {
    //                 if (propertiesToExpensesArr[j]["id"] === expenseID){
    //                     propertiesToExpensesArr.splice(j, 1);
    //                 }
    //             }
    //             propertiesToExpenses.set(propertyID, propertiesToExpensesArr);
    //         }
    //         console.log(propertiesToExpenses);

    //         this.setState({
    //             propertiesToExpenses: propertiesToExpenses,
    //             displayAddExpense: false
    //         }, () => console.log(this.state.propertiesToExpenses))
    //     }).catch(error => {
    //         console.log(error)
    //     })
    // }

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
        
        var expensesMap = this.state.expensesMap;
        var propertiesMap = this.state.propertiesMap;

        // We need to sort our expensesMap by the current user selection.
        var sortFn = this.getSortFunction(this.state.currFieldToggled, this.state.currFieldToggledDirectionIsUp);
        // var sortedExpensesArr = expensesMap.entries().sort(sortFn);
        var expensesArr = [];
        expensesMap.forEach((expense, expenseID, map) => {
            expensesArr.push(expense);
        })

        var isUp = this.state.currFieldToggledDirectionIsUp;
        expensesArr.sort();
        var elements = [];

        var expenses = this.state.expenses;
        console.log(expenses);
        expenses = expenses.sort(sortFn);
        console.log(expenses);


        for (var i = 0; i < expenses.length; i++) {
            let expense = expenses[i];
        // sortedExpensesMap.forEach((expense, expenseID, map) => {

            let expenseProperties = expense["properties"] ? expense["properties"] : ["None"];
            
            var properties = [];
            if (expenseProperties.length > 0) {
                /* If we have more than 5 associated properties, only show the first 5 */
                var maxLength = expenseProperties.length < 5 ? expenseProperties.length : 5;
                for (var j = 0; j < maxLength; j++) {
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
            } else {
                properties.push(
                    <p className="expenses_table_first_row_subtitle">
                        {"None"}
                    </p>
                );
            }
            
            elements.push(
                <ExpenseCard key={expense["id"]} data={{
                    state: {
                        properties: properties,
                        expense: expense,
                        deleteExpense: this.deleteExpense
                    }
                }}/>
            );
        }
        return elements;
    }

    renderExpenseTableTitle() {
        return (
            <div className="expenses_table">
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
                    {this.renderExpenseTableElements()}
                </div>
            </div>
        )
    }

    render() {
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        profilePicture: this.state.profilePicture,
                        currentPage: "expenses"
                    }
                }}/>
                <div id="expenses_dashboard_parent_box">
                    {this.state.displayAddExpense ?
                        <div className="expenses_dashboard_display_add_expense_box">
                            <CreateExpenseModal
                                data={{
                                state: {
                                    user: this.state.user,
                                    propertiesMap: this.state.propertiesMap,
                                    addExpense: this.addExpense,
                                    closeCreateExpenseModal: this.closeCreateExpenseModal,
                                }                       
                            }}
                            ></CreateExpenseModal>
                        </div> :
                        <div></div>}
                    <div className="expenses_dashboard_parent_inner_box">
                        <div className="expenses_dashboard_title_box">
                            <div className="expenses_dashboard_parent_inner_box_title">
                                Expenses
                            </div>
                            <input className="expenses_dashboard_search_bar" placeholder="Search..." onChange={this.handleSearchBar}>
                            </input>
                        </div>
                        <div className="expenses_dashboard_body_box">
                            <div className="expenses_dashboard_buttons_box">
                                <div 
                                    onClick={() => {
                                        this.setState({
                                            displayAddExpense: true
                                        })
                                    }}
                                    className="expenses_dashboard_add_expense_button">
                                    Add Expense
                                </div>
                            </div>
                            {this.state.isLoading ? <div></div> : 
                            <div className="expenses_dashboard_body_inner_box">
                                <div className="expenses_dashboard_body_inner_box_most_recent_box">
                                    {this.renderExpenseTableTitle()}
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
                <NotificationSidebar data={{
                    state: {
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate 
                    }
                }}/>
            </div>
        )
    }
}

export default ExpensesDashboard;