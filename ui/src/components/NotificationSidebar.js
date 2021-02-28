import React from 'react';
import axios from 'axios';

import './CSS/NotificationSidebar.css';
import './CSS/Style.css';
import { Link } from 'react-router-dom';

import { numberWithCommas } from '../utility/Util.js';
import NotificationCard from './NotificationCard.js';

import { IoMdNotifications } from 'react-icons/io';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

let URLBuilder = require('url-join');

class NotificationSidebar extends React.Component {
    
    constructor(props) {
        super(props);

        const totalEstimateWorth = localStorage.getItem("total_estimate_worth");


        this.state = {
            user: this.props.data.state.user,
            totalEstimateWorth: totalEstimateWorth,
            missingEstimate: this.props.data.state.missingEstimate,
        };

        this.renderNotifications = this.renderNotifications.bind(this);
    }

    componentDidMount() {
        let userID = this.state.user["id"];
        let getNotificationsURL = URLBuilder('api/user/notifications/', userID);

        const getNotificationsRequest = axios.get(getNotificationsURL);

        axios.all(
            [getNotificationsRequest]
        ).then(axios.spread((...responses) => {
            const notificationsRequestReponse = responses[0];

            /* Handle our notifications response */
            let notifications = notificationsRequestReponse.data;

          
            this.setState({
                notifications: notifications,
            });
        })).catch(errors => {
            console.log(errors);
        });
    }

    renderNotifications() {
        let notifications = this.state.notifications;
        let elements = [];
        for (let i = 0; i < notifications.length; i++) {
            let notification = notifications[i];
            elements.push(
                <NotificationCard data={{
                    state: {
                        notification: notification,
                    }
                }}
                />
            );
        }
        return (
            <div style={{
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                marginTop: "25px",
                width: "100%",
            }}>
                {elements}
            </div>
        );
    }

    render() {
        return (
            <div style={{
                backgroundColor: "#F5F5FA",
                right: "0",
                height: "100vh",
                position: "fixed",
                top: "0",
                userSelect: "none",
                width: "350px",
                zIndex: "20",
            }}>
                <div style={{
                    backgroundColor: "#296CF6",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                    height: "100px",
                    marginLeft: "10%",
                    marginTop: "calc(80px)",
                    width: "calc(80%)",
                }}>
                    <p style={{
                        backgroundColor: "transparent !important",
                        color: "white",
                        float: "left",
                        fontSize: "0.9em",
                        marginLeft: "25px",
                        marginRight: "5px",
                        marginTop: "17.5px",
                    }}>
                        Estimated Net Worth
                    </p>
                    {this.state.missingEstimate ? 
                        <HiOutlineExclamationCircle id="main_dashboard_missing_estimate_icon"></HiOutlineExclamationCircle> :
                        <div></div>
                    }
                    <div className="clearfix"/>
                    <p id="main_dashboard_summary_estimated_net_worth_title">
                        ${this.state.totalEstimateWorth && !Number.isNaN(this.state.totalEstimateWorth) ? numberWithCommas(this.state.totalEstimateWorth) : 0}
                    </p>
                </div>
                <div id="main_dashboard_summary_notifications">
                    <IoMdNotifications id="main_dashboard_summary_notifications_icon"></IoMdNotifications>
                    <p id="main_dashboard_summary_notifications_title">
                        Notifications
                    </p>
                    <div className="clearfix"/>
                    {
                        this.state.notifications ? this.renderNotifications() : 
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