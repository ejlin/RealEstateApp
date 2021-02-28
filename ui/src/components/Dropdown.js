import React from 'react';

import './CSS/Dropdown.css';

import MouseTooltip from 'react-sticky-mouse-tooltip';

import { numberWithCommas } from '../utility/Util.js';

import { MdArrowDropDown } from 'react-icons/md';

const expenseBarColors = ["#dbdbed", "#cecee6", "#c1c1e0", "#b4b4d9", "#a7a7d3", "#9999cc", "#8c8cc6", "#7f7fbf", "#7272b9", "#6565b2", "#5858ac", "#4e4e9d", "#45458c", "#3d3d7b"];

class Dropdown extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            height: this.props.height, // in px
            width: this.props.width, // in px
            backgroundColor: this.props.backgroundColor,
            borderRadius: this.props.borderRadius,
            color: this.props.color,
            defaultValue: this.props.defaultValue,
            fontWeight: this.props.fontWeight,
            fontSize: this.props.fontSize,
            selectables: this.props.selectables,
            callback: this.props.callback,
        };

        this.renderDropdown = this.renderDropdown.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ 
            defaultValue: nextProps.defaultValue,
        });  
      }

    componentDidMount() {
    }

    renderDropdown() {
        let selectables = this.state.selectables;

        let elements = [];
        for (let i = 0; i < selectables.length; i++) {
            let selectable = selectables[i];
            elements.push(
                <div 
                    onMouseDown={() => {
                        this.state.callback(selectable);
                    }}
                    style={{
                        cursor: "pointer",
                        fontSize: "0.8em",
                        height: "35px",
                        lineHeight: "35px",
                        textAlign: "center",
                        zIndex: "30",
                    }}
                    className="dropdown_selectable_list"
                    >
                    {selectable}
                </div>
            );
        }
        return (
            <div
            style={{
                backgroundColor: "#f5f5fa",
                borderRadius: "10px",
                cursor: "pointer",
                position: "absolute",
                width: this.state.boxWidth + "px",
                zIndex: "30",
            }}>
                {elements}
            </div>
        );
    }

    render() {
        return (
            <div 
            onMouseDown={() => {
                let boxWidth = document.getElementById("dropdown_box").offsetWidth;
                this.setState({
                    showDropdown: !this.state.showDropdown,
                    boxWidth: boxWidth,
                });
            }}
            style={{
                cursor: "pointer",
                zIndex: "30",
            }}
            >
                <div 
                id="dropdown_box"
                style={{
                    backgroundColor: this.state.backgroundColor,
                    borderRadius: this.state.borderRadius,
                    color: this.state.color,
                    display: "inline-block",
                    height: this.state.height + "px",
                    fontWeight: this.state.fontWeight,
                    fontSize: this.state.fontSize,
                    paddingLeft: "12.5px",
                    paddingRight: "10px",
                    textAlign: "center",
                }}>
                    <div style={{
                        display: "inline-block",
                    }}>
                        <p style={{
                            float: "left",
                            lineHeight: this.state.height + "px",
                            userSelect: "none",
                        }}>{this.state.defaultValue}</p>
                        <MdArrowDropDown style={{
                            float: "left",
                            height: "20px",
                            width: "20px",
                            marginTop: (this.state.height - 20)/2 + "px",
                        }}></MdArrowDropDown>
                    </div>
                </div>
                {this.state.showDropdown ? 
                    this.renderDropdown() : <div></div>}
            </div>

        );
    }
}

export default Dropdown;