import React from 'react';

class MainDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {currUserID: this.props.location.state.id};
    }

    render() {
        return (
            <div>
                <p>
                    {this.state.currUserID}
                </p>
            </div>
        )
    }
}

export default MainDashboard;