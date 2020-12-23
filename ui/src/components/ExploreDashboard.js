import React from 'react';
import axios from 'axios';

import './CSS/ExploreDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';

class ExploreDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            userID: this.props.location.state.id,
            firstName: this.props.location.state.firstName,
            lastName: this.props.location.state.lastName,
            email: this.props.location.state.email,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
        };
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        id: this.state.userID,
                        firstName: this.state.firstName,
                        lastName: this.state.lastName,
                        email: this.state.email,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                    }
                }}/>
                
            </div>
        )
    }
}

export default ExploreDashboard;