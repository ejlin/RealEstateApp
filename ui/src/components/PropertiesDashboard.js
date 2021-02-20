import React from 'react';
import axios from 'axios';

import './CSS/PropertiesDashboard.css';
import './CSS/Style.css';

import PropertyCard from './PropertyCard.js';
import FileCard from './FileCard.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { getDaysUntil } from './MainDashboard.js';

import { mapFileTypeToIcon, openSignedURL } from '../utility/Util.js';

import { Link, Redirect } from 'react-router-dom';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryLabel } from 'victory';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { FaMoneyCheck } from 'react-icons/fa';
import { MdDashboard, MdEdit, MdError  } from 'react-icons/md';
import { 
    IoOpenOutline, 
    IoCloseOutline, 
    IoCalendarSharp, 
    IoBedSharp , 
    IoWaterSharp, 
    IoTrailSignSharp, 
    IoBookmarkSharp,
    IoFolderSharp,
    IoWalletSharp,
    IoReaderSharp,
    IoPersonSharp,
    IoTrashSharp} from 'react-icons/io5';

const overview = "overview";
const files = "files";
const expenses = "expenses";

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
        this.numberWithCommas = this.numberWithCommas.bind(this);
        this.removePropertyFromState = this.removePropertyFromState.bind(this);
        this.handleTagsListClick = this.handleTagsListClick.bind(this);
        this.renderProperties = this.renderProperties.bind(this);
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
                totalNetWorth: this.numberWithCommas(totalNetWorth),
                totalRent: this.numberWithCommas(totalRent),
                totalProperties: properties.length,
                totalEstimateWorth: totalEstimateWorth,
                totalPurchasePrice: totalPurchasePrice,
                totalSquareFeet: totalSquareFeet,
                missingEstimate: missingEstimate,
                isLoading: false
            });
        }).catch(error => console.log(error));

    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    removePropertyFromState(id, propertyType) {

        let elementsMap;

        // let tags = ['SFH', 'Manufactured', 'Condo/Ops', 'Multi-Family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial'];

        switch (propertyType) {
            case 'SFH':
                elementsMap = this.state.sfhProperties;
                break; 
            case 'Manufactured':
                elementsMap = this.state.manufacturedProperties;
                break;
            case 'Condo/Ops':
                elementsMap = this.state.condoOpsProperties;
                break;
            case 'Multi-family':
                elementsMap = this.state.multiFamilyProperties;
                break;
            case 'Apartment':
                elementsMap = this.state.apartmentProperties;
                break;
            case 'Lot/Land':
                elementsMap = this.state.lotLandProperties;
                break;
            case 'Townhome':
                elementsMap = this.state.townhomeProperties;
                break;
            case 'Commercial':
                elementsMap = this.state.commercialProperties;
                break;
            default:
                elementsMap = null;
        }
        if (elementsMap !== null ) {
            for (let i = 0; i < elementsMap.length; i++) {
                if (id === elementsMap[i].props.children.props.data.state.property_details["id"]){
                    delete elementsMap[i];
                    break;
                }
            }
        }
        switch (propertyType) {
            case 'SFH':
                this.setState({
                    sfhProperties: [...elementsMap]
                });
                return; 
            case 'Manufactured':
                this.setState({
                    manufacturedProperties: [...elementsMap]
                });
                return;
            case 'Condo/Ops':
                this.setState({
                    condoOpsProperties: [...elementsMap]
                });
                return;
            case 'Multi-family':
                this.setState({
                    multiFamilyProperties: [...elementsMap]
                });
                return;
            case 'Apartment':
                this.setState({
                    apartmentProperties: [...elementsMap]
                });
                return;
            case 'Lot/Land':
                this.setState({
                    lotLandProperties: [...elementsMap]
                });
                return;
            case 'Townhome':
                this.setState({
                    townhomeProperties: [...elementsMap]
                });
                return;
            case 'Commercial':
                this.setState({
                    commercialProperties: [...elementsMap]
                });
                return;
            default:
                return;
        }
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
                        removePropertyFromState = {
                            this.removePropertyFromState
                        }
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
                // elements.push(
                //     <PropertyCard key={property["name"]}
                //         removePropertyFromState = {
                //             this.removePropertyFromState
                //         }
                //         setActiveProperty = {
                //             this.setActiveProperty
                //         }
                //         data={{
                //         state: {
                //             user: this.state.user,
                //             isFirstChild: isFirstChild,
                //             property_details: property
                //         }                       
                //     }}/>
                // );
            }
        });
        return elements;
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
                    {this.state.isLoading ? <div></div> : 
                    <div>
                        <div className="properties_dashboard_property_type_box">
                            <div className="properties_dashboard_inner_box">
                                <div id="properties_dashboard_title_box">
                                    <p className="properties_dashboard_title_box_title">
                                        Properties
                                    </p>
                                    <input className="search_bar" placeholder="Search...">
                                    </input>
                                </div>
                                <div className="clearfix"/>
                                <div className="properties_dashboard_buttons_box">
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
                                    {this.state.activeProperty ? 
                                    <div>
                                        <IoTrashSharp className="properties_dashboard_buttons_box_icon"></IoTrashSharp>
                                        <MdEdit className="properties_dashboard_buttons_box_icon"></MdEdit>
                                    </div> : 
                                    <div></div>}
                                </div> 
                                <div className="clearfix"/>
                                <p style={{
                                    float: "left",
                                    fontSize: "1.3em",
                                }}>
                                    {this.state.totalProperties}
                                </p>
                                <p style={{
                                    float: "left",
                                    fontSize: "1.3em",
                                    marginLeft: "5px",
                                }}>
                                    Properties
                                </p>
                                <div className="properties_dashboard_property_inner_box">
                                    {this.renderProperties()}
                                </div>
                            </div>
                        </div>
                        <NotificationSidebar data={{
                            state: {
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