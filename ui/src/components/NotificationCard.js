import React from 'react';
import './CSS/NotificationCard.css';
import './CSS/Style.css';
import { Link } from 'react-router-dom';

import { IoMdNotifications } from 'react-icons/io';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

class NotificationCard extends React.Component {
    
    constructor(props) {
        super(props);


        this.state = {
            notification: this.props.data.state.notification,
        };
    }

    componentDidMount() {
    }


    render() {
        let notification = this.state.notification;
        return (    
            <div 
                className="notification_card opacity"
                style={{
                    backgroundColor: "white",
                    borderBottom: "1px solid #d3d3d3",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                    cursor: "pointer",
                    float: "left",
                    marginBottom: "10px",
                    marginLeft: "5px",
                    marginRight: "5px",
                    padding: "12.5px 15px 12.5px 15px",
                    position: "relative",
                    width: "calc(100% - 40px)",
                }}>
                <div style={{
                    backgroundColor: !notification["seen"] ? "#296cf6" : "#d3d3d3",
                    borderRadius: "50%",
                    float: "left",
                    height: "12.5px",
                    position: "absolute",
                    top: "calc(50% - 6.25px)",
                    width: "12.5px",
                }}/>
                <p style={{
                    float: "left",
                    marginLeft: "25px",
                    width: "calc(100% - 25px)",
                }}>
                    {notification["body"]}
                </p>
            </div>
        )
    }
}

export default NotificationCard;