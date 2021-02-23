import React from 'react';
import axios from 'axios';

import './CSS/AddNewTenantModal.css';

import { IoCloseOutline } from 'react-icons/io5';

let URLBuilder = require('url-join');

class AddNewTenantModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            propertyID: this.props.data.state.propertyID,
            closeModal: this.props.data.state.closeModal,
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.addTenant = this.addTenant.bind(this);
    }

    componentDidMount() {

    }

    handleFieldChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    addTenant() {
        let axiosAddTenantURL = URLBuilder('/api/user/tenants/', this.state.user["id"]);
        axios({
            method: 'post',
            url: axiosAddTenantURL,
            timeout: 5000,  // 5 seconds timeout
            data: {
                property_id: this.state.propertyID,
                name: this.state.name,
                email: this.state.email,
                phone: this.state.phone,
                occupation: this.state.occupation,
                income: this.state.income,
                start_date: this.state.start_date,
                end_date: this.state.end_date,
                description: this.state.description,
            }
        }).then(response => {
            console.log(response);
            this.state.closeModal();
        }).catch(error => {
            console.log(error);
        }
        // console.error('timeout exceeded')
        );
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
                        marginTop: "125px",
                        maxHeight: "75vh",
                        minHeight: "300px",
                        overflow: "scroll",
                        width: "500px",
                    }}>
                    <div
                        style={{
                            float: "right",
                            height: "30px",
                            marginTop: "15px",
                            width: "100%",
                        }}
                    >
                        <IoCloseOutline
                            onMouseDown={() => this.state.closeModal()}
                            style={{
                                cursor: "pointer",
                                float: "right",
                                height: "30px",
                                marginRight: "20px",
                                width: "30px",
                            }}
                        />
                    </div>
                    <div style={{
                        paddingLeft: "30px",
                        paddingRight: "30px",
                    }}>
                        <p style={{
                            borderBottom: "4px solid #296CF6",
                            float: "left",
                            fontWeight: "bold",
                            marginBottom: "10px",   
                            paddingBottom: "7.5px",
                        }}>
                            New Tenant
                        </p>
                        <div className="clearfix"/>
                        <div 
                            className="group">
                            <label>NAME</label>
                            <input
                                name="name"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div className="group">
                            <label>EMAIL</label>
                            <input
                                name="email"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div className="group">
                            <label>PHONE</label>
                            <input
                                name="phoneNumber"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div className="group">
                            <label>OCCUPATION</label>
                            <input
                                name="occupation"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div className="group">
                            <label>INCOME</label>
                            <input
                                name="income"
                                type="text"
                                onChange={this.handleFieldChange}
                                className="add_new_tenant_modal_input"/>
                        </div>
                        <div className="clearfix"/>
                        <div style={{
                            float: "left",
                            width: "calc(50% - 10px)",
                        }}>
                            <div className="group">
                                <label>START DATE</label>
                                <input
                                    name="start_date"
                                    type="text"
                                    onChange={this.handleFieldChange}
                                    className="add_new_tenant_modal_input"/>
                            </div>
                        </div>
                        <div style={{
                            float: "right",
                            width: "calc(50% - 10px)",
                        }}>
                            <div className="group">
                                <label>END DATE</label>
                                <input
                                    name="end_date"
                                    type="text"
                                    onChange={this.handleFieldChange}
                                    className="add_new_tenant_modal_input"/>
                            </div>
                        </div>
                        <div className="clearfix"/>
                        <div className="group">
                            <label>DESCRIPTION</label>
                            <textarea 
                                name="description"
                                className="no-outline-focus"
                                onChange={this.handleFieldChange}
                                style={{
                                    backgroundColor: "white",
                                    border: "1px solid #d3d3d3",
                                    borderRadius: "4px",
                                    fontSize: "1.0em",
                                    height: "100px",
                                    marginTop: "7.5px",
                                    padding: "10px 15px 10px 15px",
                                    resize: "none",
                                    width: "calc(100% - 30px)",
                                }}/>
                        </div>
                    </div>
                    <div style={{
                        float: "left",
                        marginLeft: "20px",
                        marginRight: "20px",
                        paddingBottom: "25px",
                        width: "calc(100% - 40px)",
                    }}>
                        <p
                            style={{
                                fontSize: "1.1em",
                                fontWeight: "bold",
                            }}
                        >
                            {this.state.titleText}
                        </p>
                        <p
                            style={{
                                color: "grey",
                                marginTop: "10px",
                            }}
                        >
                            {this.state.subText}
                        </p>
                        <div
                            style={{
                                float: "right",
                                marginTop: "10px",
                            }}
                        >
                            <div
                                onMouseDown={() => this.state.closeModal()}
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
                                    Cancel
                                </p>
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.addTenant()
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
            </div>
        )
    }
}

export default AddNewTenantModal;