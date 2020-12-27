import React from 'react';
import axios from 'axios';

import './CSS/PropertiesDashboard.css';
import './CSS/Style.css';

import PropertyCard from './PropertyCard.js';
import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';

import { IoMdAdd } from 'react-icons/io';

class PropertiesDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            sfhProperties: [],
            manufacturedProperties: [],
            condoOpsProperties: [],
            multiFamilyProperties: [],
            apartmentProperties: [],
            lotLandProperties: [],
            townhomeProperties: [],
            commercialProperties: [],
            tags: ['SFH', 'Manufactured', 'Condo/Op', 'Multi-Family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial'],
            tagsToToggledMap: [],
            propertiesMap: [],
            isLoading: true
        };
        this.numberWithCommas = this.numberWithCommas.bind(this);
        this.removePropertyFromState = this.removePropertyFromState.bind(this);
        this.handleTagsListClick = this.handleTagsListClick.bind(this);
    }

    componentDidMount() {
        var url = '/api/user/property/' + this.state.user["id"];
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            var properties = response.data;
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

                if (property["price_estimate"] && property["price_estimate"] !== 0.00) { 
                    totalEstimateWorth += property["price_estimate"];
                } else {
                    totalEstimateWorth += property["price_bought"];
                    missingEstimate = true;
                }
            }

            console.log(propMap['SFH']);
            this.setState({
                sfhProperties: propMap['SFH'].map((property, i) =>
                    <div key={i}>
                        <PropertyCard removePropertyFromState = {
                                this.removePropertyFromState
                            }
                            data={{
                            state: {
                                user: this.state.user,
                                property_details: property,
                            }                       
                        }}/>
                    </div>
                ),
                manufacturedProperties: propMap['Manufactured'].map((property, i) => 
                <div key={i}>
                    <PropertyCard removePropertyFromState = {
                            this.removePropertyFromState
                        }
                        data={{
                        state: {
                            user: this.state.user,
                            property_details: property,
                        }                       
                    }}/>
                </div>
                ),
                condoOpsProperties: propMap["Condo/Op"].map((property, i) => 
                <div key={i}>
                    <PropertyCard removePropertyFromState = {
                            this.removePropertyFromState
                        }
                        data={{
                        state: {
                            user: this.state.user,
                            property_details: property,
                        }                       
                    }}/>
                </div>
                ),
                multiFamilyProperties: propMap['Multi-Family'].map((property, i) => 
                <div key={i}>
                    <PropertyCard removePropertyFromState = {
                            this.removePropertyFromState
                        }
                        data={{
                        state: {
                            user: this.state.user,
                            property_details: property,
                        }                       
                    }}/>
                </div>
                ),
                apartmentProperties: propMap['Apartment'].map((property, i) => 
                <div key={i}>
                    <PropertyCard removePropertyFromState = {
                            this.removePropertyFromState
                        }
                        data={{
                        state: {
                            user: this.state.user,
                            property_details: property,
                        }                       
                    }}/>
                </div>
                ),
                lotLandProperties: propMap['Lot/Land'].map((property, i) => 
                <div key={i}>
                    <PropertyCard removePropertyFromState = {
                            this.removePropertyFromState
                        }
                        data={{
                        state: {
                            user: this.state.user,
                            property_details: property,
                        }                       
                    }}/>
                </div>
                ),
                townhomeProperties: propMap['Townhome'].map((property, i) => 
                <div key={i}>
                    <PropertyCard removePropertyFromState = {
                            this.removePropertyFromState
                        }
                        data={{
                        state: {
                            user: this.state.user,
                            property_details: property,
                        }                       
                    }}/>
                </div>
                ),
                commercialProperties: propMap['Commercial'].map((property, i) => 
                <div key={i}>
                    <PropertyCard removePropertyFromState = {
                            this.removePropertyFromState
                        }
                        data={{
                        state: {
                            user: this.state.user,
                            property_details: property,
                        }                       
                    }}/>
                </div>
                ),
                totalNetWorth: this.numberWithCommas(totalNetWorth),
                totalRent: this.numberWithCommas(totalRent),
                propertiesMap: propMap,
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

    render() {
        return (
            <div>
                <div>
                    <DashboardSidebar data={{
                        state: {
                            user: this.state.user,
                            totalEstimateWorth: this.state.totalEstimateWorth,
                            missingEstimate: this.state.missingEstimate,
                            currentPage: "properties"
                        }
                    }}/>
                    {this.state.isLoading ? <div></div> : 
                    <div>
                        <div className="properties_dashboard_property_type_box">
                            <div id="properties_dashboard_title_box">
                                <p id="properties_dashboard_title_box_title">
                                    Properties
                                </p>
                                <IoMdAdd id="properties_dashboard_upload_file_icon"></IoMdAdd>
                                <input id="properties_dashboard_search_bar" placeholder="Search...">
                                </input>
                            </div>
                            <div className="clearfix"/>
                            <div id="properties_dashboard_tags_box">
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
                            </div>
                            <div className="clearfix"/>
                            <div id="properties_dashboard_property_inner_box">
                                {this.state.sfhProperties}
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