import React from 'react';
import axios from 'axios';

import './CSS/PropertyCard.css';

import { IoMdTrash } from 'react-icons/io';
import { MdEdit } from 'react-icons/md';
import { SiGoogleanalytics } from 'react-icons/si';
import { GoFileDirectory } from 'react-icons/go';

class PropertyCard extends React.Component {
    constructor(props) {
        super(props);

        var propDetails = this.props.data.state.property_details;

        this.state = {
            userID: this.props.data.state.userID,
            propertyID: propDetails["id"],
            address: propDetails["address"],
            city: propDetails["city"],
            state: propDetails["state"],
            zipCode: propDetails["zip_code"],
            priceBought: propDetails["price_bought"],
            boughtDate: propDetails["bought_date"],
            propertyType: propDetails["property_type"]
        };
        this.deletePropertyByUser = this.deletePropertyByUser.bind(this);
        this.removePropertyFromState = this.props.removePropertyFromState;
    }

    componentDidMount() {
    }

    deletePropertyByUser() {
        var axiosDeletePropertyByUserURL = '/api/user/property/' + this.state.userID;
        axios({
            method: 'delete',
            url: axiosDeletePropertyByUserURL,
            params: {
                property_id: this.state.propertyID
            }
        }).then(response => {
            console.log(response);
            this.removePropertyFromParentState(this.state.propertyID);
        }).catch(error => console.log(error));

        this.removePropertyFromState(this.state.propertyID, this.state.propertyType);

    }

    render() {
        return (
            <div className="propertyCard">
                {/* <img src="https://maps.googleapis.com/maps/api/staticmap?center=1396+Adagietto+Dr.,Henderson,NV&zoom=15&size=300x200&key=AIzaSyCbudHvO__fMV1eolNO_g5qtE2r2UNcjcA"> */}

                {/* </img> */}
                <p className="property_card_address">
                    {this.state.address} 
                </p>
                <IoMdTrash  onClick={this.deletePropertyByUser} className="property_card_delete_button property_card_end_button"/>
                <MdEdit className="property_card_edit_button property_card_end_button"></MdEdit>
                <GoFileDirectory className="property_card_file_button property_card_end_button"></GoFileDirectory>
                <SiGoogleanalytics className="property_card_analytics_button property_card_end_button"></SiGoogleanalytics>
                <div className="clearfix"/>
                <div id="property_card_sub_address">
                    {this.state.city}, {this.state.state} 
                    <br></br>{this.state.zipCode}
                </div>
                <div className="clearfix"/>
                <br></br>
            </div>
        )
    }
}

export default PropertyCard;