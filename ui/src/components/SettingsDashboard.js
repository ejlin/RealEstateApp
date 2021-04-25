import React from 'react';
import axios from 'axios';

import './CSS/SettingsDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { MdEdit, MdEmail } from 'react-icons/md';
import { ImUser } from 'react-icons/im';
import { AiFillClockCircle } from 'react-icons/ai';
import { BsFillAwardFill } from 'react-icons/bs';
import { RiUser3Fill } from 'react-icons/ri';
import { IoSettingsSharp } from 'react-icons/io5';
import { IoMdSettings, IoMdNotifications, IoIosSend } from 'react-icons/io';
import { FaUserTie, FaBuilding } from 'react-icons/fa';
import { TiUser } from 'react-icons/ti';
import { BsFillHouseFill } from 'react-icons/bs';

const general = "general";
const email = "email";
const notifications = "notifications";
const properties = "properties";
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
            // profilePicture: this.props.location.state.profilePicture,
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
            starterPlanActive: false,
            professionalPlanActive: false,
            enterprisePlanActive: false,
            isLoading: true
        };

        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleProfilePictureChange = this.handleProfilePictureChange.bind(this);
        this.capitalizeName = this.capitalizeName.bind(this);
        this.getJoinedAt = this.getJoinedAt.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.convertCheckboxMapToObject = this.convertCheckboxMapToObject.bind(this);
        this.deepCopyMap = this.deepCopyMap.bind(this);
        this.updateUserSettingsProfile = this.updateUserSettingsProfile.bind(this);
        this.updateUserSettingsPreferences = this.updateUserSettingsPreferences.bind(this);
        this.mapsAreEqual = this.mapsAreEqual.bind(this);
    }

    componentDidMount() {
        var url = '/api/user/settings/preferences/' + this.state.user["id"];
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

        axios({
            method: 'get',
            url: '/api/user/settings/profile/picture/' + this.state.user["id"],
        }).then(response => {
            var src = response.data;
            this.setState({
                profilePicture: src
            })
        }).catch(error => console.log(error))
    }

    updateUserSettingsProfile() {

        var editFirstNameInput = document.getElementById("edit_first_name_input")
        var editLastNameInput = document.getElementById("edit_last_name_input")
        var editEmailInput = document.getElementById("edit_email_input")
        var editPasswordInput = document.getElementById("edit_password_input")

        var editFirstNameInputValue = editFirstNameInput.value;
        var editLastNameInputValue = editLastNameInput.value;
        var editEmailInputValue = editEmailInput.value;
        var editPasswordInputValue = editPasswordInput.value;

        let formData = new FormData();
        
        if (editFirstNameInputValue !== "") {
            formData.append("first_name", editFirstNameInputValue)
        }
        if (editLastNameInputValue !== "") {
            formData.append("last_name", editLastNameInputValue)
        }
        if (editEmailInputValue !== "") {
            formData.append("email", editEmailInputValue)
        }
        if (editPasswordInputValue !== "") {
            formData.append("password", editPasswordInputValue)
        }

        var url = 'api/user/settings/profile/' + this.state.user["id"];
        axios({
            method: 'put',
            url: url,
            data: formData
        }).then(response => {
            console.log(response);
            if (response.status === 200) {
                // response.data contains the fields which were successfully changed.

                var editedFields = response.data;
                var user = this.mergeUser(this.state.user, editedFields);
                
                this.setState({
                    user: user,
                    editGeneral: false,
                })
            }
        }).catch(error => {
            console.log(error);
        });
    }

    mergeUser(originalUser, editedFields) {
        for (const [key, value] of Object.entries(editedFields)) {
            originalUser[key] = value;
        }
        return originalUser;
    }
    
    // updateUserSettingsPreferences updates the 'settings' field within the users table.
    updateUserSettingsPreferences() {

        // No changes to the settings made by the user, just return. 
        if (this.mapsAreEqual(this.state.checkboxStates, this.state.originalCheckboxStates)) {
            this.setState({
                editNotifications: false,
                editEmail: false
            })
            return;
        }

        let formData = new FormData();

        var checkboxStatesObject = this.convertCheckboxMapToObject(this.state.checkboxStates);
        formData.append('settings', JSON.stringify(checkboxStatesObject));

        var url = 'api/user/settings/preferences/' + this.state.user["id"];
        axios({
            method: 'put',
            url: url,
            data: formData
        }).then(response => {
            if (response.status === 200) {
                this.setState({
                    editEmail: false,
                    editNotifications: false
                })
            }
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

    convertCheckboxMapToObject(checkboxMap) {

        // TODO: el (do we need to convert our response to a map, then back to object? Maybe we can just keep it as an
        // object).
        var obj = {
            "emails": {
                "receive_digest": checkboxMap.get("receive_digest"),
                "receive_marketing": checkboxMap.get("receive_marketing"),
                "receive_newsletter": checkboxMap.get("receive_newsletter")
            },
            "notifications": {
                "rent_pay_date": checkboxMap.get("rent_pay_date"),
                "mortgage_pay_date": checkboxMap.get("mortgage_pay_date"),
                "property_value": checkboxMap.get("property_value")
            }
        };
        return obj;
    }

    // deepCopyMap will create a deep copy of the input map.
    deepCopyMap(originalMap) {
        var newMap = new Map();
        originalMap.forEach((value, key, map) => {
            newMap.set(key, value);
        })
        return newMap;
    }

    handleProfilePictureChange(e) {
        var file = e.target.files[0];
        var url = '/api/user/settings/profile/picture/' + this.state.user["id"];
        let formData = new FormData();
        formData.append('file', file);

        axios({
            method: 'post',
            url: url,
            data: formData
        }).then(response => {
            if (response.status === 200) {
                var src = URL.createObjectURL(file);
                console.log(src);
                this.setState({
                    profilePicture: src
                })
            }
        }).catch(error => {
            console.log(error);
        })
        
    }

    handleFieldChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    capitalizeName(x) {
        return x.charAt(0).toUpperCase() + x.slice(1);
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

    renderChangePlanWarningText() {
        // Depending on the current user's plans and the plan they have selected, we want to display different warning texts. 
    }
    
    renderBottomBoxPage() {
        return (
            <div>
                <div style={{
                    float: "left",
                    minWidth: "400px",
                    width: "100%",
                }}>
                    <p className="right_box_page_title">
                        General
                    </p>
                    <div style={{
                        float: "left",
                        marginTop: "15px",
                        width: "100%",
                    }}>
                        <div style={{
                            float: "left",
                            width: "calc(50% - 10px)",
                        }}>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "0.9em",
                                // fontWeight: "bold",
                            }}>
                                FIRST NAME
                            </p>
                            <input 
                                className="settings_input"
                                placeholder={this.capitalizeName(this.state.user["first_name"])}
                                style={{
                                    backgroundColor: "#f5f5fa",
                                }}/>
                        </div>
                        <div style={{
                            float: "right",
                            width: "calc(50% - 10px)",
                        }}>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "0.9em",
                                // fontWeight: "bold",
                            }}>
                                LAST NAME
                            </p>
                            <input 
                                className="settings_input"
                                placeholder={this.capitalizeName(this.state.user["last_name"])}
                                style={{
                                    backgroundColor: "#f5f5fa",
                                }}/>
                        </div>
                    </div>
                        <div className="clearfix"/>
                        <div style={{
                            marginTop: "15px",
                            width: "100%",
                        }}>
                            <div style={{
                                float: "left",
                                width: "calc(50% - 10px)",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "0.9em",
                                    // fontWeight: "bold",
                                }}>
                                    EMAIL
                                </p>
                                <input 
                                    className="settings_input"
                                    placeholder={this.state.user["email"]}
                                    style={{
                                        backgroundColor: "#f5f5fa",
                                    }}/>
                            </div>
                            <div style={{
                                float: "right",
                                width: "calc(50% - 10px)",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "0.9em",
                                    // fontWeight: "bold",
                                }}>
                                    PHONE NUMBER
                                </p>
                                <input 
                                    className="settings_input"
                                    placeholder={this.state.user["phone_number"] ? this.capitalizeName(this.state.user["phone_number"]) : "1 (XXX) XXX - XXXX"}
                                    style={{
                                        backgroundColor: "#f5f5fa",
                                    }}/>
                            </div>
                        </div>
                        <div className="clearfix"/>
                        <div style={{
                            marginTop: "15px",
                            width: "100%",
                        }}>
                            <div style={{
                                float: "left",
                                width: "calc(50% - 10px)",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "0.9em",
                                    // fontWeight: "bold",
                                }}>
                                    PASSWORD
                                </p>
                                <input 
                                    className="settings_input"
                                    placeholder="********"
                                    style={{
                                        backgroundColor: "#f5f5fa",
                                    }}/>
                            </div>
                        </div>
                        {/* <p className="right_box_page_content_inner_box_list_value_text">
                                {this.state.editGeneral ? 
                            <input
                                id="edit_first_name_input"
                                className="right_box_page_content_inner_box_list_input"
                                placeholder={this.capitalizeName(this.state.user["first_name"])}></input>
                                : 
                            this.capitalizeName(this.state.user["first_name"])}
                        </p> */}

                        {/* <div className="right_box_page_content_inner_box_list">
                            <p className="right_box_page_content_inner_box_list_text">
                                First Name
                            </p>
                            <p className="right_box_page_content_inner_box_list_value_text">
                                {this.state.editGeneral ? 
                                <input
                                    id="edit_first_name_input"
                                    className="right_box_page_content_inner_box_list_input"
                                    placeholder={this.capitalizeName(this.state.user["first_name"])}></input>: 
                                this.capitalizeName(this.state.user["first_name"])}
                            </p>
                        </div>
                        <div className="clearfix"/>
                        <div className="right_box_page_content_inner_box_list">
                            <p className="right_box_page_content_inner_box_list_text">
                                Last Name
                            </p>
                            <p className="right_box_page_content_inner_box_list_value_text">
                                {this.state.editGeneral && this.state.toDisplay === general ? 
                                <input
                                    id="edit_last_name_input"
                                    className="right_box_page_content_inner_box_list_input"
                                    placeholder={this.capitalizeName(this.state.user["last_name"])}></input>: 
                                this.capitalizeName(this.state.user["last_name"])}
                            </p>
                        </div>
                        <div className="clearfix"/>
                        <div className="right_box_page_content_inner_box_list">
                            <p className="right_box_page_content_inner_box_list_text">
                                Email
                            </p>
                            <p className="right_box_page_content_inner_box_list_value_text">
                                {this.state.editGeneral ? 
                                <input
                                    id="edit_email_input"
                                    className="right_box_page_content_inner_box_list_input"
                                    placeholder={this.state.user["email"]}></input>: 
                                    this.state.user["email"]}
                            </p>
                        </div>
                        <div className="clearfix"/> */}
                        {/* <div className="right_box_page_content_inner_box_list">
                            <p className="right_box_page_content_inner_box_list_text">
                                Phone Number
                            </p>
                            <p className="right_box_page_content_inner_box_list_value_text">
                                {this.state.editGeneral ? 
                                <input
                                    id="edit_phone_number_input"
                                    type="number"
                                    className="right_box_page_content_inner_box_list_input"
                                    placeholder={this.state.phoneNumber ? this.state.phoneNumber : "(XXX) XXX - XXXX"}></input>:
                                (this.state.phoneNumber ? this.state.phoneNumber : "(XXX) XXX - XXXX")}
                            </p>
                        </div> */}
                        {/* <div className="right_box_page_content_inner_box_list">
                            <p className="right_box_page_content_inner_box_list_text">
                                Password
                            </p>
                            <p className="right_box_page_content_inner_box_list_value_text">
                                {this.state.editGeneral ? 
                                <input
                                    id="edit_password_input"
                                    type="password"
                                    className="right_box_page_content_inner_box_list_input"
                                    placeholder={"********"}></input>:
                                "********"}
                            </p>
                        </div> */}
                        {/* <div className="clearfix"/>
                        {this.state.editGeneral ? 
                        <div 
                            onClick={this.updateUserSettingsProfile}
                            className="right_box_page_content_save_edits_button">
                            Save
                        </div> :
                        <div></div>} */}
                    </div>
                    <div className="clearfix"/>
                    <p  
                        style={{
                            marginTop: "30px",
                        }}
                        className="right_box_page_title">
                        Email
                    </p>
                    {/* <p 
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
                    </p> */}
                    {this.state.editEmail ?
                    <p className="right_box_page_title_unsubscribe_all_button">Unsubscribe from All</p> : <p></p>}
                    <div className="clearfix"/>
                    <p style={{
                        color: "red",
                        marginTop: "5px",
                    }}>
                        You will always receive emails about important account information
                    </p>
                    <div className="right_box_page_content_inner_box">
                        
                        {/* <div className="clearfix"/> */}
                        <div style={{
                            float: "left",
                            width: "100%",
                        }}>
                            <input 
                                style={{
                                    float: "left",
                                    height: "20px",
                                    width: "20px",
                                }}
                                checked={this.state.checkboxStates.get('receive_digest')}
                                name="receive_digest"
                                onChange={this.handleCheckboxChange}
                                type="checkbox"/>
                            <p className="right_box_page_content_inner_box_list_text">
                                DIGEST EMAILS
                            </p>
                        </div>
                        <div style={{
                            float: "left",
                            marginTop: "10px",
                            width: "100%",
                        }}>
                            <input 
                                style={{
                                    float: "left",
                                    height: "20px",
                                    width: "20px",
                                }}
                                checked={this.state.checkboxStates.get('receive_newsletter')}
                                name="receive_newsletter"
                                onChange={this.handleCheckboxChange}
                                type="checkbox"/>
                            <p className="right_box_page_content_inner_box_list_text">
                                NEWSLETTER EMAILS
                            </p>
                        </div>
                        <div style={{
                            float: "left",
                            marginTop: "10px",
                            width: "100%",
                        }}>
                            <input 
                                style={{
                                    float: "left",
                                    height: "20px",
                                    width: "20px",
                                }}
                                checked={this.state.checkboxStates.get('receive_marketing')}
                                name="receive_marketing"
                                onChange={this.handleCheckboxChange}
                                type="checkbox"/>
                            <p className="right_box_page_content_inner_box_list_text">
                                MARKETING EMAILS
                            </p>
                        </div>
                        {/* <div className="clearfix"/>
                        {this.state.editEmail ? 
                        <div 
                            onClick={this.updateUserSettingsPreferences}
                            className="right_box_page_content_save_edits_button">
                            Save
                        </div> :
                        <div></div>} */}
                    </div>
                    <div className="clearfix"/>
                    <p 
                        style={{
                            marginTop: "30px",
                        }}
                        className="right_box_page_title">
                        Notifications
                    </p>
                    <div style={{
                        float: "left",
                        marginTop: "10px",
                        width: "100%",
                    }}>
                        <input 
                            style={{
                                float: "left",
                                height: "20px",
                                width: "20px",
                            }}
                            checked={this.state.checkboxStates.get('rent_pay_date')}
                            name="rent_pay_date"
                            onChange={this.handleCheckboxChange}
                            type="checkbox"/>
                        <p className="right_box_page_content_inner_box_list_text">
                            RENT PAY DATE
                        </p>
                    </div>
                    <div style={{
                        float: "left",
                        marginTop: "10px",
                        width: "100%",
                    }}>
                        <input 
                            style={{
                                float: "left",
                                height: "20px",
                                width: "20px",
                            }}
                            checked={this.state.checkboxStates.get('mortgage_pay_date')}
                            name="mortgage_pay_date"
                            onChange={this.handleCheckboxChange}
                            type="checkbox"/>
                        <p className="right_box_page_content_inner_box_list_text">
                            MORTGAGE/LOANS PAY DATE
                        </p>
                    </div>
                    <div style={{
                        float: "left",
                        marginTop: "10px",
                        width: "100%",
                    }}>
                        <input 
                            style={{
                                float: "left",
                                height: "20px",
                                width: "20px",
                            }}
                            checked={this.state.checkboxStates.get('property_value')}
                            name="property_value"
                            onChange={this.handleCheckboxChange}
                            type="checkbox"/>
                        <p className="right_box_page_content_inner_box_list_text">
                            PROPERTY VALUES
                        </p>
                    </div>
                    {/* <p 
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
                    </p> */}
                    {/* <div className="clearfix"/>
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
                    </div> */}
                    <div className="clearfix"/>
                    {/* {this.state.editNotifications ? 
                    <div 
                        onClick={this.updateUserSettingsPreferences}
                        className="right_box_page_content_save_edits_button">
                        Save
                    </div> :
                    <div></div>} */}
                    <p 
                        style={{
                            marginTop: "30px",
                        }}
                        className="right_box_page_title">
                        Property
                    </p>
                    <div style={{
                        float: "left",
                        marginTop: "10px",
                        width: "100%",
                    }}>
                        <input 
                            style={{
                                float: "left",
                                height: "20px",
                                width: "20px",
                            }}
                            name="automatically_estimate_property_values"
                            checked={this.state.checkboxStates.get('automatically_estimate_property_values')}
                            onChange={this.handleCheckboxChange}
                            type="checkbox"/>
                        <p className="right_box_page_content_inner_box_list_text">
                            AUTOMATICALLY ESTIMATE PROPERTY VALUES
                        </p>
                    </div>
                    {/* <p 
                        className="right_box_page_edit_button"
                        onClick={() => {
                            if (this.state.editProperties) {
                                this.setState({
                                    checkboxStates: this.deepCopyMap(this.state.originalCheckboxStates)
                                })
                            }
                            this.setState({
                                editProperties: !this.state.editProperties,
                            })}}>
                        {this.state.editProperties ? "Cancel" : "Edit"}
                    </p> */}
                    <div className="right_box_page_content_inner_box">
                        {/* <div className="right_box_page_content_inner_box_list">
                            <p className="right_box_page_content_inner_box_list_text">
                                Automatically Estimate property values
                            </p>
                            <p className="right_box_page_content_inner_box_list_value_text">
                                {this.state.editProperties ? 
                                <label className="switch">
                                    <input
                                    type="checkbox"
                                    name="rent_pay_date"
                                    checked={this.state.checkboxStates.get('automatically_estimate_property_values')}
                                    onChange={this.handleCheckboxChange}></input>
                                    <span className="slider round"></span>
                                </label>: 
                                (this.state.checkboxStates.get('automatically_estimate_property_values') ? "Yes" : "No")}
                            </p>
                        </div> */}
                        {/* <div className="clearfix"/>
                        {this.state.editProperties ? 
                        <div 
                            onClick={this.updateUserSettingsPreferences}
                            className="right_box_page_content_save_edits_button">
                            Save
                        </div> :
                        <div></div>} */}
                    </div>
                    <div className="clearfix"/>
                    <p style={{
                        float: "left",
                        marginTop: "30px",
                        width: "100%",
                    }}
                    className="right_box_page_title">
                        Plan
                    </p>
                    <div className="clearfix"/>
                    <div style={{
                        float: "left",
                        marginTop: "15px",
                        width: "100%",
                    }}>
                        <div style={{
                            float: "left",
                            width: "calc(50% - 10px)",
                        }}>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "0.9em",
                                // fontWeight: "bold",
                            }}>
                                PLAN
                            </p>
                            <input 
                                className="settings_input"
                                placeholder={this.capitalizeName(this.state.user["plan"])}
                                style={{
                                    backgroundColor: "#f5f5fa",
                                }}/>
                        </div>
                    </div>
                    <div style={{
                        float: "left",
                        marginTop: "15px",
                        paddingBottom: "20px",
                        width: "100%",
                    }}>
                        <div style={{
                            float: "right",
                        }}>
                            <div style={{
                                cursor: "pointer",
                                float: "left",
                            }}>
                                <p style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    lineHeight: "40px",
                                    marginRight: "20px",
                                }}>
                                    Discard
                                </p>
                            </div>
                            <div style={{
                                backgroundColor: "#296cf6",
                                borderRadius: "50px",
                                cursor: "pointer",
                                float: "right",
                                fontWeight: "bold",
                                lineHeight: "40px",
                                height: "40px",
                                paddingLeft: "17.5px",
                                paddingRight: "17.5px",
                            }}>
                                <p style={{
                                    color: "white",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontWeight: "bold",
                                }}>
                                    Save Changes
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* <div className="right_box_page_content_inner_box">
                        <div 
                            className={
                                this.state.editPlan ? 
                                "edit_plan_class right_box_page_content_inner_box_list" : 
                                "right_box_page_content_inner_box_list"
                            }>
                            <p className="right_box_page_content_inner_box_list_text">
                                Plan
                            </p>
                            <p className="right_box_page_content_inner_box_list_value_text">
                                {this.state.user["plan"] ? this.capitalizeName(this.state.user["plan"]) : "Starter"}
                            </p>
                            <div className="clearfix"/>
                            {this.state.editPlan ? 
                                <div className="edit_plan_class_inside_box">
                                    <div 
                                        onClick={() => {
                                            this.setState({
                                                starterPlanActive: !this.state.starterPlanActive,
                                                professionalPlanActive: false,
                                                enterprisePlanActive: false,
                                            })
                                        }}
                                        className={
                                            this.state.user["plan"] === "starter" ? 
                                            "edit_plan_class_inside_box_card edit_plan_class_inside_box_card_active" :
                                            (this.state.starterPlanActive ? "edit_plan_class_inside_box_card edit_plan_class_inside_box_card_selected" : 
                                            "edit_plan_class_inside_box_card")}>
                                        <IoIosSend className={
                                            this.state.user["plan"] === "starter" ? 
                                            "edit_plan_class_inside_box_card_icon edit_plan_class_inside_box_card_icon_active" :
                                            "edit_plan_class_inside_box_card_icon"}></IoIosSend>
                                        <p className="edit_plan_class_inside_box_card_title">
                                            Starter
                                        </p>
                                    </div>
                                    <div 
                                        onClick={() => {
                                            this.setState({
                                                starterPlanActive: false,
                                                professionalPlanActive: !this.state.professionalPlanActive,
                                                enterprisePlanActive: false,
                                            })
                                        }}
                                        className={
                                            this.state.user["plan"] === "professional" ? 
                                            "edit_plan_class_inside_box_card edit_plan_class_inside_box_card_active" :
                                            (this.state.professionalPlanActive ? "edit_plan_class_inside_box_card edit_plan_class_inside_box_card_selected" :
                                            "edit_plan_class_inside_box_card")}>
                                            <FaUserTie 
                                                className={
                                                this.state.user["plan"] === "professional" ? 
                                                "edit_plan_class_inside_box_card_icon edit_plan_class_inside_box_card_icon_active" :
                                                "edit_plan_class_inside_box_card_icon"}></FaUserTie>
                                            <p className="edit_plan_class_inside_box_card_title">
                                                Professional
                                            </p>
                                    </div>
                                    <div 
                                        onClick={() => {
                                            this.setState({
                                                starterPlanActive: false,
                                                professionalPlanActive: false,
                                                enterprisePlanActive: !this.state.enterprisePlanActive,
                                            })
                                        }}
                                        className={
                                            this.state.user["plan"] === "enterprise" ? 
                                            "edit_plan_class_inside_box_card edit_plan_class_inside_box_card_active" :
                                            "edit_plan_class_inside_box_card"}>
                                            <FaBuilding 
                                                className={
                                                this.state.user["plan"] === "enterprise" ? 
                                                "edit_plan_class_inside_box_card_icon edit_plan_class_inside_box_card_icon_active" :
                                                "edit_plan_class_inside_box_card_icon"}></FaBuilding>
                                            <p className={
                                                this.state.user["plan"] === "enterprise" ?
                                                "edit_plan_class_inside_box_card_title edit_plan_class_inside_box_card_title_active" : 
                                                "edit_plan_class_inside_box_card_title"}>
                                                Enterprise
                                            </p>
                                    </div>
                                    <div className="clearfix"/>
                                    {this.state.initialChangeButtonPressed ? 
                                    this.renderChangePlanWarningText() : 
                                    <div>
                                    </div>}
                                    <div 
                                        onClick={() => this.setState({
                                            initialChangeButtonPressed: true
                                        })}
                                        className="edit_plan_submit_button">
                                        Change
                                    </div>
                                </div> :
                                <div></div>
                            } 
                        </div>
                        </div> */}
            </div>
        );
    }

    render() {
        console.log(this.state.profilePicture);
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
                <DashboardSidebar key={this.state.profilePicture} data={{
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        profilePicture: this.state.profilePicture,
                        currentPage: "settings"
                    }
                }}/>
                {this.state.isLoading ? 
                <div style={{
                    backgroundColor: "#f5f5fa",
                }}></div> :
                <div style={{
                    backgroundColor: "#F5F5FA",
                    float: "left",
                    height: "100vh",
                    marginLeft: "250px",
                    width: "calc(100% - 250px - 375px)",
                }}>
                    <div className="page-white-background">
                        <div style={{
                            float: "left",
                            paddingBottom: "10px",
                            paddingTop: "10px",
                            textAlign: "center",
                            width: "100%",
                        }}>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.1em",
                                height: "50px",
                                lineHeight: "40px",
                            }}>
                                SETTINGS
                            </p>
                            <div className="clearfix"/>
                            <div className="page-title-bar-divider"></div>
                        </div>
                        <div style={{
                            borderRadius: "4px",
                            float: "left",
                            margin: "30px 40px 0px 40px",
                            width: "calc(100% - 80px)",
                        }}>
                            <div style={{
                                float: "left",
                                width: "225px",
                            }}>
                                
                                {this.state.profilePicture ? 
                                <img 
                                    src={this.state.profilePicture} 
                                    alt={"profile picture"}
                                    style={{
                                        backgroundColor: "white",
                                        borderRadius: "50%",
                                        boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                        float: "left",
                                        height: "225px",
                                        marginLeft: "calc((100% - 225px)/2)",
                                        marginRight: "calc((100% - 225px)/2)",
                                        width: "225px",
                                    }}/> :
                                <TiUser style={{
                                    backgroundColor: "white",
                                    borderRadius: "50%",
                                    color:  "#d3d3d3",
                                    float: "left",
                                    height: "175px",
                                    marginLeft: "calc((100% - 225px)/2)",
                                    marginRight: "calc((100% - 225px)/2)",
                                    padding: "25px",
                                    width: "175px",
                                }}/>}

                                <label htmlFor="settings_dashboard_upload_profile_picture_button">
                                    <MdEdit id="settings_dashboard_user_information_profile_picture_edit_icon"></MdEdit>
                                </label>
                                <input 
                                    id="settings_dashboard_upload_profile_picture_button" 
                                    type="file" 
                                    accept=".png,.jpg,.heic"
                                    onChange={this.handleProfilePictureChange}></input>
                                <div className="clearfix"/>
                                <div style={{
                                    marginTop: "15px",
                                    width: "100%",
                                }}>
                                    <p style={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "1.5em",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}>
                                        {this.state.user["first_name"]} {this.state.user["last_name"]}
                                    </p>
                                    <p style={{
                                        fontFamily: "'Poppins', sans-serif",
                                        textAlign: "center",
                                    }}>
                                        Joined on <b>{this.getJoinedAt()}</b>
                                    </p>
                                    <div style={{
                                        marginTop: "10px",
                                        textAlign: "center",
                                    }}>
                                        <div style={{
                                            backgroundColor: "#85bb65",
                                            borderRadius: "50px",
                                            display: "inline-block",
                                            padding: "10px 15px 10px 15px",
                                        }}>
                                            {/* <BsFillAwardFill className="settings_dashboard_user_information_icon"></BsFillAwardFill> */}
                                            <p className="settings_dashboard_user_information_inner_box_text"
                                                style={{
                                                    color: "white",
                                                    fontWeight: "bold",
                                                }}>
                                                {this.state.user["plan"] ? this.capitalizeName(this.state.user["plan"]) : "Starter"} Plan
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                float: "right",
                                marginLeft: "40px",
                                paddingBottom: "50px",
                                width: "calc(100% - 225px - 40px)",
                            }}>
                                <div style={{
                                    // backgroundColor: "#f5f5fa", 
                                    borderRadius: "15px",
                                    float: "right",
                                    padding: "5px 25px 5px 25px",
                                    width: "calc(100% - 50px)",
                                }}>
                                    <div className="clearfix"/>
                                    {this.renderBottomBoxPage()}

                                    {/* <div className="settings_dashboard_user_information_bullet_box">
                                        {/* <ImUser className="settings_dashboard_user_information_icon"></ImUser> */}
                                        {/* <p className="settings_dashboard_user_information_inner_box_text">
                                            {this.capitalizeName(this.state.user["first_name"])} {this.capitalizeName(this.state.user["last_name"])} 
                                        </p>
                                    </div>
                                    <div className="clearfix"/>
                                    <div className="settings_dashboard_user_information_bullet_box"> */}
                                        {/* <MdEmail className="settings_dashboard_user_information_icon"></MdEmail> */}
                                        {/* <p className="settings_dashboard_user_information_inner_box_text">
                                            {this.state.user["email"]}
                                        </p>
                                    </div>  */}                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                }
                <NotificationSidebar data={{
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate 
                    }
                }}/>
            </div>
        )
    }
}

export default SettingsDashboard;