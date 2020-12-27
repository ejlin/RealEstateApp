import React from 'react';
import axios from 'axios';

import './CSS/SettingsDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';

import { MdEdit, MdEmail } from 'react-icons/md';
import { ImUser } from 'react-icons/im';
import { AiFillClockCircle } from 'react-icons/ai';
import { BsFillAwardFill } from 'react-icons/bs';
import { IoMdSettings, IoMdNotifications } from 'react-icons/io';

import testProfile from './profile_picture_test.jpg';

const general = "general";
const email = "email";
const notifications = "notifications";
const plan = "plan";

class SettingsDashboard extends React.Component {
    
    /***
     * At a top level, a user's settings are split into
     * 2 types: user information and user preferences.
     * User information is stored (and changes to should affect
     * the Users table.
     * User preferences is stored in a field within the users table
     * called settings that is a json field (unstructured).
     */
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            toDisplay: general,
            editGeneral: false,
            checkboxStates: new Map(
                [{'receive_digest': true}, 
                {'receive_marketing': true},
                {'receive_newsletter': true},
                {'receive_rent_pay_date': true},
                {'receive_mortgage_pay_date': true},
                {'receive_property_value': true}]),
            originalCheckboxStates: new Map(),
            isLoading: true
        };

        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.capitalizeName = this.capitalizeName.bind(this);
        this.editProfilePicture = this.editProfilePicture.bind(this);
        this.getJoinedAt = this.getJoinedAt.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.deepCopyMap = this.deepCopyMap.bind(this);
        this.updateUserSettings = this.updateUserSettings.bind(this);
        this.mapsAreEqual = this.mapsAreEqual.bind(this);
    }

    componentDidMount() {
        var url = '/api/user/settings/' + this.state.user["id"];
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            var data = response.data;

            // data is a map in the format.
            // map[string]map[string]interface{}
            // Example: 
            // data: {
            //      "emails": {
            //          "receive_digest": true,
            //          "receive_marketing": true,
            //      },
            //      "notifications": {
            //          "property_value": true
            //      }
            // }

            var checkboxMap = new Map();
            checkboxMap.set('receive_digest', data["emails"]["receive_digest"]);
            checkboxMap.set('receive_marketing', data["emails"]["receive_marketing"]);
            checkboxMap.set('receive_newsletter', data["emails"]["receive_newsletter"]);
            checkboxMap.set('rent_pay_date', data["notifications"]["rent_pay_date"]);
            checkboxMap.set('mortgage_pay_date', data["notifications"]["mortgage_pay_date"]);
            checkboxMap.set('property_value', data["notifications"]["property_value"]);

            // originalCheckboxMap gives us a reference to what is loaded for the user, since user
            // actions will modify checkboxStates directly. When we "save" their changes, we need to
            // make sure we update this map as well or it will override their changes until a page reload.
            var originalCheckboxMap = this.deepCopyMap(checkboxMap);

            this.setState({
                checkboxStates: checkboxMap,
                originalCheckboxStates: originalCheckboxMap,
                isLoading: false
            });
        }).catch(error =>{
            this.setState({
                displayErrorMessage: true,
                isLoading: false,
            });
        });

        // var url = '/api/user/' + this.state.user["id"];
        // axios({
        //     method: 'get',
        //     url: url,
        // }).then(response => {
        //     var data = response.data;
        //     this.setState({
        //         user: data,
        //         isLoading: false
        //     });
        // }).catch(error => console.log(error));
    }
    
    // updateUserSettings updates the 'settings' field within the users table.
    updateUserSettings() {

        // No changes to the settings made by the user, just return. 
        if (this.mapsAreEqual(this.state.checkboxStates, this.state.originalCheckboxStates)) {
            this.setState({
                editNotifications: false,
                editEmail: false
            })
            return;
        }

        var url = 'api/user/settings/' + this.state.user["id"];
        axios({
            method: 'patch',
            url: url,
            data: {
                settings: this.state.checkboxStates,
            }
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.log(error);
        });
    }

    mapsAreEqual(map1, map2) {
        var testVal;
        if (map1.size !== map2.size) {
            return false;
        }

        for (var [key, val] of map1) {
            testVal = map2.get(key);
            // in cases of an undefined value, make sure the key
            // actually exists on the object so there are no false positives
            if (testVal !== val || (testVal === undefined && !map2.has(key))) {
                return false;
            }
        }
        return true;
    }

    // deepCopyMap will create a deep copy of the input map.
    deepCopyMap(originalMap) {
        var newMap = new Map();
        originalMap.forEach((value, key, map) => {
            newMap.set(key, value);
        })
        return newMap;
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

    getJoinedAt() {
        var joined = this.state.user["created_at"];
        if (joined === null || joined === undefined) {
            return "01/01/0001";
        }
        var date = new Date(joined);
        return date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
    }

    handleCheckboxChange(e) {
        var checkboxMap = this.state.checkboxStates;
        checkboxMap.set(e.target.name, !checkboxMap.get(e.target.name));
        this.setState({ 
            checkboxStates: checkboxMap
        });
    }
    
    renderRightBoxPage() {
        switch(this.state.toDisplay) {
            case general:
                return (
                    <div className="right_box_page_inner_box">
                        <p className="right_box_page_title">
                            General Settings
                        </p>
                        <p 
                            className="right_box_page_edit_button"
                            onClick={() => this.setState({editGeneral: !this.state.editGeneral})}>
                            {this.state.editGeneral ? "Cancel" : "Edit"}
                        </p>
                        <div className="right_box_page_content_inner_box">
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    First Name
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editGeneral ? 
                                    <input
                                        className="right_box_page_content_inner_box_list_input"
                                        placeholder={this.capitalizeName(this.state.user["first_name"])}></input>: 
                                    this.capitalizeName(this.state.user["first_name"])}
                                </p>
                            </div>
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Last Name
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editGeneral ? 
                                    <input
                                        className="right_box_page_content_inner_box_list_input"
                                        placeholder={this.capitalizeName(this.state.user["last_name"])}></input>: 
                                    this.capitalizeName(this.state.user["last_name"])}
                                </p>
                            </div>
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Email
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editGeneral ? 
                                    <input
                                        className="right_box_page_content_inner_box_list_input"
                                        placeholder={this.state.user["email"]}></input>: 
                                        this.state.user["email"]}
                                </p>
                            </div>
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Phone Number
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editGeneral ? 
                                    <input
                                        type="number"
                                        className="right_box_page_content_inner_box_list_input"
                                        placeholder={this.state.phoneNumber ? this.state.phoneNumber : "(XXX) XXX - XXXX"}></input>:
                                    (this.state.phoneNumber ? this.state.phoneNumber : "(XXX) XXX - XXXX")}
                                </p>
                            </div>
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Password
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editGeneral ? 
                                    <input
                                        type="password"
                                        className="right_box_page_content_inner_box_list_input"
                                        placeholder={"********"}></input>:
                                    "********"}
                                </p>
                            </div>
                            <div className="clearfix"/>
                            {this.state.editGeneral ? 
                            <div className="right_box_page_content_save_edits_button">
                                Save
                            </div> :
                            <div></div>}
                        </div>
                    </div>
                );
            case email:
                return (
                    <div className="right_box_page_inner_box">
                        <p className="right_box_page_title">
                            Email Settings
                        </p>
                        <p 
                            className="right_box_page_edit_button"
                            onClick={() => {
                                if (this.state.editEmail) {
                                    this.setState({
                                        checkboxStates: this.deepCopyMap(this.state.originalCheckboxStates)
                                    })
                                }
                                this.setState({
                                    editEmail: !this.state.editEmail,
                                })}}>
                            {this.state.editEmail ? "Cancel" : "Edit"}
                        </p>
                        {this.state.editEmail ?
                        <p className="right_box_page_title_unsubscribe_all_button">Unsubscribe from All</p> : <p></p>}
                        <div className="clearfix"/>
                        <p id="email_fyi_text">
                            You will always receive emails about important account information
                        </p>
                        <div className="right_box_page_content_inner_box">
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Digest Emails
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editEmail ? 
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            name="receive_digest"
                                            checked={this.state.checkboxStates.get('receive_digest')}
                                            onChange={this.handleCheckboxChange}/>
                                        <span className="slider round"></span>
                                    </label> : (this.state.checkboxStates.get('receive_digest') ? "Yes" : "No")}
                                </p>
                            </div>
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Newsletter Emails
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editEmail ? 
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            name="receive_newsletter"
                                            checked={this.state.checkboxStates.get('receive_newsletter')}
                                            onChange={this.handleCheckboxChange}/>
                                        <span className="slider round"></span>
                                    </label>: 
                                    (this.state.checkboxStates.get('receive_newsletter') ? "Yes" : "No")}
                                </p>
                            </div>
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Marketing Emails
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editEmail ? 
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            name="receive_marketing"
                                            checked={this.state.checkboxStates.get('receive_marketing')}
                                            onChange={this.handleCheckboxChange}/>
                                        <span className="slider round"></span>
                                    </label>: 
                                    (this.state.checkboxStates.get('receive_marketing') ? "Yes" : "No")}
                                </p>
                            </div>
                            <div className="clearfix"/>
                            {this.state.editEmail ? 
                            <div 
                                onClick={this.updateUserSettings}
                                className="right_box_page_content_save_edits_button">
                                Save
                            </div> :
                            <div></div>}
                        </div>
                    </div>
                );
            case notifications:
                return (
                    <div className="right_box_page_inner_box">
                        <p className="right_box_page_title">
                            Notifications Settings
                        </p>
                        <p 
                            className="right_box_page_edit_button"
                            onClick={() => {
                                if (this.state.editNotifications) {
                                    this.setState({
                                        checkboxStates: this.deepCopyMap(this.state.originalCheckboxStates)
                                    })
                                }
                                this.setState({
                                    editNotifications: !this.state.editNotifications,
                                })}}>
                            {this.state.editNotifications ? "Cancel" : "Edit"}
                        </p>
                        <div className="right_box_page_content_inner_box">
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Rent Pay date
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editNotifications ? 
                                    <label className="switch">
                                        <input
                                        type="checkbox"
                                        name="rent_pay_date"
                                        checked={this.state.checkboxStates.get('rent_pay_date')}
                                        onChange={this.handleCheckboxChange}></input>
                                        <span className="slider round"></span>
                                    </label>: 
                                    (this.state.checkboxStates.get('rent_pay_date') ? "Yes" : "No")}
                                </p>
                            </div>
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Mortgage
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editNotifications ? 
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            name="mortgage_pay_date"
                                            checked={this.state.checkboxStates.get('mortgage_pay_date')}
                                            onChange={this.handleCheckboxChange}/>
                                        <span className="slider round"></span>
                                    </label>: 
                                    (this.state.checkboxStates.get('mortgage_pay_date') ? "Yes" : "No")}
                                </p>
                            </div>
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Property Values
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editNotifications ? 
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            name="property_value"
                                            checked={this.state.checkboxStates.get('property_value')}
                                            onChange={this.handleCheckboxChange}/>
                                        <span className="slider round"></span>
                                    </label>: 
                                    (this.state.checkboxStates.get('property_value') ? "Yes" : "No")}
                                </p>
                            </div>
                            <div className="clearfix"/>
                            {this.state.editNotifications ? 
                            <div 
                                onClick={this.updateUserSettings}
                                className="right_box_page_content_save_edits_button">
                                Save
                            </div> :
                            <div></div>}
                        </div>
                    </div>
                );
            case plan:
                return (
                    <div className="right_box_page_inner_box">
                        <p className="right_box_page_title">
                            Plan Settings
                        </p>
                        <p 
                            className="right_box_page_edit_button"
                            onClick={() => this.setState({editPlan: !this.state.editPlan})}>
                            {this.state.editPlan ? "Cancel" : "Edit"}
                        </p>
                        <div className="right_box_page_content_inner_box">
                            <div className="right_box_page_content_inner_box_list">
                                <p className="right_box_page_content_inner_box_list_text">
                                    Plan
                                </p>
                                <p className="right_box_page_content_inner_box_list_value_text">
                                    {this.state.editPlan ? 
                                    <input
                                        className="right_box_page_content_inner_box_list_input"
                                        placeholder={this.capitalizeName(this.state.user["plan"])}></input>: 
                                    (this.state.user["plan"] ? this.capitalizeName(this.state.user["plan"]) : "Starter")}
                                </p>
                            </div>
                        </div>
                    </div>
                );
        }
    }

    render() {
        return (
            // <LoadingScreen data={{
            //     state: {
            //         id: this.state.userID,
            //         firstName: this.state.firstName,
            //         lastName: this.state.lastName,
            //         email: this.state.email
            //     }
            // }}/>
            <div>
                <DashboardSidebar data={{
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        currentPage: "settings"
                    }
                }}/>
                {this.state.isLoading ? 
                <div></div> :

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
                            <div id="settings_dasboard_user_information_inner_box">
                                <p className="settings_dashboard_user_information_inner_box_title">
                                    Info
                                </p>
                                <div className="settings_dashboard_user_information_bullet_box">
                                    <ImUser className="settings_dashboard_user_information_icon"></ImUser>
                                    <p className="settings_dashboard_user_information_inner_box_text">
                                        {this.capitalizeName(this.state.user["first_name"])} {this.capitalizeName(this.state.user["last_name"])} 
                                    </p>
                                </div>
                                <div className="clearfix"/>
                                <div className="settings_dashboard_user_information_bullet_box">
                                    <MdEmail className="settings_dashboard_user_information_icon"></MdEmail>
                                    <p className="settings_dashboard_user_information_inner_box_text">
                                        {this.state.user["email"]}
                                    </p>
                                </div>
                                <div className="clearfix"/>
                                <div className="settings_dashboard_user_information_bullet_box">
                                    <AiFillClockCircle className="settings_dashboard_user_information_icon"></AiFillClockCircle>
                                    <p className="settings_dashboard_user_information_inner_box_text">
                                        Joined on {this.getJoinedAt()}
                                    </p>
                                </div>
                                <div className="clearfix"/>
                                <div className="settings_dashboard_user_information_bullet_box">
                                    <BsFillAwardFill className="settings_dashboard_user_information_icon"></BsFillAwardFill>
                                    <p className="settings_dashboard_user_information_inner_box_text">
                                        {this.state.user["plan"] ? this.capitalizeName(this.state.user["plan"]) : "Starter"} Plan
                                    </p>
                                </div>
                            </div>
                            {/* <form id="settings_dashboard_user_information_form">
                                <input placeholder={this.state.firstName ? this.capitalizeName(this.state.firstName) : "First Name"}  className="settings_dashboard_user_information_input" type="text" name="firstNameChange" onChange={this.handleFieldChange}/>
                                <input placeholder={this.state.lastName ? this.capitalizeName(this.state.lastName) : "Last Name"}  className="settings_dashboard_user_information_input" type="text" name="lastNameChange" onChange={this.handleFieldChange}/>
                                <input placeholder={this.state.email ? this.state.email : "Email"}  className="settings_dashboard_user_information_input" type="text" name="emailChange" onChange={this.handleFieldChange}/>
                                <input placeholder="New Password"  id="settings_dashboard_user_information_input_password" className="settings_dashboard_user_information_input" type="text" name="passwordChange" onChange={this.handleFieldChange}/>
                                <input id="settings_dashboard_user_information_form_submit_button" type="submit" value="Save"></input>
                            </form> */}
                        </div>
                        <div id="settings_dashboard_right_box">
                            <div id="settings_dashboard_right_box_nav_bar">
                                <li 
                                    onClick={() => this.setState({toDisplay: general})}
                                    className={
                                        this.state.toDisplay === general ? 
                                        "settings_dashboard_right_box_nav_bar_list settings_dashboard_right_box_nav_bar_active_list" : 
                                        "settings_dashboard_right_box_nav_bar_list"}>
                                    <IoMdSettings className="settings_dashboard_right_box_nav_bar_list_icon"></IoMdSettings>
                                    <p className="settings_dashboard_right_box_nav_bar_list_text">
                                        General
                                    </p>
                                </li>
                                <div className="clearfix"/>
                                <li 
                                    onClick={() => this.setState({toDisplay: email})}
                                    className={
                                        this.state.toDisplay === email ? 
                                        "settings_dashboard_right_box_nav_bar_list settings_dashboard_right_box_nav_bar_active_list" : 
                                        "settings_dashboard_right_box_nav_bar_list"}>
                                    <MdEmail className="settings_dashboard_right_box_nav_bar_list_icon"></MdEmail>
                                    <p className="settings_dashboard_right_box_nav_bar_list_text">
                                        Email
                                    </p>
                                </li>
                                <div className="clearfix"/>
                                <li 
                                    onClick={() => this.setState({toDisplay: notifications})}
                                    className={
                                        this.state.toDisplay === notifications ? 
                                        "settings_dashboard_right_box_nav_bar_list settings_dashboard_right_box_nav_bar_active_list" : 
                                        "settings_dashboard_right_box_nav_bar_list"}>
                                    <IoMdNotifications className="settings_dashboard_right_box_nav_bar_list_icon"></IoMdNotifications>
                                    <p className="settings_dashboard_right_box_nav_bar_list_text">
                                        Notifications
                                    </p>
                                </li>
                                <div className="clearfix"/>
                                <li 
                                    onClick={() => this.setState({toDisplay: plan})}
                                    className={
                                        this.state.toDisplay === plan ? 
                                        "settings_dashboard_right_box_nav_bar_list settings_dashboard_right_box_nav_bar_active_list" : 
                                        "settings_dashboard_right_box_nav_bar_list"}>
                                    <BsFillAwardFill className="settings_dashboard_right_box_nav_bar_list_icon"></BsFillAwardFill>
                                    <p className="settings_dashboard_right_box_nav_bar_list_text">
                                        Plan
                                    </p>
                                </li>
                            </div>
                            {this.renderRightBoxPage()}
                        </div>
                    </div>
                </div>}
            </div>
        )
    }
}

export default SettingsDashboard;