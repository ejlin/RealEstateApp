import React from 'react';

import './CSS/SideBarChart.css';

import MouseTooltip from 'react-sticky-mouse-tooltip';

import { numberWithCommas } from '../utility/Util.js';

const expenseBarColors = ["#dbdbed", "#cecee6", "#c1c1e0", "#b4b4d9", "#a7a7d3", "#9999cc", "#8c8cc6", "#7f7fbf", "#7272b9", "#6565b2", "#5858ac", "#4e4e9d", "#45458c", "#3d3d7b"];

class SideBarChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            height: this.props.height, // in px
            width: this.props.width, // in px
            barHeight: this.props.barHeight,
            backgroundColor: this.props.backgroundColor,
            data: this.props.data,
            mouseActiveTooltip: null,
        };

        this.renderGraph = this.renderGraph.bind(this);
    }

    componentDidMount() {
    }

    renderGraph() {

        // data is in the format of
        // [
        //      {
        //          bar: {
        //              [
        //              value: <value>,
        //              color: <color>,
        //              label: <label>
        //              ]
        //          }
        //      }, 
        //      {
        //          bar: {
        //              [
        //              value: <value>,
        //              color: <color>,
        //              label: <label>
        //              ]
        //          }
        //      },       
        // ]
        let data = this.state.data;
        if (!data || data === null || data === undefined || data.length === 0){
            return (
                <div></div>
            );
        }

        let width = this.state.width;
        let elements = [];
        let maxValue = 0;
        
        for (let i = 0; i < data.length; i++) {
            let dataPoint = data[i];
            let bar = dataPoint["bar"];
            let totalValue = 0;
            for (let j = 0; j < bar.length; j++) {
                totalValue += bar[j]["value"];
            }
            if (totalValue > maxValue) {
                maxValue = totalValue;
            }
        }
        let widthBuffer = 10;
        let sizePerUnit = (width - widthBuffer) / maxValue;

        for (let i = 0; i < data.length; i++) {
            let dataPoint = data[i];
            let bars = dataPoint["bar"];

            bars = bars.sort((a, b) => {
                if (a["value"] > b["value"]) {
                    return -1;
                } else if (a["value"] < b["value"]) {
                    return 1;
                }
                return 0;
            })
            elements.push(
                <div className="clearfix"/>
            );

            for (let j = 0; j < bars.length; j++) {
                
                let bar = bars[j];
    
                let label = bar["label"];
                let color = bar["color"];
                if (color === "") {
                    color = expenseBarColors[j];
                }
                let value = bar["value"];
                let labelVal = label.length >= data.length ? label : "";
                let width = value * sizePerUnit;
                if (j === 0) {
                    width += widthBuffer;
                }
                let borderRadius;
                if (j === 0 && j === bars.length - 1) {
                    borderRadius = "4px";
                } else if (j === 0) {
                    borderRadius = "4px 0px 0px 4px";
                } else if (j === bars.length - 1) {
                    borderRadius = "0px 4px 4px 0px";
                } else {
                    borderRadius = "0px";
                }

                let numValue = numberWithCommas(value);
                let elementLabel = labelVal ? labelVal + ": $" + numValue : "$" + numValue;
                elements.push(
                    <div key={elementLabel}
                    onMouseEnter={() => {
                        this.setState({
                            mouseActiveTooltip: elementLabel,
                        });
                    }}
                    onMouseLeave={() => {
                        this.setState({
                            mouseActiveTooltip: null,
                        });
                    }}
                    style={{
                        float: "left",
                        backgroundColor: color,
                        borderRadius: borderRadius,
                        height: this.state.barHeight,
                        marginBottom: this.state.marginBottom ? this.state.marginBottom : "10px",
                        width: width,
                    }}>
                    </div>
                )
            }   
        }

        elements.push(
            <MouseTooltip 
                key={"sidebar_mouse_tooltip"}
                visible={this.state.mouseActiveTooltip !== null}
                offsetX={15}
                offsetY={10}
                style={{
                    backgroundColor: "#f5f5fa",
                    borderRadius: "10px",
                    fontSize: "0.85em",
                    fontWeight: "bold",
                    paddingBottom: "5px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    paddingTop: "5px",
                    zIndex: "25",
                    position: "absolute",
                }}
            >
                <span>{this.state.mouseActiveTooltip}</span>
            </MouseTooltip>
        );

        return (
            <div className="side_bar_box">  
                {elements}
            </div>
        );
    }

    render() {
        return (
            <div style={{
                backgroundColor: this.state.backgroundColor,
                borderRadius: "10px",
                marginTop: this.state.marginTop + "px",
                height: this.state.height + "px",
                width: this.state.width + "px",
            }}>
                {this.renderGraph()}
            </div>
        );
    }
}

export default SideBarChart;