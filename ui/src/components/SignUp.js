import React from 'react';
import axios from 'axios';

import './CSS/Style.css';
import './CSS/SignUp.css';

import { Redirect } from "react-router-dom";

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            form: [],
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
    }

    handleFieldChange(e) {
        var form = this.state.form;
        form[e.target.name] = e.target.value;
        this.setState({
            form: form,
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        axios({
            method: 'post',
            url: '/api/user/signup',
            timeout: 5000,  // 5 seconds timeout
            data: {
                first_name: this.state.form["first_name"],
                last_name: this.state.form["last_name"],
                email: this.state.form["email"],
                password: this.state.form["password"],
                plan: "inactivated",
            }
        })
        .then(response => {
            if (response != null) {

                let user = response.data;
                localStorage.setItem('user', JSON.stringify(user));
                this.setState({
                    user: user,
                    redirect: "/selectpricingplan",
                });
            }
        }).catch(error => console.error('timeout exceeded'));
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect,
                state: {
                    user: this.state.user,
                    form: this.state.form,
                }
            }} />
        }
        return (
            <div className="App">
                <form onSubmit={this.handleSubmit}>
                    <input className="signup_input" placeholder="First Name" type="text" name="first_name" onChange={this.handleFieldChange}/>
                    <input className="signup_input" placeholder="Last Name" type="text" name="last_name" onChange={this.handleFieldChange}/>
                    <input className="signup_input" placeholder="Email" type="text" name="email" onChange={this.handleFieldChange}/>
                    <input className="signup_input" placeholder="Password" type="password" name="password" onChange={this.handleFieldChange} />
                    <input className="signup_input" placeholder="Confirm Password" type="password" name="confirm_password" onChange={this.handleFieldChange} />
                    <input id="signup_submit" type="submit" value="Sign Up"></input>
                </form>
            </div>
        )
    }
}

export default SignUp;