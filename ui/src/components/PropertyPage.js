import React from 'react';
import axios from 'axios';

import './CSS/PropertyPage.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import ExpensesTable from './ExpensesTable.js';
import FileCard from './FileCard.js';
import ExpandedExpenseCard from './ExpandedExpenseCard.js';
import BarChart from '../charts/BarChart.js';
import SideBarChart from '../charts/SideBarChart.js';
import Dropdown from './Dropdown.js';

import { monthArr, 
        numberWithCommas, 
        openSignedURL, 
        getDateSuffix, 
        getTrailingTwelveMonths, 
        getMonthAndYear } from '../utility/Util.js';
import { renderNoFiles } from './FilesDashboard.js';

import { Link, Redirect } from 'react-router-dom';

import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';

import { IoCaretBackOutline } from 'react-icons/io5';
import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { IoSettingsSharp } from 'react-icons/io5';
import { FaMoneyCheck, FaCheckCircle } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

let URLBuilder = require('url-join');

const overviewView = "overview_view";
const analysisView = "analysis_view";
const expensesView = "expenses_view";
const filesView = "files_view";
const settingsView = "settings_view";

class PropertyPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            property: this.props.location.state.property,
            profilePicture: this.props.location.state.profilePicture,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            totalPurchasePrice: this.props.location.state.totalPurchasePrice,
            totalSquareFeet: this.props.location.state.totalSquareFeet,
            viewToDisplay: overviewView,
            isLoading: false,
            currActiveExpandedExpense: null,
            host: window.location.protocol + "//" + window.location.host,
            percentPortfolioSelected: "Estimate",
        };

        this.renderViewPage = this.renderViewPage.bind(this);
        this.convertPropertyTypeToText = this.convertPropertyTypeToText.bind(this);
        this.convertBoughDateToText = this.convertBoughDateToText.bind(this);
        this.renderFileElements = this.renderFileElements.bind(this);
        this.setActiveExpandedExpenseCard = this.setActiveExpandedExpenseCard.bind(this);
        this.getHistoricalAnalysisData = this.getHistoricalAnalysisData.bind(this);
        this.getCashFlowData = this.getCashFlowData.bind(this);

        this.portfolioPercentageCallback = this.portfolioPercentageCallback.bind(this);
        this.getPercentPortfolioValue = this.getPercentPortfolioValue.bind(this);
    }

    componentDidMount() {
        let host = this.state.host;

        /*** Set our GoogleMapsURL ***/
        let propertyGoogleMapsURL = this.state.property["address"] + "," + this.state.property["city"] + "," + this.state.property["state"];
        propertyGoogleMapsURL = propertyGoogleMapsURL.replace(" ", "+");

        let googleMapsURL = 'https://maps.googleapis.com/maps/api/staticmap?center=' + propertyGoogleMapsURL + '&zoom=15&size=1000x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&key=AIzaSyCbudHvO__fMV1eolNO_g5qtE2r2UNcjcA';
        this.setState({
            googleMapsURL: googleMapsURL
        })
        /*** Set our GoogleMapsURL ***/

        let userID = this.state.user["id"];
        let propertyID = this.state.property["id"];

        let getExpensesByPropertyListURL = URLBuilder(host, '/api/user/expenses', userID, propertyID);
        let getFilesByPropertyURL = URLBuilder(host, '/api/user/files/property', userID, propertyID);
        let getPropertiesHistoryURL = URLBuilder(host, '/api/user/history', userID, propertyID);
        let getPropertySummaryURL = URLBuilder(host, '/api/user/summary', userID, propertyID);

        const getExpensesByPropertyRequest = axios.get(getExpensesByPropertyListURL);
        const getFilesByPropertyRequest = axios.get(getFilesByPropertyURL);
        const getPropertiesHistoricalRequest = axios.get(getPropertiesHistoryURL);
        const getPropertySummaryRequest = axios.get(getPropertySummaryURL);

        axios.all(
            [getExpensesByPropertyRequest, getFilesByPropertyRequest, getPropertiesHistoricalRequest, getPropertySummaryRequest]
        ).then(axios.spread((...responses) => {
            const expensesRequestResponse = responses[0];
            /* Handle our expenses response */
            let expensesMap = new Map();
            let expenses;
            // response.data is an array of expenses.
            if (expensesRequestResponse.data) {
                expenses = expensesRequestResponse.data;
                // .sort(
                //     this.getSortFunction(this.state.currFieldToggledDirectionIsUp, this.state.currFieldToggled)
                // );
                for (let i = 0; i < expenses.length; i++) {
                    let expense = expenses[i];
                    expensesMap.set(expense["id"], expense);
                }    
            }

            const filesRequestResponse = responses[1];
            /* Handle our files response */
            let filesMap = new Map();
            let files = filesRequestResponse.data;

            files = files.sort(function(a, b){
                if (a["last_modified_at"] < b["last_modified_at"]) {
                    return 1;
                } else if (a["last_modified_at"] > b["last_modified_at"]) {
                    return -1;
                }
                return 0;
            });
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    let fileID = file["id"];
                    filesMap.set(fileID, file);
                }
            }

            /* Handle our history response */
            const historyRequestResponse = responses[2];
            let historicalAnalysis = historyRequestResponse.data;

            /* Handle our summary response */
            const propertySummaryRequestResponse = responses[3];
            let propertySummary = propertySummaryRequestResponse.data;

            let cashFlowObj = this.getCashFlowData(propertySummary, expenses);
            let cashFlowData = cashFlowObj[0];
            let totalIncome = cashFlowObj[1];
            let totalExpenses = cashFlowObj[2];

            this.setState({
                expenses: expenses,
                expensesMap: expensesMap,
                files: files,
                filesMap: filesMap,
                historicalAnalysis: historicalAnalysis,
                propertySummary: propertySummary,
                cashFlowData: cashFlowData,
                totalIncome: totalIncome,
                totalExpenses: totalExpenses,
                isLoading: false
            });
        })).catch(errors => {
            console.log(errors);
        });

    }

    convertPropertyTypeToText(propertyType){
        switch (propertyType) {
            case 'SFH':
                return 'Single Family Home';
            default:
                return propertyType;
        }
    }

    getHistoricalAnalysisData() {

        let data = [];

        let trailingMonths = getTrailingTwelveMonths();

        let historicalAnalysis = this.state.historicalAnalysis;
        if (historicalAnalysis === null 
                || historicalAnalysis === undefined 
                || (Object.keys(historicalAnalysis).length === 0 && historicalAnalysis.constructor === Object)) {

            let defaultData = [];
            for (let i = 0; i < trailingMonths.length; i++) {
                let trailingMonthObj = trailingMonths[i];
                let month = trailingMonthObj[0];
                let yearStr = trailingMonthObj[1].toString();
                let trimmedMonth = month.substring(0,3);
                let xVal;
                if (i === 0 || trimmedMonth.toLowerCase() === 'jan') {
                    xVal = trimmedMonth + " '" + yearStr.substring(2,4);
                } else {
                    xVal = trimmedMonth;
                } 
                let obj = {x: xVal, y: 0}
                defaultData.push(obj);
            }
            return defaultData;
        }

        let properties = historicalAnalysis["properties"];

        let monthYearToEstimatesArrayMap = new Map();

        // Iterate through our properties. Because PropertyPage is the view of a single property,
        // we can expect this to be a length of 0-1.
        for (let i = 0; i < properties.length; i++) {
            let property = properties[i];
            let estimates = property["property_estimates"];
            // Iterate through every single estimate we have associated with this property. This is capped
            // server side to be within the past year.
            for (let j = 0; j < estimates.length; j++) {
                let estimate = estimates[j];
                let createdAt = estimate["created_at"];
                let estimateValue = parseFloat(estimate["estimate"]);

                // getMonthAndYear will parse our created_at timestamp to return the month and year
                // of the timestamp as a tuple: [month, year].
                let monthAndYear = getMonthAndYear(createdAt);
    
                let month = monthAndYear[0];
                let year = monthAndYear[1];
                
                // We cannot key by tuple, so do a stupid hack. Concat month and year string to serve as a key.
                // https://stackoverflow.com/questions/43592760/typescript-javascript-using-tuple-as-key-of-map.
                let key = monthArr[month - 1] + year;
                let arr;
                // Populate our map, which is a map of {key -> []estimates}. We associate every month/year combination
                // with all the estimates from that month/year. That way we can average out the estimates to get
                // an overall estimate. 
                if (!monthYearToEstimatesArrayMap.has(key)) {
                    arr = [];
                } else {
                    arr = monthYearToEstimatesArrayMap.get(key);
                }
                arr.push(estimateValue);
                monthYearToEstimatesArrayMap.set(key, arr);
            }
        }
        
        // Iterate through the past 12 months. 
        for (let i = 0; i < trailingMonths.length; i++) {
            let trailingMonthsObj = trailingMonths[i];
            let month = trailingMonthsObj[0];
            let year = trailingMonthsObj[1];

            let trimmedMonth = month.substring(0, 3)

            let yearStr = year.toString();

            let key = month.toString() + year.toString();
            let obj;
            let xVal;
            if (i === 0 || trimmedMonth.toLowerCase() === 'jan') {
                xVal = trimmedMonth + " '" + yearStr.substring(2,4);
            } else {
                xVal = trimmedMonth;
            } 
            if (monthYearToEstimatesArrayMap.has(key)) {
                let estimatesArr = monthYearToEstimatesArrayMap.get(key);
                let estimateTotal = 0;
                for (let j = 0; j < estimatesArr.length; j++) {
                    estimateTotal += estimatesArr[j];
                }
                let avgEstimate = estimateTotal / estimatesArr.length;
                obj = {x: xVal, y: avgEstimate};
            } else {
                obj = {x: xVal, y: 0};
            }
            data.push(obj);
        }
        return data;
    }

    getCashFlowData(propertySummary, expenses) {

        let data = [];
        if (!propertySummary) {
            return;
        }
        let income = propertySummary["total_rent"];
        let totalIncome = parseFloat(income);
        let incomeBar = [];
        incomeBar.push(
            {value: income, color: "#296CF6", label: "Income"}
        );
        let incomeObj = {bar: incomeBar}
        data.push(incomeObj);

        let expensesBar = [];

        let totalMortgagePayment = propertySummary["total_mortgage_payment"];
        let totalExpenses = 0;

        expensesBar.push(
            {value: parseFloat(Number(totalMortgagePayment).toFixed(2)), color: "", label: "Loan/Mortgage"}
        );
        totalExpenses += parseFloat(Number(totalMortgagePayment).toFixed(2));

        let totalPropertyManager = propertySummary["total_property_manager_fee"];
        expensesBar.push(
            {value: parseFloat(Number(totalPropertyManager).toFixed(2)), color: "", label: "Property Manager"}
        );

        totalExpenses += parseFloat(Number(totalPropertyManager).toFixed(2));

        for (let i = 0; i < expenses.length; i++) {
            let expense = expenses[i];
            let title = expense["title"];
            let amount = expense["amount"];
            expensesBar.push(
                {value: amount, color: "", label: title}
            );
            totalExpenses += parseFloat(amount);
        }

        let expensesObj = {bar: expensesBar};
        data.push(expensesObj);
        return [data, totalIncome, totalExpenses];
    }

    convertBoughDateToText(boughtDate) {

        let monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        // Format is 10/2020
        let split = boughtDate.split("/");
        if (split.length !== 2) {
            return boughtDate;
        }

        let month = split[0];
        let monthNum = parseInt(month);
        let year = split[1];

        return monthArr[monthNum - 1] + " " + year;
    }

    setActiveExpandedExpenseCard(expense) {
        this.setState({
            currActiveExpandedExpense: expense,
        })
    }

    deleteExpense(expenseID) {

        let userID = this.state.user["id"];
        let deleteExpenseURL = URLBuilder('api/user/expenses/', userID, expenseID);
        
        axios({
            method: 'delete',
            url: deleteExpenseURL,
        }).then(response => {
            let expensesMap = this.state.expensesMap;
            expensesMap.delete(expenseID);

            this.setState({
                expensesMap: expensesMap,
            })
        }).catch(error => {
            console.log(error)
        })
    }

    portfolioPercentageCallback(selectable) {
        this.setState({
            percentPortfolioSelected: selectable,
        })
    }

    getPercentPortfolioValue() {
        switch(this.state.percentPortfolioSelected) {
            case "Estimate":
                return Number(parseFloat(this.state.property["estimate"]) / this.state.totalEstimateWorth * 100.0).toFixed(2);
            case "Price Bought":
                return Number(parseFloat(this.state.property["price_bought"]) / this.state.totalPurchasePrice * 100.0).toFixed(2);
            case "Square Ft":
                return Number(parseFloat(this.state.property["square_footage"]) / this.state.totalSquareFeet * 100.0).toFixed(2);
        }
    }

    renderFileElements() {
        let filesMap = this.state.filesMap;
        let filesIterator = filesMap.entries();
        let fileElements = [];
    
        let fileNextElem = filesIterator.next();
        while (fileNextElem !== null && fileNextElem !== undefined && fileNextElem.value !== undefined){
            // fileNextElem: [0] is fileID, [1] is file.
            let file = fileNextElem.value[1];
            fileElements.push(
                <FileCard
                    key={file["id"]}
                    data={{
                        state: {
                            file: file,
                            backgroundColor: "white",
                            setActiveFileAttributes: null,
                            openSignedURL: openSignedURL,
                            isSmall: true,
                        }
                    }}
                >
    
                </FileCard>
            );
            fileNextElem = filesIterator.next();
        }
        if (fileElements.length === 0){
            fileElements.push(
                renderNoFiles()
            );
        }
        return fileElements;
    }

    renderViewPage() {
        let barChartData = this.getHistoricalAnalysisData();
        let cashFlowData = this.state.cashFlowData;

        switch (this.state.viewToDisplay) {
            case overviewView:
                return (
                    <div className="view_to_display_box">
                        <div className="view_to_display_info_box">
                            <p className="view_to_display_info_box_title">
                                Property Info
                            </p>
                            {
                                this.state.property["currently_rented"] ? 
                                <div className="property_page_currently_rented_box">
                                    <FaCheckCircle className="property_page_currently_rented_icon"></FaCheckCircle>
                                    <p className="property_page_currently_rented_text">Currently Rented</p>
                                </div>:
                                <div></div>
                            }
                            <div className="clearfix"/>
                            <div className="view_to_display_info_left_box">
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle property_page_property_type">
                                        {this.convertPropertyTypeToText(this.state.property["property_type"])}
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        <b>{this.state.property["address"]}</b>,&nbsp;&nbsp;{this.state.property["city"]}, {this.state.property["state"]} {this.state.property["zip_code"]}
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        <b>{this.state.property["num_units"]}</b>&nbsp;unit(s)
                                    </p>
                                </li>
                            </div>
                            <div className="view_to_display_info_right_box">
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        Estimate:&nbsp;&nbsp;<b>${
                                            this.state.property["estimate"] ?
                                            numberWithCommas(this.state.property["estimate"]) :
                                            numberWithCommas(this.state.property["price_bought"])
                                        }</b>
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        <b>{this.state.property["num_beds"]}</b> beds &nbsp;<b>{this.state.property["num_baths"]}</b> baths
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        <b>{numberWithCommas(this.state.property["square_footage"])}</b> square ft.
                                    </p>
                                </li>
                            </div>
                            <div className="clearfix"/>
                        </div>
                        <div className="view_to_display_info_box">
                            <p className="view_to_display_info_box_title">
                                Financial Info
                            </p>
                            <div className="clearfix"/>
                            <div className="view_to_display_info_left_box">
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        Bought on <b>{this.convertBoughDateToText(this.state.property["bought_date"])}</b>
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        Price Bought: <b>${numberWithCommas(this.state.property["price_bought"])}</b>
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        Down Payment: <b>${numberWithCommas(this.state.property["down_payment"])}</b>
                                    </p>
                                </li>
                            </div>
                            <div className="view_to_display_info_right_box">
                                {
                                    this.state.property["currently_rented"] ?
                                    <li className="view_to_display_info_box_bullet">
                                        <p className="view_to_display_info_box_subtitle">
                                            Rent:&nbsp;<b>${numberWithCommas(this.state.property["price_rented"])}</b> / mo.
                                        </p>
                                    </li> :
                                    <div></div>
                                }
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        Loan/Mortgage:&nbsp;<b>${numberWithCommas(this.state.property["price_mortgage"])}</b> / mo.
                                    </p>
                                </li>
                            </div>
                            <div className="clearfix"/>
                        </div>
                        <div className="view_to_display_info_box">
                            <p className="view_to_display_info_box_title">
                                Miscellaneous Info
                            </p>
                            <div className="clearfix"/>
                            <div className="view_to_display_info_left_box">
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        Loan/Mortgage Company <b>{this.state.property["mortgage_company"]}</b>
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        Loan/Mortgage Interest Rate: <b>{numberWithCommas(this.state.property["mortgage_interest_rate"])}%</b>
                                    </p>
                                </li>
                            </div>
                            <div className="view_to_display_info_right_box">
                                {
                                    this.state.property["currently_rented"] ?
                                    <li className="view_to_display_info_box_bullet">
                                        <p className="view_to_display_info_box_subtitle">
                                            Rent Payment Date: <b>{this.state.property["rent_payment_date"]}{getDateSuffix(this.state.property["rent_payment_date"])}</b>
                                        </p>
                                    </li> :
                                    <div></div>
                                }
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        Loan/Mortgage Payment Date: <b>{this.state.property["mortgage_payment_date"]}{getDateSuffix(this.state.property["mortgage_payment_date"])}</b>
                                    </p>
                                </li>
                            </div>
                            <div className="clearfix"/>
                        </div>
                        <div className="view_to_display_info_box">
                            <p className="view_to_display_info_box_title">
                                Map
                            </p>
                            <div className="clearfix"/>
                            <img className="view_to_display_info_box_map" src={this.state.googleMapsURL}>
                            </img>
                            <div className="clearfix"/>
                        </div>
                    </div>
                );
            case analysisView:
                return (
                    <div className="view_to_display_box">
                        <div className="view_to_display_box_analysis_top_box">
                            <div className="analysis_property_value_bar_chart">
                                <p className="analysis_chart_title">
                                    Property Value
                                </p>
                                <BarChart 
                                    height={"300"}
                                    width={"650"}
                                    yAxisFontSize={"0.8em"}
                                    xAxisFontSize={"0.80em"}
                                    xAxisColor={"grey"}
                                    yAxisColor={"grey"}
                                    barColor={"#296CF6"}
                                    capitalizeXAxis={true}
                                    displayTooltip={true}
                                    data={barChartData}/>
                            </div>
                            <div className="analysis_vertical_divider_large"></div>
                            <div className="analysis_circular_box">
                                <p style={{
                                    float: "left",
                                }}
                                className="analysis_chart_title">
                                    Portfolio Percentage
                                </p>
                                <div style={{
                                    float: "right",
                                    zIndex: "30",
                                }}>
                                    <Dropdown
                                        backgroundColor={"#296CF6"}
                                        borderRadius={"50px"}
                                        height={"30"}
                                        width={"110"}
                                        defaultValue={this.state.percentPortfolioSelected}
                                        color={"white"}
                                        fontWeight={"bold"}
                                        fontSize={"0.85em"}
                                        selectables={["Estimate", "Price Bought", "Square Ft"]}
                                        callback={this.portfolioPercentageCallback}
                                    ></Dropdown>
                                </div>
                                <div className="clearfix"></div>
                                <div style={{
                                    position: "relative",
                                    zIndex: "10",
                                }}
                                className="percent_portfolio_circle_graph">
                                    <CircularProgressbarWithChildren
                                        value={this.getPercentPortfolioValue()}
                                        backgroundPadding={3}
                                        strokeWidth={12}
                                        styles={buildStyles({
                                            backgroundColor: "#fff",
                                            textColor: "#296CF6",
                                            textSize: "10px",
                                            pathColor: "#296CF6",
                                            trailColor: "#f5f5fa",
                                        })}>
                                        {
                                            <div>
                                                <p 
                                                    style={{
                                                        userSelect: "none",
                                                    }}
                                                    className="circular_progress_bar_inner_text_large">
                                                    {numberWithCommas(Number(this.getPercentPortfolioValue()).toFixed(2))}%
                                                </p>
                                                <p 
                                                    style={{
                                                        userSelect: "none",
                                                    }}
                                                    className="circular_progress_bar_inner_text_large_subtitle">
                                                    of Portfolio
                                                </p>
                                            </div>
                                        }  
                                    </CircularProgressbarWithChildren>
                                </div>
                            </div>
                        </div>
                        <div className="clearfix"/>
                        <div className="view_to_display_box_analysis_divider"></div>
                        <div className="view_to_display_box_analysis_middle_box">
                            <div className="view_to_display_box_analysis_middle_box_left_box">
                                <div className="view_to_display_box_analysis_middle_box_inner_box">
                                    <div className="view_to_display_box_analysis_middle_box_inner_box_circular_graph">
                                        <p className="analysis_chart_subtitle">
                                            Rate of Return
                                        </p>
                                        <CircularProgressbarWithChildren 
                                            value={parseFloat(this.state.propertySummary["annual_rate_of_return"])}
                                            background
                                            backgroundPadding={3}
                                            strokeWidth={10}
                                            styles={buildStyles({
                                                backgroundColor: "#fff",
                                                textColor: "#fff",
                                                pathColor: "#296CF6",
                                                trailColor: "#f5f5fa",
                                            })}>
                                            {
                                                <div>
                                                    <p className="circular_progress_bar_inner_text_small">
                                                        {numberWithCommas(Number(this.state.propertySummary["annual_rate_of_return"]).toFixed(2))}%
                                                    </p>
                                                    <p className="circular_progress_bar_inner_text_small_subtitle">
                                                        ARR
                                                    </p>
                                                </div>
                                            }  
                                        </CircularProgressbarWithChildren>
                                    </div>
                                </div>
                                <div className="view_to_display_box_analysis_middle_box_inner_box">
                                    <div className="view_to_display_box_analysis_middle_box_inner_box_circular_graph">
                                        <p className="analysis_chart_subtitle">
                                            Loan to Value
                                        </p>
                                        <CircularProgressbarWithChildren 
                                            value={parseFloat(this.state.propertySummary["average_ltv"])}
                                            background
                                            backgroundPadding={3}
                                            strokeWidth={10}
                                            styles={buildStyles({
                                                backgroundColor: "#fff",
                                                textColor: "#fff",
                                                pathColor: "#296CF6",
                                                trailColor: "#f5f5fa",
                                            })}>
                                            {
                                                <div>
                                                    <p className="circular_progress_bar_inner_text_small">
                                                        {numberWithCommas(Number(this.state.propertySummary["average_ltv"]).toFixed(2))}%
                                                    </p>
                                                    <p className="circular_progress_bar_inner_text_small_subtitle">
                                                        LTV
                                                    </p>
                                                </div>
                                            }  
                                            </CircularProgressbarWithChildren>
                                    </div>
                                </div>
                                <div className="view_to_display_box_analysis_middle_box_inner_box">
                                    <div className="view_to_display_box_analysis_middle_box_inner_box_circular_graph">
                                        <p className="analysis_chart_subtitle">
                                            Debt to Income
                                        </p>
                                        <CircularProgressbarWithChildren 
                                            value={parseFloat(this.state.propertySummary["average_dti"])}
                                            background
                                            backgroundPadding={3}
                                            strokeWidth={10}
                                            styles={buildStyles({
                                                backgroundColor: "#fff",
                                                textColor: "#fff",
                                                pathColor: "#296CF6",
                                                trailColor: "#f5f5fa",
                                            })}>
                                            {
                                                <div>
                                                    <p className="circular_progress_bar_inner_text_small">
                                                        {numberWithCommas(Number(this.state.propertySummary["average_dti"]).toFixed(2))}%
                                                    </p>
                                                    <p className="circular_progress_bar_inner_text_small_subtitle">
                                                        DTI
                                                    </p>
                                                </div>
                                            }  
                                            </CircularProgressbarWithChildren>
                                    </div>
                                </div>
                            </div>
                            <div className="analysis_vertical_divider_small"></div>
                            <div className="analysis_cash_flow_quadrant_box">
                                <p className="analysis_chart_subtitle">
                                    Cash Flow
                                </p>
                                <SideBarChart
                                    height={"100"}
                                    width={"300"}
                                    barHeight={"25px"}
                                    data={cashFlowData}
                                />
                                <div className="analysis_cash_flow_label_box">
                                    <p className="analysis_cash_flow_label_title">${Number(this.state.totalIncome - this.state.totalExpenses).toFixed(2)} / mo.</p>
                                </div>

                            </div>
                        </div>
                    </div>
                );
            case expensesView:
                return (
                    <div className="view_to_display_box">
                        <ExpensesTable data={{
                            state:{
                                user: this.state.user,
                                expenses: this.state.expenses,
                                expensesMap: this.state.expensesMap,
                                propertiesMap: null,
                                isSpecificProperty: true,
                                specificPropertyAddress: this.state.property["address"],
                                setActiveExpandedExpenseCard: this.setActiveExpandedExpenseCard,
                        }}}/>
                    </div>
                );
            case filesView:
                return (
                    <div className="view_to_display_box">
                        <div className="files_view_to_display_box">
                            {this.renderFileElements()}
                        </div>
                    </div>
                );
            case settingsView:
                return (
                    <div className="view_to_display_box">
                        
                    </div>
                );
        }
    }

    render() {
        if (this.state.redirectToPropertiesPage) {
            return <Redirect to={{
                pathname: this.state.redirectToPropertiesPage,
                state: {
                    user: this.state.user,
                    // Pass in the profilePicture so we don't have to load it again.
                    profilePicture: this.state.profilePicture
                }
            }} />
        }
        if (this.state.isLoading) {
            return (
                <div></div>
            );
        }
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        user: this.state.user,
                        propertyID: this.state.activePropertyID,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        profilePicture: this.state.profilePicture,
                        currentPage: "properties",
                    }
                }}/>
                {this.state.isLoading ? <div></div> : 
                <div>
                    <div className="property_page_property_type_box">
                        {this.state.currActiveExpandedExpense !== null ? 
                            <div className="expenses_dashboard_display_add_expense_box">
                                <ExpandedExpenseCard data={{
                                    state: {
                                        user: this.state.user,
                                        expense: this.state.currActiveExpandedExpense,
                                        propertiesMap: this.state.propertiesMap,
                                        setActiveExpandedExpenseCard: this.setActiveExpandedExpenseCard,
                                    }
                                }}>
                                </ExpandedExpenseCard>
                            </div> :
                            <div></div>}
                        <div className="property_page_inner_box">
                            <div className="property_page_buttons_box">
                                <Link to={{
                                    pathname: "/addproperty",
                                    state: {
                                        user: this.state.user,
                                        totalEstimateWorth: this.state.totalEstimateWorth,
                                        missingEstimate: this.state.missingEstimate,
                                        profilePicture: this.state.profilePicture
                                    }
                                }}>
                                    <div className="page_button property_page_page_button">
                                        New Property
                                    </div>
                                </Link>
                            </div>
                            <div className="property_page_redirect_back_box">
                                <div 
                                    onClick={() => {
                                        this.setState({
                                            redirectToPropertiesPage: "/properties",
                                        })
                                    }}
                                    className="property_page_back_to_folders_button">
                                    <IoCaretBackOutline className="property_page_back_to_folders_button_icon"></IoCaretBackOutline>
                                    <p className="property_page_back_to_folders_button_text">Properties</p>
                                </div>
                                <p className="property_page_folder_name_title">{this.state.property["address"]}</p>
                                <p className="property_page_folder_name_subtitle">{this.state.property["state"]},&nbsp;{this.state.property["zip_code"]}</p>
                            </div>
                            <div className="clearfix"/>
                            <div className="property_page_view_box">
                                <div className="property_page_view_box_tabs_box">
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: overviewView,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === overviewView ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <MdDashboard  className={
                                            this.state.viewToDisplay === overviewView ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></MdDashboard >
                                        <p className={
                                            this.state.viewToDisplay === overviewView ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Overview</p>
                                    </li>
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: analysisView,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === analysisView ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <SiGoogleanalytics className={
                                            this.state.viewToDisplay === analysisView ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></SiGoogleanalytics>
                                        <p className={
                                            this.state.viewToDisplay === analysisView ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Analysis</p>
                                    </li>
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: expensesView,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === expensesView ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <FaMoneyCheck className={
                                            this.state.viewToDisplay === expensesView ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></FaMoneyCheck>
                                        <p className={
                                            this.state.viewToDisplay === expensesView ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Expenses</p>
                                    </li>
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: filesView,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === filesView ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <GoFileDirectory className={
                                            this.state.viewToDisplay === filesView ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></GoFileDirectory>
                                        <p className={
                                            this.state.viewToDisplay === filesView ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Files</p>
                                    </li>
                                    <li 
                                        onClick={() => {
                                            this.setState({
                                                viewToDisplay: settingsView,
                                            })
                                        }}
                                        className={
                                            this.state.viewToDisplay === settingsView ? 
                                            "property_page_view_box_tab property_page_view_box_active_tab" :
                                            "property_page_view_box_tab"
                                        }>
                                        <IoSettingsSharp className={
                                            this.state.viewToDisplay === settingsView ? 
                                            "property_page_view_box_tab_icon property_page_view_box_tab_active_icon" :
                                            "property_page_view_box_tab_icon"
                                        }></IoSettingsSharp>
                                        <p className={
                                            this.state.viewToDisplay === settingsView ? 
                                            "property_page_view_box_tab_text property_page_view_box_tab_active_text" :
                                            "property_page_view_box_tab_text"
                                        }>Settings</p>
                                    </li>
                                </div>
                                <div className="clearfix"/>
                                {/* <div className="property_page_view_box_bottom_border">
                                </div> */}
                                {this.renderViewPage()}
                            </div>
                        </div>
                        
                    </div>
                </div>}
                <NotificationSidebar data={{
                    state: {
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate 
                    }
                }}/>
            </div>
        )
    }
}

export default PropertyPage;