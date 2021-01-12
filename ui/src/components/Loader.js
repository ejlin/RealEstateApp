import React from 'react';

import './CSS/Loader.css';

class Loader extends React.Component {
    
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div class="loader">Loading...</div>
        )
    }
}

export default Loader;