import React from 'react';
import axios from 'axios';

import './CSS/PropertyPage.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { Link, Redirect } from 'react-router-dom';

let URLBuilder = require('url-join');

class PropertyPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            property: this.props.location.state.property,
            profilePicture: this.props.location.state.profilePicture,
            isLoading: false
        };
    }

    componentDidMount() {
        console.log(this.state.property);
    }

    render() {
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        user: this.state.user,
                        propertyID: this.state.activePropertyID,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        profilePicture: this.state.profilePicture,
                        currentPage: "properties",
                    }
                }}/>
                {this.state.isLoading ? <div></div> : 
                <div>
                    <div className="properties_dashboard_property_type_box">
                        <div className="properties_dashboard_inner_box">
                            <div id="properties_dashboard_title_box">
                                <p className="properties_dashboard_title_box_title">
                                    Properties
                                </p>
                                <input className="properties_dashboard_search_bar" placeholder="Search...">
                                </input>
                            </div>
                            <div className="clearfix"/>
                            <div className="properties_dashboard_buttons_box">
                                <Link to={{
                                    pathname: "/addproperty",
                                    state: {
                                        user: this.state.user,
                                        totalEstimateWorth: this.state.totalEstimateWorth,
                                        missingEstimate: this.state.missingEstimate,
                                        profilePicture: this.state.profilePicture
                                    }
                                }}>
                                    <div className="properties_dashboard_add_property_button">
                                        New Property
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>}
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

export default PropertyPage;