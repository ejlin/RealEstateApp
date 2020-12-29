import React from 'react';
import './CSS/NotificationSidebar.css';
import './CSS/Style.css';
import { Link } from 'react-router-dom';

import { IoMdNotifications } from 'react-icons/io';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

class NotificationSidebar extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            totalEstimateWorth: this.props.data.state.totalEstimateWorth,
            missingEstimate: this.props.data.state.missingEstimate
        };
    }
    render() {
        return (
            <div id="main_dashboard_summary">
                <div id="main_dashboard_summary_estimated_net_worth">
                    <p id="main_dashboard_summary_estimated_net_worth_subtitle">
                        Estimated Net Worth
                    </p>
                    {this.state.missingEstimate ? 
                        <HiOutlineExclamationCircle id="main_dashboard_missing_estimate_icon"></HiOutlineExclamationCircle> :
                        <div></div>
                    }
                    <div className="clearfix"/>
                    <p id="main_dashboard_summary_estimated_net_worth_title">
                        ${this.state.totalEstimateWorth && !Number.isNaN(this.state.totalEstimateWorth) ? this.state.totalEstimateWorth : 0}
                    </p>
                </div>
                <div id="main_dashboard_summary_notifications">
                    <IoMdNotifications id="main_dashboard_summary_notifications_icon"></IoMdNotifications>
                    <p id="main_dashboard_summary_notifications_title">
                        Notifications
                    </p>
                    <div className="clearfix"/>
                    {this.state.notifications ? this.state.notifications : 
                    <div id="main_dashboard_summary_notifications_no_notifications">
                        <p id="main_dashboard_summary_notifications_no_notifications_text">
                            No notifications
                        </p>
                    </div>
                    }
                </div>
            </div>
        )
    }
}

export default NotificationSidebar;