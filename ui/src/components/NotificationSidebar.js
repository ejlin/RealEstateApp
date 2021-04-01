import React from 'react';
import axios from 'axios';

import './CSS/NotificationSidebar.css';
import './CSS/Style.css';
import { Link, Redirect } from 'react-router-dom';

import { numberWithCommas, capitalizeName } from '../utility/Util.js';
import NotificationCard from './NotificationCard.js';

import { IoMdNotifications } from 'react-icons/io';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { TiUser } from 'react-icons/ti';
import { FiChevronDown } from 'react-icons/fi';

let URLBuilder = require('url-join');

class NotificationSidebar extends React.Component {
    
    constructor(props) {
        super(props);

        const totalEstimateWorth = localStorage.getItem("total_estimate_worth");
        
        let user;

        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            user = JSON.parse(loggedInUser);
        } else {
            user = null;
        }

        this.state = {
            user: user,
            totalEstimateWorth: this.props.data.state.totalEstimateWorth,
            missingEstimate: this.props.data.state.missingEstimate,
            currentPage: this.props.data.state.currentPage,
            profilePicture: this.props.data.state.profilePicture,
            inactivatedAccount: this.props.data.state.inactivatedAccount,
            isLoading: true,
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
                isLoading: false,
            });
        })).catch(errors => {
            console.log(errors);
            this.setState({
                isLoading: false,
            })
        });

        if (this.state.profilePicture === "" || this.state.profilePicture === undefined || this.state.profilePicture === null) {
            axios({
                method: 'get',
                url: '/api/user/settings/profile/picture/' + this.state.user["id"],
            }).then(response => {
                var src = response.data;
                this.setState({
                    profilePicture: src
                })
            }).catch(error => {
                console.log(error);
                let statusCode = error.response.status;
                if (statusCode === 404) {
                    console.log("here");
                }
                this.setState({
                    profilePicture: null,
                })
            })
        }
    }

    renderNotifications() {
        let notifications = this.state.notifications;
        let elements = [];
        for (let i = 0; i < notifications.length; i++) {
            let notification = notifications[i];
            elements.push(
                <div>
                    <NotificationCard data={{
                        state: {
                            notification: notification,
                        }
                    }}
                    />
                </div>
            );
        }
        elements.push(
            <div className="clearfix"/>
        );
        return (
            <div style={{
                height: "calc(100vh - 250px - 50px)",
                marginTop: "25px",
                overflow: "scroll",
                paddingBottom: "0px",
                width: "100%",
            }}>
                {elements}
            </div>
        );
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect
            }} />
        }
        if (this.state.isLoading) {
            return (
                <div></div>
            );
        }
        return (
            <div style={{
                backgroundColor: "#f5f5fa",
                right: "0",
                height: "100vh",
                position: "fixed",
                top: "0",
                userSelect: "none",
                width: "375px",
                zIndex: "20",
            }}>
                {
                        this.state.profilePicture !== null && this.state.profilePicture !== undefined && this.state.profilePicture !== "" ? 
                        <div>
                            <img 
                            src={this.state.profilePicture}
                            style={{
                                borderRadius: "50%",
                                height: "200px",
                                marginLeft: "calc((100% - 200px)/2)",
                                marginTop: "80px",
                                userSelect: "none",
                                width: "200px",
                            }}/>
                            <div>
                                <p style={{
                                    color: "black",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.1em",
                                    fontWeight: "bold",
                                    marginTop: "15px",
                                    textAlign: "center",
                                }}>{capitalizeName(this.state.user["first_name"])} {capitalizeName(this.state.user["last_name"])}
                                <FiChevronDown
                                    onMouseDown={() => {
                                        if (!this.state.inactivatedAccount) {
                                            this.setState({
                                                displayAccountTooltip: !this.state.displayAccountTooltip
                                            })
                                        }
                                    }}
                                    style={{
                                        color: "white !important",
                                        cursor: "pointer",
                                        marginLeft: "5px",
                                        marginTop: "3px",
                                        position: "absolute",
                                    }}/>
                                </p>
                                {
                                    this.state.displayAccountTooltip ? 
                                    <div style={{
                                        backgroundColor: "white",
                                        borderRadius: "4px",
                                        marginLeft: "calc((100% - 120px)/2)",
                                        marginTop: "5px",
                                        position: "absolute",
                                        width: "120px",
                                        zIndex: "5",
                                    }}>
                                        <li 
                                            onClick={() => 
                                                {
                                                    localStorage.clear();
                                                    this.setState({
                                                        redirect: "/"
                                                    });
                                                }
                                            }
                                            className="dashboard_sidebar_tooltip"
                                            style={{
                                                cursor: "pointer",
                                                padding: "7.5px 15px 7.5px 15px",
                                                textAlign: "center",
                                                transition: "0.5s",
                                            }}>
                                            Sign Out
                                        </li>
                                    </div> :
                                    <div></div>
                                }
                            </div>
                            <div className="clearfix"/>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.0em",
                                textAlign: "center",
                            }}>{this.state.user["email"]}</p>
                        </div>
                            :
                        <TiUser style={{
                            border: "3px solid white",
                            borderRadius: "50px",
                            color: "white",
                            height: "calc(100px - 6px)",
                            marginLeft: "calc((100% - 100px)/2)",
                            marginTop: "80px",
                            width: "calc(100px - 6px)",
                        }}></TiUser>
                    }
                    <div className="clearfix"/>
                <div style={{
                    backgroundColor: "#d3d3d3",
                    height: "1px",
                    marginBottom: "20px",
                    marginLeft: "15%",
                    marginRight: "15%",
                    marginTop: "20px",
                    width: "70%",
                }}></div>
                <div style={{
                    marginLeft: "15%",
                    marginRight: "15%",
                    width: "70%",
                }}>
                    <p style={{
                        color: "#32384D",
                        float: "left",
                        fontSize: "0.9em",
                        marginBottom: "0",
                    }}>
                        ESTIMATED NET WORTH
                    </p>
                    <div className="clearfix"/>
                    <p style={{
                        color: "#296cf6",
                        float: "left",
                        fontSize: "1.2em",
                        fontWeight: "bold",
                        marginBottom: "15px",
                        marginTop: "15px",
                    }}>
                        ${
                            this.state.totalEstimateWorth && !Number.isNaN(this.state.totalEstimateWorth) ? 
                            numberWithCommas(this.state.totalEstimateWorth) : 
                            0
                        }
                    </p>
                </div>
                <div style={{
                    float: "left",
                    marginLeft: "15%",
                    marginRight: "15%",
                    marginTop: "15px",
                    width: "70%",
                }}>
                    <div style={{                        
                    }}>
                        <div style={{
                            float: "left",
                        }}>
                            {/* <IoMdNotifications style={{
                                float: "left",
                                height: "25px",
                                marginRight: "7.5px",
                                width: "25px",
                            }}/> */}
                            <p style={{
                                float: "left",
                                fontSize: "0.9em",
                                lineHeight: "25px",
                            }}>
                                NOTIFICATIONS
                            </p>
                        </div>
                        <div 
                            className="opacity"
                            style={{
                                color: "#236cf6",
                                cursor: "pointer",
                                float: "right",
                                lineHeight: "25px",
                            }}>
                            See All
                        </div>
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
            </div>
        )
    }
}

export default NotificationSidebar;