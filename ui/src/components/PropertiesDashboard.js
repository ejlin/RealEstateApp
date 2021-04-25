import React from 'react';
import axios from 'axios';

import './CSS/PropertiesDashboard.css';
import './CSS/Style.css';

import PropertyCard from './PropertyCard.js';
import FileCard from './FileCard.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { getDaysUntil } from './MainDashboard.js';

import { mapFileTypeToIcon, openSignedURL, numberWithCommas, capitalizeName, getDate } from '../utility/Util.js';

import { Link, Redirect } from 'react-router-dom';
import { MdError, MdAdd  } from 'react-icons/md';
import { IoSearchOutline } from 'react-icons/io5';

const overview = "overview";
let URLBuilder = require('url-join');

class PropertiesDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        let user;
        let redirect;

        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            user = JSON.parse(loggedInUser);
            redirect = null;
        } else {
            user = null;
            redirect = "/";
        }

        this.state = {
            user: user,
            profilePicture: this.props.location.state.profilePicture,
            tags: ['SFH', 'Manufactured', 'Condo/Op', 'Multi-Family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial'],
            propertiesMap: new Map(),
            activePropertyID: "",
            activeProperty: null,
            activePropertyView: overview,
            activeFiles: [],
            isLoading: true,
            redirect: redirect,
        };
        this.setActiveFileAttributes = this.setActiveFileAttributes.bind(this);
        this.handleTagsListClick = this.handleTagsListClick.bind(this);
        this.renderProperties = this.renderProperties.bind(this);
        this.renderNoProperties = this.renderNoProperties.bind(this);
        this.setActiveProperty = this.setActiveProperty.bind(this);
        // this.renderActivePropertyView = this.renderActivePropertyView.bind(this);
        // this.renderActivePropertyFiles = this.renderActivePropertyFiles.bind(this);
        // this.renderActivePropertyExpenses = this.renderActivePropertyExpenses.bind(this);
        this.getARR = this.getARR.bind(this);
        this.getLTVRatio = this.getLTVRatio.bind(this);
        this.getDTIRatio = this.getDTIRatio.bind(this);
    }

    componentDidMount() {
        let url = '/api/user/property/' + this.state.user["id"];
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            let properties = response.data.sort();
            let totalNetWorth = 0;
            let totalRent = 0;

            let totalEstimateWorth = 0;
            let totalPurchasePrice = 0;
            let totalSquareFeet = 0;
            let missingEstimate = false;

            let propMap = this.state.propertiesMap;
            // initialize our map with empty arrays for every tag.
            for (let j = 0; j < this.state.tags.length; j++) {
                propMap[this.state.tags[j]] = [];
            }
            for (let i = 0; i < properties.length; i++) {
                let property = properties[i];
                totalNetWorth += property["price_bought"];
                totalRent += property["price_rented"];
                propMap[property["property_type"]].push(property);

                if (property["estimate"] && property["estimate"] !== 0.00) { 
                    totalEstimateWorth += property["estimate"];
                } else {
                    totalEstimateWorth += property["price_bought"];
                    missingEstimate = true;
                }

                totalPurchasePrice += property["price_bought"] ? property["price_bought"] : 0.0;
                totalSquareFeet += property["square_footage"] ? property["square_footage"] : 0.0;
            }

            let propertiesMap = new Map();
            for (let i = 0; i < properties.length; i++) {
                let property = properties[i];
                let propertyType = property["property_type"];

                if (!propertiesMap.has(propertyType)) {
                    propertiesMap.set(propertyType, []);
                }
                let propertiesTypeArr = propertiesMap.get(propertyType);
                propertiesTypeArr.push(property);
                propertiesMap.set(propertyType, propertiesTypeArr);
            }

            this.setState({
                propertiesMap: [...propertiesMap],
                totalNetWorth: numberWithCommas(totalNetWorth),
                totalRent: numberWithCommas(totalRent),
                totalProperties: properties.length,
                totalEstimateWorth: totalEstimateWorth,
                totalPurchasePrice: totalPurchasePrice,
                totalSquareFeet: totalSquareFeet,
                missingEstimate: missingEstimate,
                isLoading: false
            });

            localStorage.setItem('total_estimate_worth', JSON.stringify(this.state.totalEstimateWorth));
            
        }).catch(error => console.log(error));

    }

    handleTagsListClick(e){
        // Not toggled, set toggle.
        let toggledMap = this.state.tagsToToggledMap;
        if (!toggledMap[e.target.value]){
            e.target.style.color = "white";
            e.target.style.backgroundColor = "#296CF6";
            toggledMap[e.target.value] = true;
        } else {
            e.target.style.color = "#296CF6";
            e.target.style.backgroundColor = "#eaf5fb";
            toggledMap[e.target.value] = false;
        }
        this.setState({
            tagsToToggledMap: toggledMap
        })
        return;
    }

    setActiveFileAttributes(fileKey, file, toRemove) {
        let currentActiveFiles = this.state.activeFiles;
        if (currentActiveFiles === null || currentActiveFiles === undefined || currentActiveFiles.length === 0) {
            currentActiveFiles = new Map();
        }
        if (currentActiveFiles.size >= 25 && !toRemove) {
            return false
        }
        if (!toRemove) {
            currentActiveFiles.set(fileKey, file);
        } else {
            // Remove from active ("unclicked")
            currentActiveFiles.delete(fileKey);
        }
        this.setState({
            activeFiles: currentActiveFiles
        })
        return true;
    }

    setActiveProperty(propertyID) {
        axios({
            method: 'get',
            url: 'api/property/' + propertyID,
        }).then(response => {
            this.setState({
                redirectToPropertyPage: URLBuilder("properties", propertyID),
                activePropertyID: propertyID,
                activeProperty: response.data
            })
        }).catch(error => {
            console.log(error);
        });
    }

    getARR() {

    }

    getLTVRatio() {
        let activeProperty = this.state.activeProperty;
        if (!activeProperty["price_bought"]  || !activeProperty["down_payment"] || !activeProperty["price_bought"]) {
            return 0.0;
        }
        let apv = activeProperty["estimate"] ? activeProperty["estimate"] : activeProperty["price_bought"];

        let loan = activeProperty["price_bought"] - activeProperty["down_payment"];
        return Number((loan / apv * 100.0).toFixed(2));
    }

    getDTIRatio() {
        let activeProperty = this.state.activeProperty;
        if (!activeProperty["price_mortgage"]  || 
            !activeProperty["price_property_manager"] || 
            !activeProperty["currently_rented"] || 
            !activeProperty["price_rented"]) {
            return 0.0;
        }
        
        let debt = activeProperty["price_mortgage"];
        debt += activeProperty["price_property_manager"] ? activeProperty["price_property_manager"] : 0.0;

        let income = activeProperty["price_rented"];

        let dti = debt / income * 100.0
        return Number(dti.toFixed(2));
    }

    renderActivePropertyFiles() {
        let elements = [];
        let files = this.state.activePropertyFiles;
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            elements.push(
                <FileCard key={this.state.activePropertyID + "-" + file["name"]} data={{
                    state: {
                        user: this.state.user,
                        file: file,
                        backgroundColor: "grey",
                        setActiveFileAttributes: this.setActiveFileAttributes,
                        openSignedURL: openSignedURL, 
                        mapFileTypeToIcon: mapFileTypeToIcon
                    }                       
                }}/>
            );
        }
        return elements;
    }

    renderActivePropertyExpenses() {
        let elements = [];
        let expenses = this.state.activePropertyExpenses;
        if (expenses.length === 0) {
            return (
                <div className="active_property_expenses_box">
                    <div className="expenses_dashboard_body_inner_box_no_expenses_inner_box">
                        <MdError className="expenses_dashboard_body_inner_box_no_expenses_inner_box_icon"></MdError>
                        <p className="expenses_dashboard_body_inner_box_no_expenses_inner_box_text">
                            No Expenses to show
                        </p>
                    </div>
                </div>
            );
        } else {
            // TODO: render expenses card.
        }
    }

    renderProperties() {
        let elements = [];
        let propertiesMap = this.state.propertiesMap;
        propertiesMap.forEach((value, key, map) => {
            let propertyArr = value[1];
            for (let i = 0; i < propertyArr.length; i++) {
                let property = propertyArr[i];
                elements.push(
                    <PropertyCard key={property["name"]}
                        setActiveProperty = {
                            this.setActiveProperty
                        }
                        data={{
                        state: {
                            user: this.state.user,
                            property_details: property
                        }                       
                    }}/>
                );
            }
        });
        return (
            <div style={{
                height: "calc(100vh - 50px - 50px - 50px)", /* 50px margin top header, 50px search bar header, 50px margin top and bottom */
                marginTop: "15px",
                overflow: "scroll",
            }}>
                <div style={{
                    marginLeft: "5px",
                    width: "calc(100% - 10px)",
                }}>
                    {elements}
                </div>
            </div>
        );
    }

    renderNoProperties() {
        return (
            <div style={{
                marginTop: "150px",
                textAlign: "center",
                width: "100%",
            }}>
                <p style={{
                    textAlign: "center",
                }}>
                    No properties
                </p>
                <Link to={{
                    pathname: "/addproperty",
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        profilePicture: this.state.profilePicture
                    }
                }}>
                    <div 
                        className="opacity"
                        style={{
                            backgroundColor: "#296cf6",
                            borderRadius: "50px",
                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.10), 0 6px 10px 0 rgba(0, 0, 0, 0.09)",
                            cursor: "pointer",
                            display: "inline-block",
                            marginTop: "15px",
                            padding: "7.5px 15px 7.5px 15px",
                        }}>
                        <p style={{
                            color: "white",
                        }}>
                            Add a Property to Start
                        </p>
                    </div>
                </Link>
            </div>
        );
    }
    
    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect
            }} />
        }
        if (this.state.redirectToPropertyPage) {
            return <Redirect to={{
                pathname: this.state.redirectToPropertyPage,
                state: {
                    user: this.state.user,
                    property: this.state.activeProperty,
                    profilePicture: this.state.profilePicture,
                    totalEstimateWorth: this.state.totalEstimateWorth,
                    totalPurchasePrice: this.state.totalPurchasePrice,
                    totalSquareFeet: this.state.totalSquareFeet,
                }
            }} />
        }
        return (
            <div>
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
                    {this.state.isLoading ? 
                    <div style={{
                        backgroundColor: "#f5f5fa",
                        float: "left",
                        height: "100vh",
                        width: "100%",
                    }}></div> : 
                    <div>
                        <div style={{
                            backgroundColor: "#F5F5FA",
                            float: "left",
                            marginLeft: "250px",
                            width: "calc(100% - 250px - 375px)",
                        }}>
                            <div className="page-white-background">
                                <div style={{
                                    float: "left",
                                    paddingBottom: "10px",
                                    paddingTop: "10px",
                                    width: "100%",
                                }}>
                                    <input className="search_bar" placeholder="Search...">
                                    </input>
                                    <p style={{
                                        float: "left",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "1.1em",
                                        lineHeight: "40px",
                                        width: "200px",
                                    }}>
                                        PROPERTIES
                                    </p>
                                    <Link 
                                        className="opacity"
                                        style={{
                                            float: "right",
                                            marginRight: "25px",
                                        }}
                                        to={{
                                            pathname: "/addproperty",
                                            state: {
                                                user: this.state.user,
                                                totalEstimateWorth: this.state.totalEstimateWorth,
                                                missingEstimate: this.state.missingEstimate,
                                                profilePicture: this.state.profilePicture
                                            }
                                        }}>
                                        <MdAdd style={{
                                            color: "#296cf6",
                                            float: "left",
                                            height: "20px",
                                            marginTop: "10px",
                                            width: "20px",
                                        }}/>
                                        <p style={{
                                            color: "#296cf6",
                                            float: "left",
                                            fontFamily: "'Poppins', sans-serif",
                                            fontWeight: "bold",
                                            lineHeight: "40px",
                                            marginLeft: "10px",
                                            textDecoration: "none",
                                            userSelect: "none",
                                        }}>
                                            New
                                        </p>
                                    </Link>
                                </div>
                                
                                {/* {/* <p style={{
                                    float: "left",
                                    fontSize: "1.3em",
                                }}>
                                    {this.state.totalProperties} {this.state.totalProperties === 1 ? "Property" : "Properties"}
                                </p> */}
                                <div className="clearfix"/>
                                <div className="page-title-bar-divider"></div>
                                <div className="clearfix"/>
                                <div style={{
                                    float: "left",
                                    marginBottom: "15px",
                                    marginLeft: "30px",
                                    marginRight: "30px",
                                    width: "calc(100% - 60px)",
                                }}>
                                    {/* <div style={{
                                        marginTop: "15px",
                                        // height: "60px",
                                        width: "calc(100% - 120px)",
                                    }}>
                                        <p id="main_dashboard_welcome_box_date">
                                            {getDate()}
                                        </p>
                                        <p style={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "1.4em",
                                            // fontWeight: "bold",
                                        }}>
                                            Welcome, {capitalizeName(this.state.user["first_name"])}
                                        </p>
                                    </div> */}
                                    {
                                        this.state.totalProperties === 0 ? 
                                        this.renderNoProperties() :
                                        this.renderProperties()
                                    }
                                </div>
                            </div>
                        </div>
                        <NotificationSidebar data={{
                            state: {
                                user: this.state.user,
                                totalEstimateWorth: this.state.totalEstimateWorth,
                                missingEstimate: this.state.missingEstimate 
                            }
                        }}/>
                    </div>}
                </div>
            </div>
        )
    }
}

export default PropertiesDashboard;