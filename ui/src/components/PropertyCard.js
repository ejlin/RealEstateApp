import React from 'react';
import axios from 'axios';

import './CSS/PropertyCard.css';

import { numberWithCommas } from '../utility/Util.js';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

import { BsHouseFill } from 'react-icons/bs';
import { IoMdTrash } from 'react-icons/io';
import { MdEdit } from 'react-icons/md';
import { SiGoogleanalytics } from 'react-icons/si';
import { GoFileDirectory } from 'react-icons/go';
import { FaCheckCircle } from 'react-icons/fa';
import { SiGooglecalendar } from 'react-icons/si';
import { GiTwoCoins } from 'react-icons/gi';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { MdFileUpload } from 'react-icons/md';
import { IoMdAddCircle } from 'react-icons/io';

import { IoOpenOutline, IoBedSharp , IoWaterSharp, IoTrailSignSharp, IoBookmarkSharp} from 'react-icons/io5';


class PropertyCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            isFirstChild: this.props.data.state.isFirstChild,
            property: this.props.data.state.property_details,
            isLoading: false
        };
        
        // this.deletePropertyByUser = this.deletePropertyByUser.bind(this);
        // this.removePropertyFromState = this.props.removePropertyFromState;
        this.setActiveProperty = this.props.setActiveProperty;
        // this.toggleIcons = this.toggleIcons.bind(this);
        // this.toggleFilesIcons = this.toggleFilesIcons.bind(this);
    }
    
    deletePropertyByUser() {
        var axiosDeletePropertyByUserURL = '/api/user/property/' + this.state.user["id"];
        axios({
            method: 'delete',
            url: axiosDeletePropertyByUserURL,
            params: {
                property_id: this.state.propertyID
            }
        }).then(response => {
            this.removePropertyFromParentState(this.state.propertyID);
        }).catch(error => console.log(error));

        this.removePropertyFromState(this.state.propertyID, this.state.propertyType);

    }

    componentDidMount() {
  
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div></div>
            );
        }
        return (
            <div className={
                this.state.isFirstChild ? 
                "property_card_box property_card_box_first_child" :
                "property_card_box"}>
                <div className="property_card_header_box">
                    <p className="property_card_box_title">
                        ${this.state.property["estimate"] ? numberWithCommas(this.state.property["estimate"]) : numberWithCommas(this.state.property["price_bought"])}
                    </p>
                    {this.state.property["currently_rented"] ?
                    <FaCheckCircle className="rented_check_icon"></FaCheckCircle> :
                    <div></div>}
                    <IoMdAddCircle 
                        onClick={() => {
                            this.setActiveProperty(this.state.property["id"])
                        }}
                        className="property_card_box_title_expand_icon">
                    </IoMdAddCircle>                
                </div>
                {/* <div className="property_box_title_box"> */}
                    {/* <p className="property_card_box_title">
                        ${this.numberWithCommas(this.state.property["estimate"])}
                    </p>
                    <IoOpenOutline 
                        onClick={() => {
                            this.setActiveProperty(this.state.property["id"])
                        }}
                        className="property_card_box_title_expand_icon">
                    </IoOpenOutline>
                    {this.state.property["currently_rented"] ? 
                    <div className="property_card_rented_box">
                        <FaCheckCircle className="rented_check_icon"></FaCheckCircle>
                        <p className="property_rented_text">
                            Rented
                        </p>
                    </div> : <div></div>} */}
                    
                    {/* <div className="property_card_box_title_expand_button">
                        Expand
                    </div> */}
                {/* </div> */}
                <div className="clearfix"/>
                <p className="property_card_box_address_title">
                    {this.state.property["address"]}
                </p>
                <p className="property_card_box_address_subtitle">
                    {this.state.property["state"]}, {this.state.property["zip_code"]}
                </p>
                <div className="property_card_box_info_box">
                    <div className="property_card_box_info_box_first_row">
                        <div className="property_card_box_info_box_first_row_first_element">
                            <IoBedSharp className="property_card_box_info_box_icon"></IoBedSharp>
                            <p className="property_card_box_info_box_text">
                                {this.state.property["num_beds"]} {this.state.property["num_beds"] > 1 ? "beds" : "bed"}
                            </p>
                        </div>
                        <div className="property_card_box_info_box_first_row_second_element">
                            <IoWaterSharp className="property_card_box_info_box_icon"></IoWaterSharp>
                            <p className="property_card_box_info_box_text">
                                {this.state.property["num_baths"]} {this.state.property["num_baths"] > 1 ? "baths" : "bath"}
                            </p>
                        </div>
                    </div>
                    <div className="property_card_box_info_box_second_row">
                        <div className="property_card_box_info_box_first_row_first_element">
                            <IoTrailSignSharp className="property_card_box_info_box_icon"></IoTrailSignSharp>
                            <p className="property_card_box_info_box_text">
                                {this.state.property["num_units"]} {this.state.property["num_units"] > 1 ? "units" : "unit"}
                            </p>
                        </div>
                        <div className="property_card_box_info_box_first_row_second_element">
                            <IoBookmarkSharp className="property_card_box_info_box_icon"></IoBookmarkSharp>
                            <p className="property_card_box_info_box_text">
                                {numberWithCommas(this.state.property["square_footage"])} sq ft
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PropertyCard;