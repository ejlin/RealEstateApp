import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/Login.css';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {redirect: null};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    handleEmailChange(e) {
        this.setState({email: e.target.value});
    }

    handlePasswordChange(e) {
        this.setState({password: e.target.value});
    }

    validateEmail(email){
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
            return true;
        }
        return false;
    }

    handleSubmit(event) {
        event.preventDefault();    
        
        axios({
            method: 'post',
            url: '/api/user/login/email',
            timeout: 5000,  // 5 seconds timeout
            data: {
                email: this.state.email,
                password: this.state.password,
            }
        }).then(response => {
            if (response != null) {
                this.setState({
                    currUserID: response.data["id"],
                    currUserFirstName: response.data["first_name"],
                    currUserLastName: response.data["last_name"],
                    currUserEmail: response.data["email"],
                    redirect: "/dashboard"
                });
            }
            
        }).catch(error => console.error('timeout exceeded'));
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect,
                state: {
                    id: this.state.currUserID,
                    firstName: this.state.currUserFirstName,
                    lastName: this.state.currUserLastName,
                    email: this.state.currUserEmail
                }
            }} />
        }
        return (
            <form onSubmit={this.handleSubmit}>
                <input className="login_input" placeholder="Email" type="text" name="email" onChange={this.handleEmailChange}/>
                <input className="login_input" placeholder="Password" type="password" name="password" onChange={this.handlePasswordChange} />
                <input id="login_submit" type="submit" value="Log In"></input>
                <div id="login_forgot_password_box">
                    <p id="login_forgot_password_text">
                        Forgot Password?
                    </p>
                </div>
            </form>
        )
    }
}

export default Login;