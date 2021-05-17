import React from 'react';
import axios from 'axios';

import './CSS/Style.css';
import './CSS/SignUp.css';

import { Redirect } from "react-router-dom";

import { BiCheck } from 'react-icons/bi';
import { BsFillExclamationCircleFill } from 'react-icons/bs';

import { validateEmail } from '../utility/Util.js';

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            form: [],
            termsAgreed: false,
        };

        this.isValidSubmission = this.isValidSubmission.bind(this);
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

    // handles validation for the submission. Validation is also handled server
    // side in case the user has disabled JavaScript.
    isValidSubmission() {
        let firstName = this.state.form["first_name"];
        let lastName = this.state.form["last_name"];
        let email = this.state.form["email"];
        let password = this.state.form["password"];
        let confirmPassword = this.state.form["confirm_password"];

        let unsuccessfulLoginAttemptMsg = "";

        if (firstName.length < 2) {
            unsuccessfulLoginAttemptMsg = "First Name cannot be less than 2 letters";
        } else if (lastName.length < 2) {
            unsuccessfulLoginAttemptMsg = "Last Name cannot be less than 2 letters";
        } else if (!validateEmail(email)) {
            unsuccessfulLoginAttemptMsg = "Invalid Email";
        } else if (password !== confirmPassword) {
            unsuccessfulLoginAttemptMsg = "Passwords do not Match";
        } else if (!this.state.termsAgreed) {
            unsuccessfulLoginAttemptMsg = "Please accept the Terms & Agreements";
        }

        if (unsuccessfulLoginAttemptMsg !== "") {
            this.setState({
                unsuccessfulLoginAttemptMsg: unsuccessfulLoginAttemptMsg,
            })
            return false;
        }
        

        return true;
    }

    handleSubmit(event) {
        event.preventDefault();

        if (!this.isValidSubmission()) {
            return
        }

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
        }).catch(error => {
            let response = error.response;
            let data = response.data;
            let unsuccessfulLoginAttemptMsg;
            switch(response.status) {
                // Bad Request: Malformed input
                case 400:
                    if (data.includes("not a valid email")){
                        unsuccessfulLoginAttemptMsg = "Invalid Email";
                    }
                    break;
                // Account already exists.
                case 409:
                    unsuccessfulLoginAttemptMsg = "An Account already exists for this Email";
                    break;
                
                // // Not Found: Account not found
                // case 404: 
                //     unsuccessfulLoginAttemptMsg = "Invalid Email/Password combination";
                //     break;
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
                    form: this.state.form,
                }
            }} />
        }
        return (
            <form style={{
                backgroundColor: "white",
                borderRadius: "8px",
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
                            textAlign: "left",
                        }}>
                            {this.state.unsuccessfulLoginAttemptMsg}
                        </p>
                    </div> :
                    <div/>
                }
                <input className="signup_input" placeholder="First Name" type="text" name="first_name" onChange={this.handleFieldChange}/>
                <input className="signup_input" placeholder="Last Name" type="text" name="last_name" onChange={this.handleFieldChange}/>
                <input className="signup_input" placeholder="Email" type="text" name="email" onChange={this.handleFieldChange}/>
                <input className="signup_input" placeholder="Password" type="password" name="password" onChange={this.handleFieldChange} />
                <input className="signup_input" placeholder="Confirm Password" type="password" name="confirm_password" onChange={this.handleFieldChange} />
                <div style={{
                    marginLeft: "5%",
                    marginRight: "5%",
                    marginTop: "15px",
                    width: "90%",
                }}>
                    { this.state.termsAgreed ? 
                    <BiCheck
                        onMouseDown={() => {
                            this.setState({
                                termsAgreed: !this.state.termsAgreed,
                            })
                        }}
                        style={{
                            backgroundColor: "#296cf6",
                            borderRadius: "2px",
                            color: "white",
                            float: "left",
                            height: "19px",
                            padding: "0px",
                            width: "19px",
                        }}/>
                    :
                        <div 
                            onMouseDown={() => {
                                this.setState({
                                    termsAgreed: !this.state.termsAgreed,
                                })
                            }}
                            style={{
                                border: "2px solid #296cf6",
                                borderRadius: "2px",
                                float: "left",
                                height: "15px",
                                width: "15px",
                            }}>
                        </div>
                    }
                    <p style={{
                        color: "grey",
                        float: "left",
                        marginLeft: "10px",
                        width: "calc(100% - 15px - 15px)",
                        textAlign: "left",
                        userSelect: "none",
                    }}>
                        I agree to ReiMe's Term's & Agreements which includes my consent to receive marketing information from ReiMe. I can unsubscribe from marketing communications at any time.
                    </p>
                </div>
                <input id="signup_submit" type="submit" value="Sign Up" className="opacity"></input>
            </form>
        )
    }
}

export default SignUp;