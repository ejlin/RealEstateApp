import React from 'react';
import axios from 'axios';

import './CSS/PropertyPage.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import ExpenseCard from './ExpenseCard.js';
import ExpensesTable from './ExpensesTable.js';
import FileCard from './FileCard.js';
import ExpandedExpenseCard from './ExpandedExpenseCard.js';
import BarChart from '../charts/BarChart.js';

import { numberWithCommas, openSignedURL, getDateSuffix } from '../utility/Util.js';
import { renderNoExpenses } from './ExpensesDashboard.js';
import { renderNoFiles } from './FilesDashboard.js';

import { Link, Redirect } from 'react-router-dom';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

import { IoTrashSharp, IoCaretBackOutline } from 'react-icons/io5';
import { BsFillHouseFill } from 'react-icons/bs';
import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { IoSettingsSharp } from 'react-icons/io5';
import { FiChevronDown } from 'react-icons/fi';
import { FaMoneyCheck, FaCheckCircle } from 'react-icons/fa';
import { MdFeedback, MdDashboard } from 'react-icons/md';

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
            viewToDisplay: overviewView,
            isLoading: false,
            currActiveExpandedExpense: null,
        };

        this.renderViewPage = this.renderViewPage.bind(this);
        this.convertPropertyTypeToText = this.convertPropertyTypeToText.bind(this);
        this.convertBoughDateToText = this.convertBoughDateToText.bind(this);
        this.renderFileElements = this.renderFileElements.bind(this);
        this.setActiveExpandedExpenseCard = this.setActiveExpandedExpenseCard.bind(this);
    }

    componentDidMount() {

        console.log(this.state.property);

        /*** Set our GoogleMapsURL ***/
        let propertyGoogleMapsURL = this.state.property["address"] + "," + this.state.property["city"] + "," + this.state.property["state"];
        propertyGoogleMapsURL = propertyGoogleMapsURL.replace(" ", "+");

        let googleMapsURL = 'https://maps.googleapis.com/maps/api/staticmap?center=' + propertyGoogleMapsURL + '&zoom=15&size=1000x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyCbudHvO__fMV1eolNO_g5qtE2r2UNcjcA';
        this.setState({
            googleMapsURL: googleMapsURL
        })
        /*** Set our GoogleMapsURL ***/

        let userID = this.state.user["id"];
        let propertyID = this.state.property["id"];

        let getExpensesByPropertyListURL = URLBuilder('/api/user/expenses', userID, propertyID);
        let getFilesByPropertyURL = URLBuilder('/api/user/files/property', userID, propertyID);

        const getExpensesByPropertyRequest = axios.get(getExpensesByPropertyListURL);
        const getFilesByPropertyRequest = axios.get(getFilesByPropertyURL);

        axios.all(
            [getExpensesByPropertyRequest, getFilesByPropertyRequest]
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

            this.setState({
                expenses: expenses,
                expensesMap: expensesMap,
                files: files,
                filesMap: filesMap,
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
                        <div className="analysis_property_value_bar_chart">
                            <p className="analysis_chart_title">
                                Property Value
                            </p>
                            <BarChart 
                                // backgroundColor={"#f5f5fa"}
                                height={"300"}
                                width={"650"}
                                xAxisColor={"grey"}
                                barColor={"#296CF6"}
                                capitalizeXAxis={true}
                                displayTooltip={true}
                                data={[
                                {x: "JAN", y: 61}, 
                                {x: "FEB", y: 25}, 
                                {x: "MAR", y: 16}, 
                                {x: "APR", y: 28}, 
                                {x: "MAY", y: 11}, 
                                {x: "JUN", y: 9}, 
                                {x: "JUL", y: 10}, 
                                {x: "AUG", y: 13}, 
                                {x: "SEP", y: 17}, 
                                {x: "OCT", y: 20}, 
                                {x: "NOV", y: 18}, 
                                {x: "DEC", y: 28}
                            ]}/>
                        </div>
                        <div className="analysis_circular_box">
                            <p className="analysis_chart_title">
                                Property Value
                            </p>
                            <CircularProgressbar 
                                value={10}
                                text={`${this.state.totalProperties ? (this.state.totalProperties - this.state.vacantProperties) / this.state.totalProperties * 100 : 0}%`}
                                background
                                backgroundPadding={3}
                                strokeWidth={7}
                                styles={buildStyles({
                                    backgroundColor: "#fff",
                                    textColor: "#fff",
                                    pathColor: "#296CF6",
                                    trailColor: "#f5f5fa",
                                })}/>
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
                            <div className="clearfix"/>
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
                                    <div className="page_button">
                                        New Property
                                    </div>
                                </Link>
                            </div>
                            <div className="clearfix"/>
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