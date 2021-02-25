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
import AddNewTenantModal from './AddNewTenantModal.js';
import AddNewPropertyManagerModal from './AddNewPropertyManagerModal.js';
import WarningModal from '../utility/WarningModal.js';

import { monthArr, 
        numberWithCommas, 
        openSignedURL, 
        getDateSuffix, 
        getTrailingTwelveMonths, 
        getMonthAndYear,
        getCashFlowData,
        getHistoricalAnalysisData } from '../utility/Util.js';
import { renderNoFiles } from './FilesDashboard.js';

import { Link, Redirect } from 'react-router-dom';

import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';

import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { FaMoneyCheck, FaCheckCircle } from 'react-icons/fa';
import { MdDashboard, MdEdit, MdEmail, MdPhone, MdAttachMoney } from 'react-icons/md';
import { IoMdBriefcase } from 'react-icons/io';
import { IoTrashSharp, IoCaretBackOutline, IoSettingsSharp, IoAddCircleSharp, IoCalendarClearSharp } from 'react-icons/io5';
import { TiUser } from 'react-icons/ti';
import { AiFillCalendar } from 'react-icons/ai';

let URLBuilder = require('url-join');

const overviewView = "overview_view";
const analysisView = "analysis_view";
const expensesView = "expenses_view";
const filesView = "files_view";
const settingsView = "settings_view";
const peopleView = "people_view";
const editView = "edit_view";

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
            cashFlowSelected: "Current Month",
        };

        this.renderViewPage = this.renderViewPage.bind(this);
        this.convertPropertyTypeToText = this.convertPropertyTypeToText.bind(this);
        this.convertBoughDateToText = this.convertBoughDateToText.bind(this);
        this.renderFileElements = this.renderFileElements.bind(this);
        this.setActiveExpandedExpenseCard = this.setActiveExpandedExpenseCard.bind(this);

        this.portfolioPercentageCallback = this.portfolioPercentageCallback.bind(this);
        this.getPercentPortfolioValue = this.getPercentPortfolioValue.bind(this);

        this.cashFlowCallback = this.cashFlowCallback.bind(this);
        this.getCashFlowValue = this.getCashFlowValue.bind(this);

        this.closeModal = this.closeModal.bind(this);
        this.closeNewTenantModal = this.closeNewTenantModal.bind(this);
        this.closeNewPropertyManagerModal = this.closeNewPropertyManagerModal.bind(this);

        this.renderTenants = this.renderTenants.bind(this);
    }

    componentDidMount() {
        let host = this.state.host;

        /*** Set our GoogleMapsURL ***/
        let propertyGoogleMapsURL = (this.state.property["address_one"] + (this.state.property["address_two"] ? " " + this.state.property["address_two"] : "")) + "," + this.state.property["city"] + "," + this.state.property["state"];
        propertyGoogleMapsURL = propertyGoogleMapsURL.replace(" ", "+");

        let markerCenter = (this.state.property["address_one"] + (this.state.property["address_two"] ? " " + this.state.property["address_two"] : "")) + "," + this.state.property["state"];
        markerCenter = markerCenter.replace(" ", "+");

        let googleMapsURL = 'https://maps.googleapis.com/maps/api/staticmap?center=' + propertyGoogleMapsURL + '&zoom=15&size=1000x300&maptype=roadmap&markers=color:0x296CF6%7C' + markerCenter + '&key=AIzaSyCbudHvO__fMV1eolNO_g5qtE2r2UNcjcA';
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
        let getTenantsURL = URLBuilder(host, '/api/user/tenants', userID, propertyID);

        const getExpensesByPropertyRequest = axios.get(getExpensesByPropertyListURL);
        const getFilesByPropertyRequest = axios.get(getFilesByPropertyURL);
        const getPropertiesHistoricalRequest = axios.get(getPropertiesHistoryURL);
        const getPropertySummaryRequest = axios.get(getPropertySummaryURL);
        const getTenantsRequest = axios.get(getTenantsURL);

        axios.all(
            [
                getExpensesByPropertyRequest, 
                getFilesByPropertyRequest, 
                getPropertiesHistoricalRequest, 
                getPropertySummaryRequest, 
                getTenantsRequest
            ]
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

            if (files && files !== undefined && files.length > 0) {
                files = files.sort(function(a, b){
                    if (a["last_modified_at"] < b["last_modified_at"]) {
                        return 1;
                    } else if (a["last_modified_at"] > b["last_modified_at"]) {
                        return -1;
                    }
                    return 0;
                });

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
            let cashFlowObj = getCashFlowData(propertySummary, expenses);
            let cashFlowData = cashFlowObj[0];
            let totalIncome = cashFlowObj[1];
            let totalExpenses = cashFlowObj[2];

            /* Handle our tenants response */
            const tenantsRequestResponse = responses[4];
            let tenants = tenantsRequestResponse.data;

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
                tenants: tenants,
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

    convertBoughDateToText(boughtDate) {

        if (!boughtDate || boughtDate === undefined) {
            return "";
        }

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
    
    cashFlowCallback(selectable) {
        this.setState({
            cashFlowSelected: selectable,
        })
    }

    getCashFlowValue() {
        switch(this.state.cashFlowSelected) {
            case "Current Month":
            case "Monthly Average":
            case "Past Year":
            case "Year to Date":
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

    renderTenants() {
        let tenants = this.state.tenants;

        let elements = [];
        for (let i = 0; i < tenants.length; i++) {
            let tenant = tenants[i];
            let borderRadius;
            if (i === 0 && i === tenants.length - 1) {
                borderRadius = "4px";
            } else if (i === 0) {
                borderRadius = "4px 4px 0px 0px";
            } else if (i === tenants.length - 1) {
                borderRadius = "0px 0px 4px 4px";
            } else {
                borderRadius = "0px";
            }

            elements.push(
                <div style={{
                    float: "left",
                    marginTop: "10px",
                    width: "100%",
                }}>
                    <div style={{
                    }}>
                        <TiUser style={{
                            border: "1px solid #d3d3d3",
                            borderRadius: "50%",
                            color: "#d3d3d3",
                            float: "left",
                            height: "50px",
                            width: "50px", 
                        }}/>
                        <div style={{
                            float: "left",
                            marginLeft: "10px",
                            marginTop: "6px",
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
                </div>
            );

            // elements.push(
            //     <div style={{
            //         // backgroundColor: "#f5f5fa",
            //         border: "1px solid #d3d3d3",
            //         borderRadius: borderRadius,
            //         // boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
            //         float: "left",
            //         padding: "15px 20px 15px 20px",
            //         width: "calc(100% - 40px)",
            //     }}>
            //         <div style={{
            //             marginTop: "0px",
            //         }}>
            //             <p style={{
            //                 fontSize: "1.2em",
            //                 fontWeight: "bold",
            //             }}>
            //                 {tenant["name"]}
            //             </p>
            //             <div style={{
            //                 marginTop: "20px",
            //             }}>
            //                 {/* <MdEmail style={{
            //                     color: "#32384D",
            //                     float: "left",
            //                     height: "25px",
            //                     width: "25px",
            //                 }}/> */}
            //                 <p style={{
            //                     float: "left",
            //                     lineHeight: "25px",
            //                     marginLeft: "7.5px",
            //                 }}>
            //                     {tenant["email"]}
            //                 </p>
            //             </div>
            //             <div className="clearfix"/>
            //             <div style={{
            //                 marginTop: "10px",
            //             }}>
            //                 {/* <MdPhone style={{
            //                     color: "#32384D",
            //                     float: "left",
            //                     height: "25px",
            //                     width: "25px",
            //                 }}/> */}
            //                 <p style={{
            //                     float: "left",
            //                     lineHeight: "25px",
            //                     marginLeft: "7.5px",
            //                 }}>
            //                     {tenant["phone"]}
            //                 </p>
            //             </div>
            //             <div className="clearfix"/>
            //             <div style={{
            //                 marginTop: "10px",
            //             }}>
            //                 {/* <IoMdBriefcase style={{
            //                         color: "#32384D",
            //                         float: "left",
            //                         height: "25px",
            //                         width: "25px",
            //                     }}/> */}
            //                 <p style={{
            //                     float: "left",
            //                     lineHeight: "25px",
            //                     marginLeft: "7.5px",
            //                 }}>
            //                     {tenant["occupation"]}
            //                 </p>
            //             </div>
            //             <div className="clearfix"/>
            //             <div style={{
            //                 marginTop: "10px",
            //             }}>
            //                 {/* <MdAttachMoney style={{
            //                         color: "#32384D",
            //                         float: "left",
            //                         height: "25px",
            //                         width: "25px",
            //                     }}/> */}
            //                 <p style={{
            //                     float: "left",
            //                     lineHeight: "25px",
            //                     marginLeft: "7.5px",
            //                 }}>
            //                     {tenant["income"] ? "$" + numberWithCommas(tenant["income"]) : "$-"}
            //                 </p>
            //             </div>
            //             <div className="clearfix"/>
            //             <div style={{
            //                 marginTop: "40px",
            //             }}>
            //                 {/* <IoCalendarClearSharp style={{
            //                     color: "#32384D",
            //                     float: "left",
            //                     height: "25px",
            //                     width: "25px",
            //                 }}/> */}
            //                 <p style={{
            //                     float: "left",
            //                     lineHeight: "25px",
            //                     marginLeft: "7.5px",
            //                 }}>
            //                     {tenant["start_date"]} - {tenant["active"] ? "present" : tenant["end_date"]}
            //                 </p>
            //             </div>
            //         </div>
            //     </div>
            // );
        }

        return (
            <div style={{
                marginLeft: "30px",
                marginRight: "30px",
                marginTop: "10px",
                minHeight: "250px",
                width: "calc(100% - 60px)",
            }}>
                <div style={{
                    width: "100%",
                }}>
                    <div style={{
                        float: "left",
                        width: "55%",
                    }}>
                        <p style={{
                            float: "left",
                            fontWeight: "bold",
                        }}>
                            Name
                        </p>
                    </div>
                    <div style={{
                        float: "left",
                        width: "22.5%",
                    }}>
                        <p style={{
                            float: "left",
                            fontWeight: "bold",
                        }}>
                            Start Date
                        </p>
                    </div>
                    <div style={{
                        float: "left",
                        width: "22.5%",
                    }}>
                        <p style={{
                            float: "left",
                            fontWeight: "bold",
                        }}>
                            Status
                        </p>
                    </div>
                </div>
                {elements}
            </div>
        );
    }

    closeModal() {
        this.setState({
            displayDeletePropertyModal: false,
        })
    }

    closeNewTenantModal() {
        this.setState({
            displayNewTenant: false,
        })
    }

    closeNewPropertyManagerModal() {
        this.setState({
            displayNewPropertyManager: false,
        })
    }

    renderViewPage() {
        let barChartData = getHistoricalAnalysisData(this.state.historicalAnalysis);
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
                                        <b>{this.state.property["address_one"]} {this.state.property["address_two"]}</b>,&nbsp;&nbsp;{this.state.property["city"]}, {this.state.property["state"]} {this.state.property["zip_code"]}
                                    </p>
                                </li>
                                <li className="view_to_display_info_box_bullet">
                                    <p className="view_to_display_info_box_subtitle">
                                        <b>{this.state.property["num_units"] ? this.state.property["num_units"] : 1}</b>&nbsp;unit(s)
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
                                        Bought on: <b>{this.convertBoughDateToText(this.state.property["bought_date"])}</b>
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
                                        Loan/Mortgage Company: <b>{this.state.property["mortgage_company"]}</b>
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
                                <p style={{
                                    float: "left",
                                }}
                                className="analysis_chart_subtitle">
                                    Cash Flow
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
                                        defaultValue={this.state.cashFlowSelected}
                                        color={"white"}
                                        fontWeight={"bold"}
                                        fontSize={"0.75em"}
                                        selectables={["Current Month", "Monthly Average", "Past Year", "Year to Date"]}
                                        callback={this.cashFlowCallback}
                                    ></Dropdown>
                                </div>
                                <div className="clearfix"/>
                                <div className="analysis_cash_flow_label_box">
                                    <p className="analysis_cash_flow_label_title">${numberWithCommas(Number(this.state.totalIncome - this.state.totalExpenses).toFixed(2))} / mo.</p>
                                </div>
                                <div style={{
                                    marginTop: "15px",
                                }}>
                                    <SideBarChart
                                        height={"100"}
                                        width={"300"}
                                        barHeight={"25px"}
                                        data={cashFlowData}
                                    />
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
                                specificPropertyAddress: this.state.property["address_one"] + (this.state.property["address_two"] ? " " + this.state.property["address_two"] : ""),
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
            case peopleView:
                return (
                    <div className="view_to_display_box">
                        <div className="view_to_display_info_box">
                            <p className="view_to_display_info_box_title">
                                Tenants
                            </p>
                            {
                                this.state.tenants && this.state.tenants.length > 0 ?
                                <IoAddCircleSharp 
                                    onMouseDown={() => {
                                        this.setState({
                                            displayNewTenant: true,
                                        })
                                    }}
                                    className="opacity"
                                    style={{
                                        color: "#296CF6",
                                        cursor: "pointer",
                                        float: "left",
                                        height: "25px",
                                        marginLeft: "15px",
                                        marginTop: "20px",
                                        width: "25px",
                                    }}/> : 
                                <div></div>
                            }
                        </div>
                        <div className="clearfix"/>
                        <div>
                            {
                                this.state.tenants && this.state.tenants.length > 0 ?
                                <div>
                                    {this.renderTenants()}
                                </div> :
                                <div style={{
                                    height: "300px",
                                    width: "100%",
                                }}>
                                    <p style={{
                                        fontWeight: "bold",
                                        marginTop: "50px",
                                        textAlign: "center",
                                    }}>
                                        No tenants yet.
                                    </p>
                                    <div 
                                        onMouseDown={() => {
                                            this.setState({
                                                displayNewTenant: true,
                                            })
                                        }}
                                        className="opacity"
                                        style={{
                                            backgroundColor: "#296CF6",
                                            borderRadius: "10px",
                                            boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                            cursor: "pointer",
                                            marginBottom: "50px",
                                            marginLeft: "calc((100% - 170px)/2)",
                                            marginRight: "calc((100% - 170px)/2)",
                                            marginTop: "25px",
                                            padding: "10px",
                                            width: "150px",
                                    }}>
                                        <p style={{
                                            color: "white",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            userSelect: "none",
                                        }}>
                                            Add Tenant
                                        </p>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="clearfix"/>
                        <div className="view_to_display_info_box">
                            <p className="view_to_display_info_box_title">
                                Property Manager
                            </p>
                        </div>
                        <div className="clearfix"/>
                        <div>
                            {
                                this.state.tenantsSummary ?
                                <div></div> :
                                <div style={{
                                    height: "300px",
                                    width: "100%",
                                }}>
                                    <p style={{
                                        fontWeight: "bold",
                                        marginTop: "50px",
                                        textAlign: "center",
                                    }}>
                                        No property manager yet.
                                    </p>
                                    <div 
                                        onMouseDown={() => {
                                            this.setState({
                                                displayNewPropertyManager: true,
                                            })
                                        }}
                                        className="opacity"
                                        style={{
                                            backgroundColor: "#296CF6",
                                            borderRadius: "10px",
                                            boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                            cursor: "pointer",
                                            marginBottom: "50px",
                                            marginLeft: "calc((100% - 220px)/2)",
                                            marginRight: "calc((100% - 220px)/2)",
                                            marginTop: "25px",
                                            padding: "10px",
                                            width: "200px",
                                    }}>
                                        <p style={{
                                            color: "white",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            userSelect: "none",
                                        }}>
                                            Add Property Manager
                                        </p>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                );
            case editView:
                return (
                    <div className="view_to_display_box">
                        <div className="view_to_display_info_box">
                            <p className="view_to_display_info_box_title">
                                Edit Property
                            </p>
                            <p 
                                onMouseDown={() => {
                                    this.setState({
                                        editItems: true,
                                    })
                                }}
                                style={{
                                    color: "#296CF6",
                                    cursor: "pointer",
                                    float: "right",
                                    fontWeight: "bold",
                                    marginRight: "30px",
                                    marginTop: "20px",
                            }}>
                                Edit
                            </p>
                        </div>
                        <div className="clearfix"/>
                        <p style={{
                            color: "#296CF6",
                            fontSize: "1.0em",
                            fontWeight: "bold",
                            marginLeft: "30px",
                            marginTop: "15px",
                        }}>
                            Property Details
                        </p>
                        <div style={{
                            height: "100px",
                            marginLeft: "30px",
                            marginRight: "30px",
                            marginTop: "10px",
                            width: "calc(100% - 60px)",
                        }}>
                            <div
                                style={{
                                    backgroundColor: "#d3d3d3",
                                    float: "left",
                                    height: "1px",
                                    marginTop: "10px",
                                    width: "100%",
                                }}
                            />
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        Address
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        {this.state.property["address_one"]}
                                    </p>
                                    <p>
                                        {this.state.property["address_two"]}
                                    </p>
                                </div>
                            </li>
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        State
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        {this.state.property["state"]}
                                    </p>
                                </div>
                            </li>
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        Zip Code
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        {this.state.property["zip_code"]}
                                    </p>
                                </div>
                            </li>
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        Bedrooms
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        {this.state.property["num_beds"]}
                                    </p>
                                </div>
                            </li>
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        Bathrooms
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        {numberWithCommas(this.state.property["num_baths"])}
                                    </p>
                                </div>
                            </li>
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        Square Footage
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        {numberWithCommas(this.state.property["square_footage"])}
                                    </p>
                                </div>
                            </li>
                        </div>
                        <p style={{
                            color: "#296CF6",
                            float: "left",
                            fontSize: "1.0em",
                            fontWeight: "bold",
                            marginLeft: "30px",
                            marginTop: "25px",
                        }}>
                            Property Details
                        </p>
                        <div style={{
                            height: "100px",
                            marginLeft: "30px",
                            marginRight: "30px",
                            marginTop: "10px",
                            width: "calc(100% - 60px)",
                        }}>
                            <div
                                style={{
                                    backgroundColor: "#d3d3d3",
                                    float: "left",
                                    height: "1px",
                                    marginTop: "10px",
                                    width: "100%",
                                }}
                            />
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        Bought Date
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        {this.state.property["bought_date"]}
                                    </p>
                                </div>
                            </li>
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        Bought Price
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        ${numberWithCommas(this.state.property["price_bought"])}
                                    </p>
                                </div>
                            </li>
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        Estimate
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        ${numberWithCommas(this.state.property["estimate"])}
                                    </p>
                                </div>
                            </li>
                            <li className="edit_view_element">
                                <div className="edit_view_first_box">
                                    <p className="edit_view_first_box_title">
                                        Down Payment
                                    </p>
                                </div>
                                <div className="edit_view_second_box">
                                    <p>
                                        ${numberWithCommas(this.state.property["down_payment"])}
                                    </p>
                                </div>
                            </li>
                        </div>
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
                    {
                        this.state.displayDeletePropertyModal ?
                        <WarningModal 
                            data={{
                                state: {
                                    titleText: "Are you sure you would like to delete this property?",
                                    subText: "This action is irreversible and will delete all information associated with this property, including files, expenses, etc.",
                                    closeModal: this.closeModal,
                                }
                            }}
                        /> :
                        <div></div>
                    }
                    {
                        this.state.displayNewTenant ?
                        <AddNewTenantModal data={{
                            state: {
                                user: this.state.user,
                                propertyID: this.state.property["id"],
                                closeModal: this.closeNewTenantModal,
                            }
                        }}/>:
                        <div>
                        </div>
                    }
                    {
                        this.state.displayNewPropertyManager ?
                        <AddNewPropertyManagerModal data={{
                            state: {
                                closeModal: this.closeNewPropertyManagerModal,
                            }
                        }}/>:
                        <div>
                        </div>
                    }
                    <div className="property_page_property_type_box">
                        {
                            this.state.currActiveExpandedExpense !== null ? 
                            <div className="expenses_dashboard_display_add_expense_box">
                                <ExpandedExpenseCard data={{
                                    state: {
                                        user: this.state.user,
                                        expense: this.state.currActiveExpandedExpense,
                                        propertiesMap: this.state.propertiesMap,
                                        setActiveExpandedExpenseCard: this.setActiveExpandedExpenseCard,
                                    }
                                }}/>
                            </div> :
                            <div></div>
                        }
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
                                    onMouseDown={() => {
                                        this.setState({
                                            redirectToPropertiesPage: "/properties",
                                        })
                                    }}
                                    className="property_page_back_to_folders_button">
                                    <IoCaretBackOutline className="property_page_back_to_folders_button_icon"></IoCaretBackOutline>
                                    <p className="property_page_back_to_folders_button_text">Properties</p>
                                </div>
                                <p className="property_page_folder_name_title">{this.state.property["address_one"] + (this.state.property["address_two"] ? " " + this.state.property["address_two"] : "")}</p>
                                <p className="property_page_folder_name_subtitle">{this.state.property["state"]},&nbsp;{this.state.property["zip_code"]}</p>
                            </div>
                            <div className="clearfix"/>
                            <div 
                                style={{
                                    marginTop: "10px",
                            }}>
                                <div 
                                    style={{
                                        height: "60px",
                                        width: "100%",
                                    }}>
                                    <li 
                                        onMouseDown={() => {
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
                                        onMouseDown={() => {
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
                                        onMouseDown={() => {
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
                                        onMouseDown={() => {
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
                                    {/* <li 
                                        onMouseDown={() => {
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
                                    </li> */}
                                    <div style={{
                                        float: "right",
                                        marginTop: "10px",
                                    }}> 
                                        <TiUser 
                                            className={
                                                this.state.viewToDisplay === peopleView ? 
                                                "property_page_icons active_property_page_icons" :
                                                "property_page_icons"
                                            }
                                            onMouseDown={() => {
                                                this.setState({
                                                    viewToDisplay: peopleView,
                                                })
                                            }}/>
                                        <MdEdit 
                                            className={
                                                this.state.viewToDisplay === editView ? 
                                                "property_page_icons active_property_page_icons" :
                                                "property_page_icons"
                                            }
                                            onMouseDown={() => {
                                                this.setState({
                                                    viewToDisplay: editView,
                                                })
                                            }}/>
                                        <IoTrashSharp 
                                            onMouseDown={() => {
                                                this.setState({
                                                    displayDeletePropertyModal: true,
                                                })
                                            }}
                                            className="property_page_icons"/>
                                    </div>
                                </div>
                                <div className="clearfix"/>
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