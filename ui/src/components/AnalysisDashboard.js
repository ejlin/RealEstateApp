import React from 'react';
import axios from 'axios';

import './CSS/AnalysisDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

class AnalysisDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            profilePicture: this.props.location.state.profilePicture,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate
        };
    }

    componentDidMount() {
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
                        currentPage: "analysis"
                    }
                }}/>
                <div id="analysis_dashboard_parent_box">
                    <div id="analysis_dashboard_parent_inner_box">
                        <div className="analysis_dashboard_parent_inner_box_title">
                            Analysis
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

export default AnalysisDashboard;