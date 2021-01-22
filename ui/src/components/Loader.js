import React from 'react';

import './CSS/Loader.css';

class Loader extends React.Component {
    
    constructor(props) { 
        super(props);

        this.state = {
            class: this.props.data.state.class,
        }
    }

    render() {
        return (
            <div className={this.state.class ? "loader " + this.state.class : "loader"}></div>
        )
    }
}

export default Loader;