import React from 'react';
import axios from 'axios';

import './CSS/Style.css';
import './CSS/SignUp.css';

import { Redirect } from "react-router-dom";

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
        this.handleLastNameChange = this.handleLastNameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    }

    handleFirstNameChange(e) {
        this.setState({firstName: e.target.value});
    }

    handleLastNameChange(e) {
        this.setState({lastName: e.target.value});
    }

    handleEmailChange(e) {
        this.setState({email: e.target.value});
    }

    handlePasswordChange(e) {
        this.setState({password: e.target.value});
    }

    handleConfirmPasswordChange(e) {
        this.setState({confirmPassword: e.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        axios({
            method: 'post',
            url: '/api/user/signup',
            timeout: 5000,  // 5 seconds timeout
            data: {
                first_name: this.state.firstName,
                last_name: this.state.lastName,
                email: this.state.email,
                password: this.state.password,
            }
        })
        .then(response => {
            if (response != null) {
                this.setState({
                    currUserID: response.data["id"],
                    currUserFirstName: response.data["first_name"],
                    currUserLastName: response.data["last_name"],
                    currUserEmail: response.data["email"],
                    currUserUsername: response.data["username"],
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
                    email: this.state.currUserEmail,
                    username: this.state.currUserUsername
                }
            }} />
        }
        return (
            <div className="App">
                <form onSubmit={this.handleSubmit}>
                    <input className="signup_input" placeholder="First Name" type="text" name="first_name" onChange={this.handleFirstNameChange}/>
                    <input className="signup_input" placeholder="Last Name" type="text" name="last_name" onChange={this.handleLastNameChange}/>
                    <input className="signup_input" placeholder="Email" type="text" name="email" onChange={this.handleEmailChange}/>
                    <input className="signup_input" placeholder="Password" type="password" name="password" onChange={this.handlePasswordChange} />
                    <input className="signup_input" placeholder="Confirm Password" type="password" name="confirm_password" onChange={this.handleConfirmPasswordChange} />
                    <input id="signup_submit" type="submit" value="Sign Up"></input>
                </form>
            </div>
        )
    }
}

export default SignUp;