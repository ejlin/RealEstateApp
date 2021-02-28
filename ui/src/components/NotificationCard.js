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
            <div style={{
                width: "100%",
            }}>
                <p>
                    {notification["body"]}
                </p>
            </div>
        )
    }
}

export default NotificationCard;