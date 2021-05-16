import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import { BsFillExclamationCircleFill } from 'react-icons/bs';

import './CSS/Login.css';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            redirect: null
        };

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

                let user = response.data;
                let redirect;
                
                if (user["plan"] === "inactivated") {
                    redirect = "/selectpricingplan"
                } else {
                    redirect = "/properties"
                }
                localStorage.setItem('user', JSON.stringify(user));
                this.setState({
                    user: user,
                    redirect: redirect
                });
            }
            
        }).catch(error => {
            let response = error.response;
            let unsuccessfulLoginAttemptMsg;
            switch(response.status) {
                // Bad Request: Malformed input
                case 400:
                    unsuccessfulLoginAttemptMsg = "Invalid Email";
                    break;
                // Not Found: Account not found
                case 404: 
                    unsuccessfulLoginAttemptMsg = "No Account Found for Credentialasdfasdfasdfasdfsfdasdfdsafs";
                    break;
                // Internal Server Error: Ask user to retry;
                // TODO: Retry ourselves.
                case 500:
                default:
                    unsuccessfulLoginAttemptMsg = "Encountered Interal Error; Try Again";
                    break;
            }

            this.setState({
                unsuccessfulLoginAttemptMsg: unsuccessfulLoginAttemptMsg,
            })
        });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect,
                state: {
                    user: this.state.user,
                }
            }} />
        }
        return (
            <form 
                style={{
                    float: "left",
                }}
                onSubmit={this.handleSubmit}>
                {
                    this.state.unsuccessfulLoginAttemptMsg ?
                    <div style={{
                        backgroundColor: "red",
                        borderRadius: "6px",
                        display: "inline-block",
                        margin: "15px 5% 0px 5%",
                        padding: "10px 15px 10px 15px",
                        width: "calc(90% - 30px)",
                    }}>
                        <BsFillExclamationCircleFill style={{
                            color: "white",
                            float: "left",
                            height: "20px",
                            marginTop: "2.5px",
                            width: "20px",
                        }}/>
                        <p style={{
                            color: "white",
                            float: "left",
                            lineHeight: "25px",
                            marginLeft: "10px",
                            width: "calc(100% - 30px)",
                            wordBreak: "break-all",
                        }}>
                            {this.state.unsuccessfulLoginAttemptMsg}
                        </p>
                    </div> :
                    <div/>
                }
                <input className="login_input" placeholder="Email" type="text" name="email" onChange={this.handleEmailChange}/>
                <input className="login_input" placeholder="Password" type="password" name="password" onChange={this.handlePasswordChange} />
                <input id="login_submit" type="submit" value="Log In"></input>
                <div style={{
                    marginLeft: "5%",
                    marginRight: "5%",
                    marginTop: "5px",
                    paddingBottom: "20px",
                    width: "90%",
                }}>
                    <p id="login_forgot_password_text">
                        Forgot Password?
                    </p>
                </div>
            </form>
        )
    }
}

export default Login;