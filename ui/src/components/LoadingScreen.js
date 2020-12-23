import React from 'react';

import DashboardSidebar from './DashboardSidebar.js';

import './CSS/LoadingScreen.css';
import './CSS/Style.css';

class LoadingScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            id: this.props.location.state.id,
            firstName: this.props.location.state.firstName,
            lastName: this.props.location.state.lastName,
            email: this.props.location.state.email
        };
    }

    render() {
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        id: this.state.id,
                        firstName: this.state.firstName,
                        lastName: this.state.lastName,
                        email: this.state.email
                    }
                }}/>
            </div>
        )
    }
}

export default LoadingScreen;