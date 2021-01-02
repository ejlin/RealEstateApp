import React from 'react';
import axios from 'axios';

import './CSS/ExpensesDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { MdError } from 'react-icons/md';

class ExpensesDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            profilePicture: this.props.location.state.profilePicture,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            isLoading: true
        };
    }

    componentDidMount() {

        // Load our properties list.
        axios({
            method: 'get',
            url:  'api/user/property/' + this.state.user["id"],
        }).then(response => {
            var propertiesList = response.data;

            var propertiesMap = new Map();
            for (var i = 0; i < propertiesList.length; i++) {
                var propertyID = propertiesList[i]["id"];
                var propertyAddress = propertiesList[i]["address"];
                propertiesMap.set(propertyID, propertyAddress);
            }
            this.setState({
                properties: [...propertiesMap],
                isLoading: false
            });
        }).catch(error => {
            console.log(error);
            this.setState({
                isLoading: false
            })
        });
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
                    <div id="expenses_dashboard_parent_inner_box">
                        <div className="expenses_dashboard_title_box">
                            <div className="expenses_dashboard_parent_inner_box_title">
                                Expenses
                            </div>
                            <input className="expenses_dashboard_search_bar" placeholder="Search..." onChange={this.handleSearchBar}>
                            </input>
                        </div>
                        <div className="expenses_dashboard_body_box">
                            <div className="expenses_dashboard_buttons_box">
                                <div className="expenses_dashboard_add_expense_button">
                                    Add Expense
                                </div>
                            </div>
                            <div className="expenses_dashboard_body_inner_box">
                                <div className="expenses_dashboard_body_inner_box_most_recent_box">
                                    <p className="expenses_dashboard_body_inner_box_title">
                                        Most Recent
                                    </p>
                                    {this.state.mostRecentExpenses ? 
                                    <div></div> :
                                    <div className="expenses_dashboard_body_inner_box_no_expenses_box">
                                        <div className="expenses_dashboard_body_inner_box_no_expenses_inner_box">
                                            <MdError className="expenses_dashboard_body_inner_box_no_expenses_inner_box_icon"></MdError>
                                            <p className="expenses_dashboard_body_inner_box_no_expenses_inner_box_text">
                                                No Expenses to show
                                            </p>
                                        </div>
                                    </div>}
                                </div>
                            </div>
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