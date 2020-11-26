import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {redirect: null};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUsernameOrEmailChange = this.handleUsernameOrEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    handleUsernameOrEmailChange(e) {
        this.setState({usernameOrEmail: e.target.value});
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

        var axiosCall;
        if (!this.validateEmail(this.state.usernameOrEmail)) {
            axiosCall = axios({
                method: 'post',
                url: '/api/user/login/username',
                timeout: 5000,  // 5 seconds timeout
                data: {
                    username: this.state.usernameOrEmail,
                    password: this.state.password,
                }
            })
        } else {
            axiosCall = axios({
                method: 'post',
                url: '/api/user/login/email',
                timeout: 5000,  // 5 seconds timeout
                data: {
                    email: this.state.usernameOrEmail,
                    password: this.state.password,
                }
            })  
        }
        axiosCall.then(response => {
            if (response != null) {
                this.setState({currUserID: response.data})
                this.setState({redirect: "/dashboard"})
            }
            
        }).catch(error => console.error('timeout exceeded'));
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect,
                state: {
                    id: this.state.currUserID
                }
            }} />
        }
        return (
            <div className="App">
                <form onSubmit={this.handleSubmit}>
                    <label>
                    Username or Email:
                    <input type="text" name="username_or_email" onChange={this.handleUsernameOrEmailChange}/>
                    </label>
                    <br></br>
                    <label>
                    Password:
                    <input type="text" name="password" onChange={this.handlePasswordChange} />
                    </label>
                    <input type="submit" value="Login"></input>
                </form>
            </div>
        )
    }
}

export default Login;