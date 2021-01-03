import React from 'react';
import axios from 'axios';

import './CSS/PropertiesDashboard.css';
import './CSS/Style.css';

import PropertyCard from './PropertyCard.js';
import FileCard from './FileCard.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { mapFileTypeToIcon, openSignedURL } from './FilesDashboard.js';

import { Link, Redirect } from 'react-router-dom';

import { GoFileDirectory } from 'react-icons/go';
import { SiGoogleanalytics } from 'react-icons/si';
import { FaMoneyCheck } from 'react-icons/fa';
import { MdDashboard, MdEdit  } from 'react-icons/md';
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
const analysis = "analysis";
const files = "files";
const expenses = "expenses";

class PropertiesDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            profilePicture: this.props.location.state.profilePicture,
            tags: ['SFH', 'Manufactured', 'Condo/Op', 'Multi-Family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial'],
            propertiesMap: new Map(),
            activePropertyID: "",
            activeProperty: null,
            activePropertyView: overview,
            activeFiles: [],
            isLoading: true
        };
        this.setActiveFileAttributes = this.setActiveFileAttributes.bind(this);
        this.numberWithCommas = this.numberWithCommas.bind(this);
        this.removePropertyFromState = this.removePropertyFromState.bind(this);
        this.handleTagsListClick = this.handleTagsListClick.bind(this);
        this.renderProperties = this.renderProperties.bind(this);
        this.setActiveProperty = this.setActiveProperty.bind(this);
        this.renderActivePropertyView = this.renderActivePropertyView.bind(this);
        this.renderActivePropertyFiles = this.renderActivePropertyFiles.bind(this);
    }

    componentDidMount() {
        var url = '/api/user/property/' + this.state.user["id"];
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            var properties = response.data.sort();
            var totalNetWorth = 0;
            var totalRent = 0;

            var totalEstimateWorth = 0;
            var missingEstimate = false;

            var propMap = this.state.propertiesMap;
            // initialize our map with empty arrays for every tag.
            for (var j = 0; j < this.state.tags.length; j++) {
                propMap[this.state.tags[j]] = [];
            }
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                totalNetWorth += property["price_bought"];
                totalRent += property["price_rented"];
                propMap[property["property_type"]].push(property);

                if (property["estimate"] && property["estimate"] !== 0.00) { 
                    totalEstimateWorth += property["estimate"];
                } else {
                    totalEstimateWorth += property["price_bought"];
                    missingEstimate = true;
                }
            }

            var propertiesMap = new Map();
            for (var i = 0; i < properties.length; i++) {
                let property = properties[i];
                let propertyType = property["property_type"];

                if (!propertiesMap.has(propertyType)) {
                    propertiesMap.set(propertyType, []);
                }
                var propertiesTypeArr = propertiesMap.get(propertyType);
                propertiesTypeArr.push(property);
                propertiesMap.set(propertyType, propertiesTypeArr);
            }

            this.setState({
                propertiesMap: [...propertiesMap],
                totalNetWorth: this.numberWithCommas(totalNetWorth),
                totalRent: this.numberWithCommas(totalRent),
                totalProperties: properties.length,
                totalEstimateWorth: this.numberWithCommas(totalEstimateWorth),
                missingEstimate: missingEstimate,
                isLoading: false
            });
        }).catch(error => console.log(error));

    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    removePropertyFromState(id, propertyType) {

        var elementsMap;

        // var tags = ['SFH', 'Manufactured', 'Condo/Ops', 'Multi-Family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial'];

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
            for (var i = 0; i < elementsMap.length; i++) {
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
        var toggledMap = this.state.tagsToToggledMap;
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
        var currentActiveFiles = this.state.activeFiles;
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
                activePropertyID: propertyID,
                activeProperty: response.data,
                activePropertyView: overview,
                isLoadingActiveProperty: false
            })
        }).catch(error => {
            console.log(error);
        });
    }

    renderActivePropertyFiles() {
        var elements = [];
        var files = this.state.activePropertyFiles;
        for (var i = 0; i < files.length; i++) {
            let file = files[i];
            elements.push(
                <FileCard key={this.state.activePropertyID + "-" + file["name"]} data={{
                    state: {
                        user: this.state.user,
                        file: file,
                        setActiveFileAttributes: this.setActiveFileAttributes,
                        openSignedURL: openSignedURL, 
                        mapFileTypeToIcon: mapFileTypeToIcon
                    }                       
                }}/>
            );
        }
        return elements;
    }

    renderActivePropertyView() {
        switch(this.state.activePropertyView) {
            case overview:
                return (
                    <div>
                        <p className="active_property_view_title">
                            Overview
                        </p>
                    </div>
                );
            case analysis:
                return (
                    <div>
                        <p className="active_property_view_title">
                            Analysis
                        </p>
                    </div>
                );
            case files:
                return (
                    <div>
                        <p className="active_property_view_title">
                            Files
                        </p>
                        {this.renderActivePropertyFiles()}
                    </div>
                );
            case expenses:
                return (
                    <div>
                        <p className="active_property_view_title">
                            Expenses
                        </p>
                    </div>
                );
        }
    }

    renderProperties() {
        var elements = [];
        var propertiesMap = this.state.propertiesMap;
        var isFirstChild = true;
        propertiesMap.forEach((value, key, map) => {
            let propertyArr = value[1];
            for (var i = 0; i < propertyArr.length; i++) {
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
                            isFirstChild: isFirstChild,
                            property_details: property
                        }                       
                    }}/>
                );
                isFirstChild = false;
            }
        });
        return elements;
    }
    
    renderActiveProperty() {
        if (this.state.activePropertyID !== "" && this.state.activeProperty) {
            return (
                <div key={this.state.activePropertyID} className="properties_dashboard_active_property_box">
                    <div className="properties_dashboard_active_property_box_left_box">
                        <p className="properties_dashboard_active_property_box_left_box_title">
                            ${this.numberWithCommas(this.state.activeProperty["estimate"])}
                        </p>
                        <p className="properties_dashboard_active_property_box_left_box_subtitle">
                            {this.state.activeProperty["address"]}
                        </p>
                        <p className="properties_dashboard_active_property_box_left_box_subtitle">
                            {this.state.activeProperty["state"]}, {this.state.activeProperty["zip_code"]}
                        </p>
                        <div className="property_card_box_info_box">
                            <div className="property_card_box_info_box_first_row">
                                <div className="property_card_box_info_box_first_row_first_element">
                                    <IoBedSharp className="property_card_box_info_box_icon"></IoBedSharp>
                                    <p className="property_card_box_info_box_text">
                                        {this.state.activeProperty["num_beds"]} {this.state.activeProperty["num_beds"] > 1 ? "beds" : "bed"}
                                    </p>
                                </div>
                                <div className="property_card_box_info_box_first_row_second_element">
                                    <IoWaterSharp className="property_card_box_info_box_icon"></IoWaterSharp>
                                    <p className="property_card_box_info_box_text">
                                        {this.state.activeProperty["num_baths"]} {this.state.activeProperty["num_baths"] > 1 ? "baths" : "bath"}
                                    </p>
                                </div>
                            </div>
                            <div className="property_card_box_info_box_second_row">
                                <div className="property_card_box_info_box_first_row_first_element">
                                    <IoTrailSignSharp className="property_card_box_info_box_icon"></IoTrailSignSharp>
                                    <p className="property_card_box_info_box_text">
                                        {this.state.activeProperty["num_units"]} {this.state.activeProperty["num_units"] > 1 ? "units" : "unit"}
                                    </p>
                                </div>
                                <div className="property_card_box_info_box_first_row_second_element">
                                    <IoBookmarkSharp className="property_card_box_info_box_icon"></IoBookmarkSharp>
                                    <p className="property_card_box_info_box_text">
                                        {this.numberWithCommas(this.state.activeProperty["square_footage"])} sq ft
                                    </p>
                                </div>
                            </div>
                            <div className="property_card_box_info_box_second_row">
                                <div className="property_card_box_info_box_first_row_first_element">
                                    <IoWalletSharp title="rent per month" alt="rent per month" className="property_card_box_info_box_icon"></IoWalletSharp>
                                    <p className="property_card_box_info_box_text">
                                        ${this.numberWithCommas(this.state.activeProperty["price_rented"])}/mo
                                    </p>
                                </div>
                                <div className="property_card_box_info_box_first_row_second_element">
                                    <IoReaderSharp className="property_card_box_info_box_icon"></IoReaderSharp>
                                    <p className="property_card_box_info_box_text">
                                        ${this.numberWithCommas(this.state.activeProperty["price_mortgage"])}/mo
                                    </p>
                                </div>
                            </div>
                            <div className="property_card_box_info_box_second_row">
                                <div className="property_card_box_info_box_last_row_first_element">
                                    <IoPersonSharp className="property_card_box_info_box_icon"></IoPersonSharp>
                                    <p className="property_card_box_info_box_text">
                                        Property Manager ${
                                        this.state.activeProperty["price_property_manager"] && this.state.activeProperty["price_rented"] ?
                                        this.state.activeProperty["price_property_manager"] * this.state.activeProperty["price_rented"] / 100.00 :
                                        "-"}/mo
                                    </p>
                                </div>
                            </div>
                            <div className="property_card_box_info_box_second_row">
                                <div className="property_card_box_info_box_last_row_first_element">
                                    <IoCalendarSharp className="property_card_box_info_box_icon"></IoCalendarSharp>
                                    <p className="property_card_box_info_box_text">
                                        Purchased {this.state.activeProperty["bought_date"]}
                                    </p>
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <div className="properties_dashboard_active_property_icon_box">
                                <div>
                                    <MdEdit className="properties_dashboard_active_property_icon"></MdEdit>
                                    <IoTrashSharp className="properties_dashboard_active_property_icon"></IoTrashSharp>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="properties_dashboard_active_property_box_divider">
                    </div>
                    <div className="properties_dashboard_active_property_box_right_box">
                        <div className="properties_dashboard_active_property_box_right_box_title_box">
                            <IoCloseOutline 
                                onMouseDown={() => {
                                    this.setState({
                                        activePropertyID: "",
                                        activeProperty: null,
                                    })
                                }}
                                className="properties_dashboard_active_property_box_right_box_title_box_icon"></IoCloseOutline>
                        </div>
                        <div className="properties_dashboard_active_property_box_right_box_inner_box">
                            <div className="properties_dashboard_active_property_box_right_box_inner_box_navbar_box">
                                <MdDashboard 
                                    onMouseDown={() => {
                                        this.setState({
                                            activePropertyView: overview
                                        })
                                    }}
                                    className={
                                        this.state.activePropertyView === overview ? 
                                        "properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon_active" :
                                        "properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon"}
                                    ></MdDashboard>
                                <SiGoogleanalytics 
                                    onMouseDown={() => {
                                        this.setState({
                                            activePropertyView: analysis
                                        })
                                    }}
                                    className={
                                        this.state.activePropertyView === analysis ? 
                                        "properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon_active" :
                                        "properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon"}
                                    ></SiGoogleanalytics>
                                <GoFileDirectory 
                                    onMouseDown={() => {
                                        axios({
                                            url: 'api/user/files/' + this.state.user["id"] + '/' + this.state.activePropertyID,
                                            method: 'get'
                                        }).then(response => {
                                            console.log(response.data);
                                            this.setState({
                                                activePropertyFiles: response.data,
                                                activePropertyView: files
                                            })
                                        }).catch(error => {

                                        })
                                    }}
                                    className={
                                        this.state.activePropertyView === files ? 
                                        "properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon_active" :
                                        "properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon"}
                                    ></GoFileDirectory>
                                <FaMoneyCheck 
                                    onMouseDown={() => {
                                        this.setState({
                                            activePropertyView: expenses
                                        })
                                    }}
                                    className={
                                        this.state.activePropertyView === expenses ? 
                                        "properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon_active" :
                                        "properties_dashboard_active_property_box_right_box_inner_box_navbar_box_icon"}
                                    ></FaMoneyCheck>
                            </div>
                            <div className="properties_dashboard_active_property_box_right_box_inner_box_view_box">
                                {this.renderActivePropertyView()}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div></div>
        )
    }

    render() {
        return (
            <div>
                <div>
                    <DashboardSidebar data={{
                        state: {
                            user: this.state.user,
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
                                    <p id="properties_dashboard_title_box_title">
                                        Properties
                                    </p>
                                    <input className="properties_dashboard_search_bar" placeholder="Search...">
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
                                        <div className="properties_dashboard_add_property_button">
                                            New Property
                                        </div>
                                    </Link>
                                </div> 
                                <div className="clearfix"/>
                                {this.renderActiveProperty()}
                            {/* <div id="properties_dashboard_tags_box">
                                <button value="Single Family Homes" className="properties_dashboard_tags_box_list" onClick={this.handleTagsListClick}>
                                    Single Family Homes
                                </button>
                                <button value="Manufactured" className="properties_dashboard_tags_box_list" onClick={this.handleTagsListClick}>
                                    Manufactured
                                </button>
                                <button value="Condos/Ops" className="properties_dashboard_tags_box_list" onClick={this.handleTagsListClick}>
                                    Condos/Ops
                                </button>
                                <button value="Multi-Family" className="properties_dashboard_tags_box_list" onClick={this.handleTagsListClick}>
                                    Multi-Family
                                </button>
                                <button value="Apartments" className="properties_dashboard_tags_box_list" onClick={this.handleTagsListClick}>
                                    Apartments
                                </button>
                                <button value="Lots/Land" className="properties_dashboard_tags_box_list" onClick={this.handleTagsListClick}>
                                    Lots/Land
                                </button>
                                <button value="Townhomes" className="properties_dashboard_tags_box_list" onClick={this.handleTagsListClick}>
                                    Townhomes
                                </button>
                                <button value="Commercial" className="properties_dashboard_tags_box_list" onClick={this.handleTagsListClick}>
                                    Commercial
                                </button>
                            </div> */}
                                <div id="properties_dashboard_property_inner_box">
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