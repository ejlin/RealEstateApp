import React from 'react';

import Login from './Login.js';
import SignUp from './SignUp.js';
import NavigationBar from './NavigationBar.js';

import './CSS/HomePage.css';

import { Link } from "react-router-dom";

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLogin: true
        };

        this.setLogin = this.setLogin.bind(this);
    }
    
    setLogin(login) {
        this.setState({
            isLogin: login
        })
    }

    render() {
        return (
            <div>
                <NavigationBar/>
                <div id="home_page_parent">
                    <div id="home_page_parent_top">
                        <div id="home_page_boxes_parent">
                            <div id="home_page_parent_left_box">
                                <p id="home_page_parent_left_box_title">
                                    Real Estate Investing
                                <br></br>
                                    made easy.
                                </p>
                                <p id="home_page_parent_left_box_summary">
                                    Unlock your full potential. Let us handle the book-keeping so you can do what you do best. Invest.
                                </p>
                                <div className="clearfix"/>
                                <div id="home_page_parent_signup_button" onClick={() => this.setLogin(false)}>
                                    Create Account
                                </div>
                            </div>
                            <div id="home_page_parent_right_box">
                                
                                <div id="home_page_parent_login_signup_box" className={this.state.isLogin ? "login_height" : "signup_height"}>
                                {this.state.isLogin ? 
                                    <div>
                                        <Login></Login>
                                        <div className="clearfix"/>
                                        <input id="home_page_create_account" type="submit" value="Create Account" onClick={() => this.setLogin(false)}></input>
                                    </div> :
                                    <div>
                                        <SignUp></SignUp>
                                        <div className="clearfix"/>
                                        <input id="home_page_create_account" type="submit" value="Log In" onClick={() => this.setLogin(true)}></input>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default HomePage;