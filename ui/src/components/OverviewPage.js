import React from 'react';

import { Link } from "react-router-dom";

import NavigationBar from './NavigationBar.js';
import SignUp from './SignUp.js';
import Footer from './Footer.js';

import './CSS/OverviewPage.css';

class OverviewPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <div>
                <NavigationBar/>
                <div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default OverviewPage;