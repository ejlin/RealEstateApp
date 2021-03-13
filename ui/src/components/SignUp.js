import React from 'react';
import axios from 'axios';

import './CSS/Style.css';
import './CSS/SignUp.css';

import { Redirect } from "react-router-dom";

import { BiCheck } from 'react-icons/bi';

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            form: [],
            termsAgreed: false,
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
            <form style={{
                backgroundColor: "white",
                borderRadius: "8px",
            }}
            onSubmit={this.handleSubmit}>
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
                                float: "left",
                                height: "15px",
                                width: "15px",
                            }}>
                        </div>
                    }
                    <p style={{
                        color: "grey",
                        float: "left",
                        marginLeft: "15px",
                        width: "calc(100% - 15px - 15px - 4px)",
                        textAlign: "left",
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