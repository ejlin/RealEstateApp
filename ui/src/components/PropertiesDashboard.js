import React from 'react';
import axios from 'axios';

import './CSS/PropertiesDashboard.css';
import './CSS/Style.css';

import PropertyCard from './PropertyCard.js';
import DashboardSidebar from './DashboardSidebar.js';

import { PieChart } from 'react-minimal-pie-chart';

import { FaHome } from 'react-icons/fa';
import { RiBuilding4Fill, RiBuilding2Fill } from 'react-icons/ri';

class PropertiesDashboard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            userID: this.props.location.state.id,
            firstName: this.props.location.state.first_name,
            lastName: this.props.location.state.last_name,
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
            propertiesMap: []
        };

        this.numberWithCommas = this.numberWithCommas.bind(this);
        this.removePropertyFromState = this.removePropertyFromState.bind(this);
        this.handleTagsListClick = this.handleTagsListClick.bind(this);
    }

    componentDidMount() {
        var url = '/api/user/property/' + this.state.userID;
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            var properties = response.data;
            var totalEstimateWorth = 0;
            var totalNetWorth = 0;
            var totalRent = 0;

            var propMap = this.state.propertiesMap;
            // initialize our map with empty arrays for every tag.
            for (var j = 0; j < this.state.tags.length; j++) {
                propMap[this.state.tags[j]] = [];
            }
            for (var i = 0; i < properties.length; i++) {
                totalEstimateWorth += properties[i]["price_estimate"];
                totalNetWorth += properties[i]["price_bought"];
                totalRent += properties[i]["price_rented"];
                propMap[properties[i]["property_type"]].push(properties[i]);
            }

            this.setState({
                sfhProperties: propMap['SFH'].map((property, i) =>
                    <div key={i}>
                        <PropertyCard removePropertyFromState = {
                                this.removePropertyFromState
                            }
                            data={{
                            state: {
                                userID: this.state.userID,
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
                            userID: this.state.userID,
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
                            userID: this.state.userID,
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
                            userID: this.state.userID,
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
                            userID: this.state.userID,
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
                            userID: this.state.userID,
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
                            userID: this.state.userID,
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
                            userID: this.state.userID,
                            property_details: property,
                        }                       
                    }}/>
                </div>
                ),
                totalEstimateWorth: this.numberWithCommas(totalEstimateWorth),
                totalNetWorth: this.numberWithCommas(totalNetWorth),
                totalRent: this.numberWithCommas(totalRent),
                propertiesMap: propMap,
                totalProperties: properties.length
            });
        }).catch(error => console.log(error));

    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    removePropertyFromState(id, propertyType) {

        var elementsMap;

        var tags = ['SFH', 'Manufactured', 'Condo/Ops', 'Multi-Family', 'Apartment', 'Lot/Land', 'Townhome', 'Commercial'];

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
                if (id == elementsMap[i].props.children.props.data.state.property_details["id"]){
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
            e.target.style.backgroundColor = "#6532cd";
            toggledMap[e.target.value] = true;
        } else {
            e.target.style.color = "#6532cd";
            e.target.style.backgroundColor = "#eee6f9";
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
                <DashboardSidebar data={{
                    state: {
                        id: this.state.userID,
                        first_name: this.state.firstName,
                        last_name: this.state.lastName
                    }
                }}/>
                <div className="properties_dashboard_property_type_box">
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
                        <div className="clearfix"/>
                        <div className="properties_dashboard_property_title_parent">
                            <FaHome className="properties_dashboard_property_type_icon"/>
                            <p className="properties_dashboard_property_type_title">
                                Single Family Homes
                            </p>
                        </div>
                        
                        <div className="clearfix"/>
                        {this.state.sfhProperties}
                        <div className="clearfix"/>
                        <div className="properties_dashboard_property_title_parent">
                            <RiBuilding4Fill className="properties_dashboard_property_type_icon"/>
                            <p className="properties_dashboard_property_type_title">
                                Manufactured
                            </p>
                        </div>
                        {this.state.manufacturedProperties}
                        <div className="clearfix"/>
                        <div className="properties_dashboard_property_title_parent">
                            <RiBuilding4Fill className="properties_dashboard_property_type_icon"/>
                            <p className="properties_dashboard_property_type_title">
                                Condos/Ops
                            </p>
                        </div>
                        {this.state.condoOpsProperties}
                        <div className="clearfix"/>
                        <div className="properties_dashboard_property_title_parent">
                            <RiBuilding2Fill className="properties_dashboard_property_type_icon"/>
                            <p className="properties_dashboard_property_type_title">
                                Multi-Family
                            </p>
                        </div>
                        {this.state.multiFamilyProperties}
                        <div className="clearfix"/>
                        <div className="properties_dashboard_property_title_parent">
                            <RiBuilding4Fill className="properties_dashboard_property_type_icon"/>
                            <p className="properties_dashboard_property_type_title">
                                Apartments
                            </p>
                        </div>
                        {this.state.apartmentProperties}
                        <div className="clearfix"/>
                        <div className="properties_dashboard_property_title_parent">
                            <RiBuilding4Fill className="properties_dashboard_property_type_icon"/>
                            <p className="properties_dashboard_property_type_title">
                                Lots/Land
                            </p>
                        </div>
                        {this.state.lotLandProperties}
                        <div className="clearfix"/>
                        <div className="properties_dashboard_property_title_parent">
                            <RiBuilding4Fill className="properties_dashboard_property_type_icon"/>
                            <p className="properties_dashboard_property_type_title">
                                Townhomes
                            </p>
                        </div>
                        {this.state.townhomeProperties}
                        <div className="clearfix"/>
                        <div className="properties_dashboard_property_title_parent">
                            <RiBuilding4Fill className="properties_dashboard_property_type_icon"/>
                            <p className="properties_dashboard_property_type_title">
                                Commercial
                            </p>
                        </div>
                        {this.state.commercialProperties}
                    </div>
                    <div id="properties_dashboard_right_box">
                        {/* <div id="properties_dashboard_right_box_summary_box">
                            <p id="properties_dashboard_right_box_summary_title">
                                {this.state.totalProperties}
                            </p>
                            <p id="properties_dashboard_right_box_summary_subtitle">
                                total properties
                            </p>
                            <PieChart id="piechart"
                                data={[
                                    { title: 'One', value: 10, color: '#e9dcf8' },
                                    { title: 'Two', value: 15, color: '#d2b9f0' },
                                    { title: 'Three', value: 20, color: '#ba98e8' },
                                ]}
                                lineWidth={25}
                                background={'#6532cd'}
                                radius={15}
                                />
                        </div> */}
                    </div>
                </div>
            </div>
        )
    }
}

export default PropertiesDashboard;