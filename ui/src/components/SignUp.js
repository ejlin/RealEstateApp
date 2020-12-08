import React from 'react';
import axios from 'axios';
import './CSS/Style.css';

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
        this.handleLastNameChange = this.handleLastNameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
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

    handleUsernameChange(e) {
        this.setState({username: e.target.value});
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
                username: this.state.username,
                password: this.state.password,
            }
        })
        .then(response => {
            console.log(response);
        }).catch(error => console.error('timeout exceeded'));
    }

    render() {
        return (
            <div className="App">
                <form onSubmit={this.handleSubmit}>
                    <label>
                    First Name:
                    <input type="text" name="first_name" onChange={this.handleFirstNameChange}/>
                    </label>
                    <br></br>
                    <label>
                    Last Name:
                    <input type="text" name="last_name" onChange={this.handleLastNameChange}/>
                    </label>
                    <br></br>
                    <label>
                    Email:
                    <input type="text" name="email" onChange={this.handleEmailChange}/>
                    </label>
                    <br></br><label>
                    Username:
                    <input type="text" name="username" onChange={this.handleUsernameChange} />
                    </label>
                    <br></br>
                    <label>
                    Password:
                    <input type="text" name="password" onChange={this.handlePasswordChange} />
                    </label>
                    <br></br>
                    <label>
                    Confirm Password:
                    <input type="text" name="confirm_password" onChange={this.handleConfirmPasswordChange} />
                    </label>
                    <br></br>
                    <input type="submit" value="Sign Up"></input>
                </form>
            </div>
        )
    }
}

export default SignUp;