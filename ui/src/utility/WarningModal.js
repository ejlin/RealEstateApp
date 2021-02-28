import React from 'react';

import './CSS/WarningModal.css';

import { IoCloseOutline } from 'react-icons/io5';

class WarningModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            titleText: this.props.data.state.titleText,
            subText: this.props.data.state.subText,
            confirmFunc: this.props.data.state.confirmFunc,
            closeModal: this.props.data.state.closeModal,
        };
    }

    componentDidMount() {
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
                        marginTop: "250px",
                        width: "500px",
                    }}>
                    <div
                        style={{
                            float: "right",
                            height: "30px",
                            marginTop: "10px",
                            width: "100%",
                        }}
                    >
                        <IoCloseOutline
                            onMouseDown={() => this.state.closeModal()}
                            style={{
                                cursor: "pointer",
                                float: "right",
                                height: "30px",
                                marginRight: "15px",
                                width: "30px",
                            }}
                        />
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
                                marginTop: "20px",
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
                                    this.state.confirmFunc();
                                }}
                                className="opacity"
                                style={{
                                    backgroundColor: "#296CF6",
                                    borderRadius: "10px",
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
                                    Confirm
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default WarningModal;