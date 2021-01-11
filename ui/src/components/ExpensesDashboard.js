import React from 'react';
import axios from 'axios';

import './CSS/ExpensesDashboard.css';
import './CSS/Style.css';

import CreateExpenseModal from './CreateExpenseModal.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import ExpenseCard from './ExpenseCard.js';

var URLBuilder = require('url-join');

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
            propertiesToExpenses: new Map(),
            isLoading: true
        };
        this.addExpense = this.addExpense.bind(this);
        this.closeCreateExpenseModal = this.closeCreateExpenseModal.bind(this);
        // this.renderPropertyBoxes = this.renderPropertyBoxes.bind(this);
        this.expenseFormDataToExpense = this.expenseFormDataToExpense.bind(this);
        this.deleteExpense = this.deleteExpense.bind(this);
        this.renderExpenseTable = this.renderExpenseTable.bind(this);
        this.renderExpenseTableTitle = this.renderExpenseTableTitle.bind(this);
        this.renderExpenseTableElements = this.renderExpenseTableElements.bind(this);
    }

    componentDidMount() {

        // Load our properties list.
        axios({
            method: 'get',
            url:  URLBuilder('api/user/property/',this.state.user["id"]),
        }).then(response => {
            var propertiesList = response.data.sort();

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
                isLoading: false
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
            var propertiesToExpenses = this.state.propertiesToExpenses;
            // response.data is an array of expenses. Order them by property IDs -> expenses.
            var expenses = response.data;
            console.log(expenses);
            for (var i = 0; i < expenses.length; i++) {
                let expense = expenses[i];
                let associatedProperties;
                if (expense["properties"]) {
                    associatedProperties = expense["properties"];
                } else {
                    associatedProperties = ["None"];
                }
                for (var j = 0; j < associatedProperties.length; j++) {
                    let propertyID = associatedProperties[j];
                    if (!propertiesToExpenses.has(propertyID)){
                        propertiesToExpenses.set(propertyID, []);
                    }
                    let propertiesToExpensesArr = propertiesToExpenses.get(propertyID);
                    propertiesToExpensesArr.push(expense);
                    propertiesToExpenses.set(propertyID, propertiesToExpensesArr);
                }
            }
            this.setState({
                propertiesToExpenses: propertiesToExpenses,
            })
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
            var propertiesToExpenses = this.state.propertiesToExpenses;
            var associatedProperties = expenseFormData.get("properties");
            var splitAssociatedProperties = associatedProperties.split(",")

            for (var i = 0; i < splitAssociatedProperties.length; i++) {
                let propertyID = splitAssociatedProperties[i];
                if (!propertiesToExpenses.has(propertyID)) {
                    propertiesToExpenses.set(propertyID, []);
                }
                let propertiesToExpensesArr = propertiesToExpenses.get(propertyID);
                propertiesToExpensesArr.push(expense);
                propertiesToExpenses.set(propertyID, propertiesToExpensesArr);
            }

            this.setState({
                propertiesToExpenses: propertiesToExpenses,
                displayAddExpense: false
            })
        }).catch(error => {
            console.log(error);
        })
    }

    deleteExpense(expenseID, properties) {
        console.log(properties);
        axios({
            method: 'delete',
            url: 'api/user/expenses/' + this.state.user["id"] + "/" + expenseID,
        }).then(response => {
            console.log(response);
            var propertiesToExpenses = this.state.propertiesToExpenses;

            for (var i = 0; i < properties.length; i++) {
                let propertyID = properties[i];
                if (!propertiesToExpenses.has(propertyID)) {
                    continue;
                }
                let propertiesToExpensesArr = propertiesToExpenses.get(propertyID);
                for (var j = 0; j < propertiesToExpensesArr.length; j++) {
                    if (propertiesToExpensesArr[j]["id"] === expenseID){
                        propertiesToExpensesArr.splice(j, 1);
                    }
                }
                propertiesToExpenses.set(propertyID, propertiesToExpensesArr);
            }
            console.log(propertiesToExpenses);

            this.setState({
                propertiesToExpenses: propertiesToExpenses,
                displayAddExpense: false
            }, () => console.log(this.state.propertiesToExpenses))
        }).catch(error => {
            console.log(error)
        })
    }

    // renderPropertyBoxes() {
    //     var elements = [];
    //     var propertiesMap = this.state.propertiesMap;
    //     var propertiesToExpenses = this.state.propertiesToExpenses;
    //     propertiesMap.forEach((value, key, map) => {
    //         // value is our propertyID
    //         var propertyExpenses = propertiesToExpenses.get(key);
    //         if (propertyExpenses !== null && propertyExpenses !== undefined && propertyExpenses.length > 0) {
    //             elements.push(
    //                 <div>
    //                     <p className="expenses_dashboard_body_inner_box_title">
    //                         {value}
    //                     </p>
    //                 </div>
    //             );

    //             var expenses = [];
    //             for (var i = 0; i < propertyExpenses.length; i++) {
    //                 let expense = propertyExpenses[i];
    //                 expenses.push(
    //                     <ExpenseCard data={{
    //                         state: {
    //                             expense: expense,
    //                             deleteExpense: this.deleteExpense
    //                         }
    //                     }}>
    //                     </ExpenseCard>
    //                 )
    //             }

    //             elements.push(
    //                 <div>
    //                     <div className="expenses_dashboard_property_expenses_parent_box">
    //                         {expenses}
    //                     </div>
    //                     <div className="clearfix"/>
    //                 </div>
    //             );
    //         } else {
    //             elements.push(
    //                 <div>
    //                     <p className="expenses_dashboard_body_inner_box_title">
    //                         {value}
    //                     </p>
    //                     <div className="expenses_dashboard_body_inner_box_no_expenses_inner_box">
    //                         <div className="expenses_dashboard_body_inner_box_no_expenses_inner_box_title_box">
    //                             <MdError className="expenses_dashboard_body_inner_box_no_expenses_inner_box_icon"></MdError>
    //                             <p className="expenses_dashboard_body_inner_box_no_expenses_inner_box_text">
    //                                 No Expenses to show
    //                             </p>
    //                         </div>
    //                     </div>
    //                 </div>
    //             );
    //         }
    //     });
    //     return elements;
    // }

    renderExpenseTableTitle() {
        return (
            <div className="expenses_table">
                <div className="expenses_table_title_row">
                    <div className="expenses_table_first_row_long">
                        <p className="expenses_table_first_row_title">
                            Name
                        </p>
                    </div>
                    <div className="expenses_table_first_row_long">
                        <p className="expenses_table_first_row_title">
                            Properties
                        </p>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <p className="expenses_table_first_row_title">
                            Frequency
                        </p>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <p className="expenses_table_first_row_title">
                            Date
                        </p>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <p className="expenses_table_first_row_title">
                            Amount
                        </p>
                    </div>
                </div>
                <div className="clearfix"/>
                <div className="expenses_table_title_row_divider">
                </div>
                {this.renderExpenseTableElements()}
            </div>
        )
    }

    renderExpenseTable() {
        return (
            <div>
                {this.renderExpenseTableTitle()}
                <div className="clearfix"/>
            </div>
        )
    }

    renderExpenseTableElements() {
        
        console.log(this.state.propertiesToExpenses);

        var propertiesToExpenses = this.state.propertiesToExpenses;
        var propertiesMap = this.state.propertiesMap;

        var elements = [];
        propertiesToExpenses.forEach((value, key, map) => {
            let expensesArr = value;
            for (var i = 0; i < expensesArr.length; i++) {
                let expense = expensesArr[i];

                let expenseProperties;

                if (expense["properties"]){
                    expenseProperties = expense["properties"];
                } else {
                    expenseProperties = ["None"];
                }
                
                var properties = [];
                if (expenseProperties.length > 0) {
                    /* If we have more than 5 associated properties, only show the first 5 */
                    var maxLength = expenseProperties.length < 5 ? expenseProperties.length : 5;
                    for (var i = 0; i < maxLength; i++) {
                        let expensePropertyID = expenseProperties[i];
                        properties.push(
                            <p className="expenses_table_first_row_subtitle">
                                {propertiesMap.get(expensePropertyID)}
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
                    <ExpenseCard data={{
                        state: {
                            properties: properties,
                            expense: expense,
                            deleteExpense: this.deleteExpense
                        }
                    }}>

                    </ExpenseCard>
                );
            }
        })
        

        return elements;
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
                                    {this.renderExpenseTable()}
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