import React from 'react';

import './CSS/BarChart.css';

class BarChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            height: this.props.height, // in px
            xAxisColor: this.props.xAxisColor,
            capitalizeXAxis: this.props.capitalizeXAxis,
            barColor: this.props.barColor,
            data: this.props.data,
            
            // user: this.props.location.state.user,
        };

        this.renderXAxis = this.renderXAxis.bind(this);
        this.minYAxisValue = this.minYAxisValue.bind(this);
        this.maxYAxisValue = this.maxYAxisValue.bind(this);
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
        return minElement;
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
        return maxElement;
    }

    renderXAxis() {
        let data = this.state.data;
        let elements = [];

        let minYAxisValue = this.minYAxisValue();
        let maxYAxisValue = this.maxYAxisValue();

        for (let i = 0; i < data.length; i++) {
            let dataPoint = data[i];
            console.log(dataPoint["x"]);
            elements.push(
                <li className="bar_chart_x_axis_element">
                    <div 
                        style={{
                            backgroundColor: this.state.barColor,
                            // height: {}
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
        }
        return (
            <div className="bar_chart_x_axis">  
                {elements}
            </div>
        );
    }

    componentDidMount() {
        console.log(this.state.barColor);
        console.log(this.state.data);
    }

    render() {
        return (
            <div>
                {this.renderXAxis()}
            </div>
        );
    }
}

export default BarChart;