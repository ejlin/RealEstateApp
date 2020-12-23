import React from 'react';
import axios from 'axios';

import './CSS/SettingsDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import LoadingScreen from './LoadingScreen.js';

import { MdEdit } from 'react-icons/md';

import testProfile from './profile_picture_test.jpg';

class SettingsDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            userID: this.props.location.state.id,
            firstName: this.props.location.state.firstName,
            lastName: this.props.location.state.lastName,
            email: this.props.location.state.email,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate
        };

        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.capitalizeName = this.capitalizeName.bind(this);
        this.editProfilePicture = this.editProfilePicture.bind(this);
    }

    handleFieldChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    capitalizeName(x) {
        return x.charAt(0).toUpperCase() + x.slice(1);
    }

    editProfilePicture(e) {
        console.log("here");
    }

    componentDidMount() {
        var url = '/api/user/' + this.state.userID;
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            var data = response.data;
            this.setState({
                firstName: data["first_name"],
                lastName: data["last_name"],
                email: data["email"],
                userPlan: data["plan"],
                isLoading: false
            });
        }).catch(error => console.log(error));
    }

    render() {
        return (
            this.state.isLoading ? 
            <LoadingScreen data={{
                state: {
                    id: this.state.userID,
                    firstName: this.state.firstName,
                    lastName: this.state.lastName,
                    email: this.state.email
                }
            }}/>
             :
            <div>
                <DashboardSidebar data={{
                    state: {
                        id: this.state.userID,
                        firstName: this.state.firstName,
                        lastName: this.state.lastName,
                        email: this.state.email,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        currentPage: "settings"
                    }
                }}/>
                <div id="settings_dashboard_parent_box">
                    <div id="settings_dashboard_title_box">
                        <p id="settings_dashboard_title_box_title">
                            Settings
                        </p>
                    </div>
                    <div className="clearfix"></div>
                    <div id="settings_dashboard_parent_inner_box">
                        <div id="settings_dashboard_user_information_box">
                            <img id="settings_dashboard_user_information_profile_picture" src={testProfile} alt={"logo"}/> 
                            <MdEdit id="settings_dashboard_user_information_profile_picture_edit_icon" onClick={this.editProfilePicture}></MdEdit>
                            <div className="clearfix"/>
                            <form id="settings_dashboard_user_information_form">
                                <input placeholder={this.state.firstName ? this.capitalizeName(this.state.firstName) : "First Name"}  className="settings_dashboard_user_information_input" type="text" name="firstNameChange" onChange={this.handleFieldChange}/>
                                <input placeholder={this.state.lastName ? this.capitalizeName(this.state.lastName) : "Last Name"}  className="settings_dashboard_user_information_input" type="text" name="lastNameChange" onChange={this.handleFieldChange}/>
                                <input placeholder={this.state.email ? this.state.email : "Email"}  className="settings_dashboard_user_information_input" type="text" name="emailChange" onChange={this.handleFieldChange}/>
                                <input placeholder="New Password"  id="settings_dashboard_user_information_input_password" className="settings_dashboard_user_information_input" type="text" name="passwordChange" onChange={this.handleFieldChange}/>
                                <input id="settings_dashboard_user_information_form_submit_button" type="submit" value="Save"></input>
                            </form>
                        </div>
                        <div id="settings_dashboard_right_box">
                            <p className="settings_dashboard_right_box_title">
                                Plan
                            </p>
                            <div id="settings_dashboard_right_box_subheading_box">
                                <div>
                                    <p className="settings_dashboard_right_box_subheading">
                                        You are currently on the  
                                    </p>
                                    <p id="settings_dashboard_right_box_subheading_plan" className="settings_dashboard_right_box_subheading">
                                        {this.state.userPlan ? this.state.userPlan : "undetermined"}
                                    </p>
                                    <p className="settings_dashboard_right_box_subheading">
                                        plan
                                    </p>
                                    <MdEdit className="settings_dashboard_right_box_icon"></MdEdit>
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <p className="settings_dashboard_right_box_title">
                                Notifications
                            </p>
                            <div id="settings_dashboard_right_box_subheading_box">
                                <div>
                                    <p className="settings_dashboard_right_box_subheading">
                                        You are currently on the  
                                    </p>
                                    <p id="settings_dashboard_right_box_subheading_plan" className="settings_dashboard_right_box_subheading">
                                        {this.state.userPlan ? this.state.userPlan : "undetermined"}
                                    </p>
                                    <p className="settings_dashboard_right_box_subheading">
                                        plan
                                    </p>
                                    <MdEdit className="settings_dashboard_right_box_icon"></MdEdit>
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <p className="settings_dashboard_right_box_title">
                                Email
                            </p>
                            <div id="settings_dashboard_right_box_subheading_box">
                                <div>
                                    <p className="settings_dashboard_right_box_subheading">
                                        You are currently on the  
                                    </p>
                                    <p id="settings_dashboard_right_box_subheading_plan" className="settings_dashboard_right_box_subheading">
                                        {this.state.userPlan ? this.state.userPlan : "undetermined"}
                                    </p>
                                    <p className="settings_dashboard_right_box_subheading">
                                        plan
                                    </p>
                                    <MdEdit className="settings_dashboard_right_box_icon"></MdEdit>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SettingsDashboard;