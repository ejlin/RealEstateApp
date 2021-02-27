import React from 'react';
import axios from 'axios';

import './CSS/AddNewTenantModal.css';

import { IoCloseOutline } from 'react-icons/io5';
import { MdWork } from 'react-icons/md';
import { TiUser } from 'react-icons/ti';

let URLBuilder = require('url-join');

const user = "user";
const work = "work";

class AddNewTenantModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            propertyID: this.props.data.state.propertyID,
            addTenant: this.props.data.state.addTenant,
            closeModal: this.props.data.state.closeModal,
            displayView: user,
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.verifyAndAddTenant = this.verifyAndAddTenant.bind(this);
        this.renderActiveView = this.renderActiveView.bind(this);
    }

    componentDidMount() {

    }

    handleFieldChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    renderActiveView() {
        switch (this.state.displayView) {
            case user:
                return (
                    <div>
                        <div 
                            className="group"
                            style={{
                                marginTop: "25px",
                            }}>
                            <label>NAME</label>
                            <input
                                key="name"
                                name="name"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div className="group">
                            <label>EMAIL</label>
                            <input
                                key="email"
                                name="email"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div className="group">
                            <label>PHONE</label>
                            <input
                                key="phone"
                                name="phone"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div style={{
                            float: "left",
                            width: "calc(50% - 40px)",
                        }}>
                            <div className="group">
                                <label>START DATE</label>
                                <input
                                    key="start_date"
                                    name="start_date"
                                    type="text"
                                    onChange={this.handleFieldChange}
                                    className="add_new_tenant_modal_input"/>
                            </div>
                        </div>
                        <div style={{
                            float: "left",
                            marginLeft: "20px",
                            width: "calc(50% - 40px)",
                        }}>
                            <div className="group">
                                <label>END DATE</label>
                                <input
                                    id="end_date_input"
                                    key="end_date"
                                    name="end_date"
                                    type="text"
                                    onChange={this.handleFieldChange}
                                    className="add_new_tenant_modal_input"
                                    style={{
                                        backgroundColor: this.state.activeProperty ? "#f5f5fa" : "white",
                                    }}/>
                            </div>
                        </div>
                        <div style={{
                            float: "left",
                            marginLeft: "20px",
                            width: "40px",
                        }}>
                            <div className="group">
                                <label>ACTIVE</label>
                                <div 
                                    onMouseDown={() => {
                                        let activeProperty = this.state.activeProperty;
                                        // Currently active property, set it back to not active property.
                                        // Allow input field to be editable again. 
                                        let endDateInput = document.getElementById("end_date_input");
                                        endDateInput.readOnly = !activeProperty;
                                        endDateInput.value = !activeProperty || !this.state.end_date ? "" : this.state.end_date;
                                        this.setState({
                                            activeProperty: !this.state.activeProperty,
                                        })
                                    }}
                                    style={{
                                        border: "1px solid #d3d3d3",
                                        borderRadius: "4px",
                                        height: "36px",
                                        marginTop: "5px",
                                        width: "40px",
                                    }}>
                                    <div style={{
                                        backgroundColor: this.state.activeProperty ? "#296cf6": "white",
                                        borderRadius: "4px",
                                        height: "20px",
                                        marginLeft: "10px",
                                        marginTop: "8px",
                                        width: "20px",
                                    }}></div>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            float: "left",
                            paddingBottom: "10px",
                            width: "100%",
                        }}>
                            <div
                                style={{
                                    float: "right",
                                    marginTop: "20px",
                                }}
                            >
                                <div
                                    onMouseDown={() => {
                                        this.setState({
                                            displayView: work,
                                        })
                                    }}
                                    className="opacity"
                                    style={{
                                        backgroundColor: "#296CF6",
                                        borderRadius: "50px",
                                        cursor: "pointer",
                                        float: "right",
                                        marginLeft: "10px",
                                        paddingBottom: "7.5px",
                                        paddingLeft: "15px",
                                        paddingRight: "15px",
                                        paddingTop: "7.5px",
                                    }}
                                >
                                    <p
                                        style={{
                                            color: "white",
                                        }}
                                    >
                                        Next
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case work: 
                return (
                    <div>
                        <div className="group">
                            <label>OCCUPATION</label>
                            <input
                                key="occupation"
                                name="occupation"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div className="group">
                            <label>INCOME</label>
                            <input
                                key="income"
                                name="income"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div className="clearfix"/>
                        <div className="group">
                            <label>DESCRIPTION</label>
                            <textarea 
                                key="description"
                                name="description"
                                className="no-outline-focus"
                                onChange={this.handleFieldChange}
                                style={{
                                    backgroundColor: "white",
                                    border: "1px solid #d3d3d3",
                                    borderRadius: "4px",
                                    fontSize: "0.9em",
                                    height: "100px",
                                    marginTop: "7.5px",
                                    padding: "10px 15px 10px 15px",
                                    resize: "none",
                                    width: "calc(100% - 30px)",
                                }}/>
                        </div>
                        <div style={{
                            float: "left",
                            paddingBottom: "10px",
                            width: "100%",
                        }}>
                            <div
                                style={{
                                    float: "right",
                                    marginTop: "20px",
                                }}
                            >
                                <div
                                    onMouseDown={() => {
                                        this.setState({
                                            displayView: user,
                                        })
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        float: "left",
                                        paddingBottom: "7.5px",
                                        paddingLeft: "15px",
                                        paddingRight: "15px",
                                        paddingTop: "7.5px",
                                    }}
                                >
                                    <p
                                        className="opacity"
                                    >
                                        Back
                                    </p>
                                </div>
                                <div
                                    onMouseDown={() => {
                                        this.verifyAndAddTenant()
                                    }}
                                    className="opacity"
                                    style={{
                                        backgroundColor: "#296CF6",
                                        borderRadius: "50px",
                                        cursor: "pointer",
                                        float: "left",
                                        marginLeft: "10px",
                                        paddingBottom: "7.5px",
                                        paddingLeft: "15px",
                                        paddingRight: "15px",
                                        paddingTop: "7.5px",
                                    }}
                                >
                                    <p
                                        style={{
                                            color: "white",
                                        }}
                                    >
                                        Add Tenant
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    }

    verifyAndAddTenant() {

        let tenant = [];
        tenant["property_id"] = this.state.propertyID;
        tenant["name"] = this.state.name;
        tenant["email"] = this.state.email;
        tenant["phone"] = this.state.phone;
        tenant["occupation"] = this.state.occupation;
        tenant["income"] = this.state.income;
        tenant["start_date"] = this.state.start_date;
        tenant["end_date"] = this.state.end_date;
        tenant["description"] = this.state.desription;
        tenant["active"] = this.state.activeProperty;

        this.state.addTenant(tenant);
    }

    render() {
        return (
            <div
                style={{
                    backgroundColor: "rgba(245,245,250, 0.85)",
                    borderRadius: "4px",
                    content: '',
                    height: "100vh",
                    marginBottom: "25px",
                    marginLeft: "220px",
                    position: "absolute",
                    width: "calc(100% - 220px - 350px)",
                    zIndex: "45",
                }}>
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                        float: "left",
                        marginLeft: "calc((100% - 500px)/2)",
                        marginRight: "calc((100% - 500px)/2)",
                        marginTop: "175px",
                        maxHeight: "75vh",
                        minHeight: "300px",
                        overflow: "scroll",
                        width: "500px",
                    }}>
                    <div style={{
                        marginTop: "25px",
                        paddingLeft: "30px",
                        paddingRight: "30px",
                        width: "calc(100% - 60px)"
                    }}>
                        <p style={{
                            borderBottom: "4px solid #296CF6",
                            float: "left",
                            fontWeight: "bold",
                            paddingBottom: "6px",
                        }}>
                            New Tenant
                        </p>
                        <div
                            style={{
                                float: "right",
                                height: "30px",
                            }}
                        >
                            <IoCloseOutline
                                onMouseDown={() => this.state.closeModal()}
                                style={{
                                    cursor: "pointer",
                                    float: "right",
                                    height: "30px",
                                    width: "30px",
                                }}
                            />
                        </div>
                        <div className="clearfix"/>
                        <div style={{
                            backgroundColor: "#f5f5fa",
                            borderRadius: "4px",
                            float: "left",
                            marginTop: "25px",
                            paddingBottom: "20px",
                            paddingLeft: "calc(50% - 40px - 20px - 6px - 20px)",
                            paddingRight: "calc(50% - 40px - 20px - 6px - 20px)",
                            paddingTop: "20px",
                            width: "calc(40px + 40px + 20px + 20px + 6px + 6px + 40px)",
                        }}>
                            <TiUser style={{
                                border: "3px solid #296cf6",
                                borderRadius: "50%",
                                color: "#296cf6",
                                float: "left",
                                height: "35px",
                                padding: "7.5px",
                                width: "35px",
                            }}/>
                            <div style={{
                                backgroundColor: this.state.displayView === user ? "#d3d3d3" : "#296cf6",
                                float: "left",
                                height: "6px",
                                marginTop: "25px",
                                width: "60px",
                            }}>

                            </div>
                            <MdWork style={{
                                border: this.state.displayView === user ? "3px solid #d3d3d3" : "3px solid #296cf6",
                                borderRadius: "50%",
                                color: this.state.displayView === user ? "#d3d3d3" : "#296cf6",
                                float: "right",
                                height: "30px",
                                padding: "10px",
                                width: "30px",
                            }}/>
                        </div>
                        <div className="clearfix"/>
                        {this.renderActiveView()}  
                    </div>
                </div>
            </div>
        )
    }
}

export default AddNewTenantModal;