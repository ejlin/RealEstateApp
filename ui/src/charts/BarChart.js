import React from 'react';

import './CSS/BarChart.css';

import MouseTooltip from 'react-sticky-mouse-tooltip';

import { numberWithCommas } from '../utility/Util.js';

class BarChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            height: this.props.height, // in px
            width: this.props.width, // in px
            displayTooltip: this.props.displayTooltip,
            xAxisColor: this.props.xAxisColor,
            marginTop: this.props.marginTop,
            backgroundColor: this.props.backgroundColor,
            capitalizeXAxis: this.props.capitalizeXAxis,
            barColor: this.props.barColor,
            data: this.props.data,
            mouseActiveTooltip: null,
        };

        this.renderXAxis = this.renderXAxis.bind(this);
        this.minYAxisValue = this.minYAxisValue.bind(this);
        this.maxYAxisValue = this.maxYAxisValue.bind(this);
    }

    componentDidMount() {
        let height = this.state.height;
        let strHeight = parseInt(height);

        let barHeight = strHeight - 40;
        this.setState({
            barHeight: barHeight,
        })
    }

    minYAxisValue() {
        let data = this.state.data;
        let minElement = data[0]["y"];

        for (let i = 0; i < data.length; i++) {
            let dataPoint = data[i];
            if (dataPoint["y"] < minElement) {
                minElement = dataPoint["y"];
            }
        }
        return parseInt(minElement);
    }

    maxYAxisValue() {
        let data = this.state.data;
        let maxElement = data[0]["y"];

        for (let i = 0; i < data.length; i++) {
            let dataPoint = data[i];
            if (dataPoint["y"] > maxElement) {
                maxElement = dataPoint["y"];
            }
        }
        return parseInt(maxElement);
    }

    renderXAxis() {
        let data = this.state.data;
        let elements = [];

        let minYAxisValue = this.minYAxisValue();
        let maxYAxisValue = this.maxYAxisValue();

        let diffMinMaxYAxis = maxYAxisValue - minYAxisValue;
        let barHeight = this.state.barHeight;
        let minBuffer = 10;
        let maxBuffer = 10;

        let barHeightWithBuffer = barHeight - minBuffer - maxBuffer;

        let heightPerUnit = barHeightWithBuffer / diffMinMaxYAxis;

        for (let i = 0; i < data.length; i++) {
            let dataPoint = data[i];
            let yValue = dataPoint["y"];
            let strYValue = parseInt(yValue);
            let height = strYValue - minYAxisValue;
            height = height * heightPerUnit;
            height = height + minBuffer + minYAxisValue; // Add our minBuffer back as the baseline.
            elements.push(
                <li 
                    className="bar_chart_x_axis_element">
                    <div
                        style={{
                            backgroundColor: "transparent",
                            height: barHeight - height,
                            width: "20px"
                        }}
                    >
                    </div>
                    <div 
                        onMouseEnter={() => {
                            this.setState({
                                mouseActiveTooltip: "$" + numberWithCommas(strYValue),
                            });
                        }}
                        onMouseLeave={() => {
                            this.setState({
                                mouseActiveTooltip: null,
                            });
                        }}
                        value={yValue}
                        style={{
                            backgroundColor: this.state.barColor,
                            height: height,
                        }}
                        className="bar_chart_x_axis_graph">

                    </div>
                    <p 
                        style={{color: this.state.xAxisColor}}
                        className="bar_chart_x_axis_element_text">
                        {this.state.capitalizeXAxis ? dataPoint["x"].toUpperCase() : dataPoint["x"]}
                    </p>
                </li>
            );
            if (this.state.displayTooltip) {
                elements.push(
                    <MouseTooltip
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
                        }}
                    >
                        <span>{this.state.mouseActiveTooltip}</span>
                    </MouseTooltip>
                );
            }
        }
        return (
            <div className="bar_chart_x_axis">  
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
                width: this.state.width + "px",
            }}>
                {this.renderXAxis()}
            </div>
        );
    }
}

export default BarChart;