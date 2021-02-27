import React from 'react';

import './CSS/TenantCard.css';
import './CSS/Style.css';

import Loader from './Loader.js';

import { convertDate } from './ExpensesDashboard.js';

import { numberWithCommas, capitalizeName } from '../utility/Util.js'; 

import { MdEdit, MdPhone } from 'react-icons/md';
import { IoTrashSharp, IoReturnDownForwardSharp, IoAttachSharp } from 'react-icons/io5';
import { FaCaretDown } from 'react-icons/fa';
import { VscExpandAll } from 'react-icons/vsc';
import { TiUser } from 'react-icons/ti';

class TenantCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            tenant: this.props.data.state.tenant,
            firstChild: this.props.data.state.firstChild,
        }
    }

    componentDidMount() {
    }

    render() {
        let tenant = this.state.tenant;
        return (
            <div style={{
                backgroundColor: this.state.expandCard ? "#f1f1f1" : "white",
                float: "left",
                marginTop: this.state.firstChild ? "15px" : "0px",
                width: "100%",
            }}>
                <div 
                    key={tenant["id"]}
                    className="tenant_element"
                    onMouseDown={() => {
                        this.setState({
                            expandCard: !this.state.expandCard,
                        });
                    }}
                    style={{
                        cursor: "pointer",
                        float: "left",
                        padding: "10px 30px 10px 30px",
                        width: "calc(100% - 60px)",
                    }}>
                    <div style={{
                        float: "left",
                        width: "55%",
                    }}>
                        <TiUser style={{
                            border: "1px solid #296CF6",
                            borderRadius: "50%",
                            color: "#296CF6",
                            float: "left",
                            height: "40px",
                            width: "40px", 
                        }}/>
                        <div style={{
                            float: "left",
                            marginLeft: "15px",
                            marginTop: "2px",
                        }}>
                            <p style={{
                                fontWeight: "bold",
                            }}>
                                {tenant["name"]}
                            </p>
                            <p style={{
                            }}>
                                {tenant["email"]}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        float: "left",
                        lineHeight: "40px",
                        width: "calc(22.5% - 10px)",
                    }}>
                        <p>
                            {tenant["start_date"]}
                        </p>
                    </div>
                    <div style={{
                        float: "left",
                        lineHeight: "40px",
                        width: "calc(22.5% - 10px)",
                    }}>
                        <p>
                            {tenant["active"] ? "Active" : tenant["end_date"]}
                        </p>
                    </div>
                </div>
                {this.state.expandCard ? 
                    <div style={{
                        backgroundColor: "#f1f1f1",
                        borderBottom: "1px solid #d3d3d3",
                        float: "left",
                        padding: "0px 30px 0px 30px",
                        width: "calc(100% - 60px)",
                    }}>
                        <div style={{
                            float: "left",
                            marginTop: "10px",
                            paddingBottom: "15px",
                            width: "100%",
                        }}>
                            <div style={{
                                float: "left",
                                width: "55%",
                            }}>
                                <MdPhone style={{
                                    color: "#296CF6",
                                    float: "left",
                                    height: "25px",
                                    marginLeft: "calc((40px - 25px)/2)",
                                    marginRight: "calc((40px - 25px)/2)",
                                    width: "25px",
                                }}/>
                                <p style={{
                                    float: "left",
                                    lineHeight: "25px",
                                    marginLeft: "15px",
                                }}>
                                    {tenant["phone"] ? tenant["phone"] : "N/A"}
                                </p>
                            </div>
                            <div style={{
                                float: "left",
                                width: "calc(22.5% - 10px)",
                            }}>
                                <p>
                                    {tenant["occupation"] ? tenant["occupation"] : "N/A"}
                                </p>
                            </div>
                            <div style={{
                                float: "left",
                                width: "calc(22.5% - 10px)",
                            }}>
                                <p>
                                    ${tenant["income"] ? numberWithCommas(tenant["income"]) : "-"}
                                </p>
                            </div>
                        </div>
                    </div>: 
                    <div></div>
                }
                
            </div>
        );
    }
}

export default TenantCard;