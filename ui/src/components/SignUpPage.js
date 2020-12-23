import React from 'react';

import Login from './Login.js';
import NavigationBar from './NavigationBar.js';

import './CSS/SignUpPage.css';

import { Link } from "react-router-dom";

class SignUpPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <NavigationBar/>
                <div id="sign_up_page_parent">
                    <div id="sign_up_page_box">
                        
                    </div>
                </div>
            </div>
        )
    }
}

export default SignUpPage;