import React from 'react';
import axios from 'axios';

import './CSS/ExpensesDashboard.css';
import './CSS/Style.css';

import CreateExpenseModal from './CreateExpenseModal.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import ExpenseCard from './ExpenseCard.js';
import ExpandedExpenseCard from './ExpandedExpenseCard.js';
import ExpensesTable from './ExpensesTable.js';

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

export function renderNoExpenses() {
    return (
        <div className="expenses_dashboard_body_inner_box_no_expenses_inner_box">
            <RiErrorWarningFill className="expenses_dashboard_body_inner_box_no_expenses_inner_box_icon"></RiErrorWarningFill>
            <p className="expenses_dashboard_body_inner_box_no_expenses_inner_box_text">
                No Expenses
            </p>
        </div>
    )
}

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
            currFieldToggledDirectionIsUp: false,
            currFieldToggled: defaultFieldToggled,
            currExpensesSortFunc: null,
            currActiveExpandedExpense: null,
            isLoading: true,
        };
        this.addExpense = this.addExpense.bind(this);
        this.displayEditExpenseModal = this.displayEditExpenseModal.bind(this);
        this.closeCreateExpenseModal = this.closeCreateExpenseModal.bind(this);
        this.closeEditExpenseModal = this.closeEditExpenseModal.bind(this);
        this.expenseFormDataToExpense = this.expenseFormDataToExpense.bind(this);
        this.setToggleFields = this.setToggleFields.bind(this);
        this.getSortFunction = this.getSortFunction.bind(this);
        this.handleSearchBar = this.handleSearchBar.bind(this);
        this.renderActiveSearchExpenses = this.renderActiveSearchExpenses.bind(this);
        this.convertExpenseToExpenseCard = this.convertExpenseToExpenseCard.bind(this);
        this.setActiveExpandedExpenseCard = this.setActiveExpandedExpenseCard.bind(this);
        this.renderPageLoadingView = this.renderPageLoadingView.bind(this);
    }

    /* We make two API requests when our component mounts. We make an api call to return the list of
     * properties associated with the user. We also make an API request to return the list of
     * expenses associated with the user.
     */
    componentDidMount() {
        
        let userID = this.state.user["id"];
        let getPropertiesListURL = URLBuilder('api/user/property/', userID);
        let getExpensesListURL = URLBuilder('api/user/expenses/', userID);

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
                let propertyAddress = property["address_one"];
                propertyAddress += property["address_two"] ? " " + property["address_two"] : "";
                propertiesMap.set(propertyID, propertyAddress);
            }
            /* Set 'None' and 'All' to handle cases where expenses are not mapped to any/are mapped to all properties */
            propertiesMap.set("None", "None");
            propertiesMap.set("All", "All");

            /* Handle our expenses response */
            let expensesMap = new Map();
            let expenses;
            // response.data is an array of expenses. Order them by property IDs -> expenses.
            if (expensesRequestResponse.data) {
                expenses = expensesRequestResponse.data.sort(
                    this.getSortFunction(this.state.currFieldToggledDirectionIsUp, this.state.currFieldToggled)
                );
                for (let i = 0; i < expenses.length; i++) {
                    let expense = expenses[i];
                    expensesMap.set(expense["id"], expense);
                }    
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

    handleSearchBar(e) {
        let searchValue = e.target.value.toLowerCase().replace(/\s/g, "");
        this.setState({
            activeSearchExpenses: this.state.expenses.filter(expense => {
                return expense["title"].toLowerCase().replace(/\s/g, "").startsWith(searchValue);
            })
        })
    }

    closeCreateExpenseModal()  {
        this.setState({
            displayAddExpense: false
        })
    }

    closeEditExpenseModal()  {
        this.setState({
            expenseToEdit: null
        })
    }

    expenseFormDataToExpense(expenseFormData) {
        let object = [];
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
            let expense = response.data;

            let expensesMap = this.state.expensesMap;
            let expenses = this.state.expenses;

            if (!expensesMap) {
                expensesMap = new Map();
            }
            console.log(expenses);
            if (!expenses) {
                expenses = [];
                expenses.push(expense);
            } else {
                expenses.unshift(expense);
            }

            expensesMap.set(expense["id"], expense);

            this.setState({
                expensesMap: expensesMap,
                expenses: expenses,
                displayAddExpense: false
            })
        }).catch(error => {
            console.log(error);
        })
    }

    setActiveExpandedExpenseCard(expense) {
        this.setState({
            currActiveExpandedExpense: expense,
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

    convertExpenseToExpenseCard(expense) {
        let expenseProperties = expense["properties"] ? expense["properties"] : ["None"];
        let propertiesMap = this.state.propertiesMap;


        let properties = [];
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
        return renderNoExpenses();
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
                    {
                        (this.state.activeSearchExpenses && (this.state.activeSearchExpenses.length > 0 || document.getElementById("expenses_dashboard_search_bar").value !== "")) ? 
                        this.renderActiveSearchExpenses() :
                        (this.state.expenses ?
                            this.renderExpenseTableElements() : 
                        renderNoExpenses()
                        )
                    }
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
                    {this.state.expenseToEdit ?
                        <div className="expenses_dashboard_display_add_expense_box">
                        </div> :
                        <div></div>}
                    {this.state.currActiveExpandedExpense !== null ? 
                        <div className="expenses_dashboard_display_add_expense_box">
                            <ExpandedExpenseCard data={{
                                state: {
                                    user: this.state.user,
                                    expense: this.state.currActiveExpandedExpense,
                                    propertiesMap: this.state.propertiesMap,
                                    setActiveExpandedExpenseCard: this.setActiveExpandedExpenseCard,
                                }
                            }}>
                            </ExpandedExpenseCard>
                        </div> :
                        <div></div>}
                    <div className="expenses_dashboard_parent_inner_box">
                        <div className="expenses_dashboard_title_box">
                            <div className="expenses_dashboard_parent_inner_box_title">
                                Expenses
                            </div>
                            <input id="expenses_dashboard_search_bar" className="search_bar" placeholder="Search..." onChange={this.handleSearchBar}>
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
                                    className="page_button">
                                    Add Expense
                                </div>
                            </div>
                            {this.state.isLoading ? 
                            this.renderPageLoadingView() : 
                            <div className="expenses_dashboard_body_inner_box">
                                <div className="expenses_dashboard_body_inner_box_most_recent_box">
                                    <ExpensesTable data={{
                                        state:{
                                            user: this.state.user,
                                            expenses: this.state.expenses,
                                            expensesMap: this.state.expensesMap,
                                            propertiesMap: this.state.propertiesMap,
                                            isSpecificProperty: false,
                                            specificPropertyAddress: null,
                                            setActiveExpandedExpenseCard: this.setActiveExpandedExpenseCard,
                                        }
                                    }}/>
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