import React from 'react';
import axios from 'axios';

import './CSS/PropertyCard.css';

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

class PropertyCard extends React.Component {
    constructor(props) {
        super(props);

        var propDetails = this.props.data.state.property_details;
        var iconsToggleMap = new Map([['analysis', false], ['files', false]]);
        var filesToggleMap = new Map([
                ['property', false],
                ['receipts', false], 
                ['mortgage', false], 
                ['repairs', false], 
                ['contracting', false], 
                ['taxes', false], 
                ['other', false]]);

        this.state = {
            userID: this.props.data.state.userID,
            username: this.props.data.state.username,
            propertyID: propDetails["id"],
            address: propDetails["address"],
            city: propDetails["city"],
            state: propDetails["state"],
            zipCode: propDetails["zip_code"],
            priceBought: propDetails["price_bought"],
            priceRented: propDetails["price_rented"],
            priceEstimate: propDetails["price_estimate"],
            downPayment: propDetails["price_down_payment"],
            boughtDate: propDetails["bought_date"],
            rented: true,
            propertyType: propDetails["property_type"],
            iconsToggleMap: iconsToggleMap,
            filesToggleMap: filesToggleMap,
            files: [],
            isLoading: true
        };
        this.deletePropertyByUser = this.deletePropertyByUser.bind(this);
        this.removePropertyFromState = this.props.removePropertyFromState;
        this.numberWithCommas = this.numberWithCommas.bind(this);
        this.toggleIcons = this.toggleIcons.bind(this);
        this.toggleFilesIcons = this.toggleFilesIcons.bind(this);
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

    toggleIcons(type) {

        var newMap = this.state.iconsToggleMap;
        var toggled = this.state.iconsToggleMap[type];

        Object.keys(this.state.iconsToggleMap).map(function(key) {
            newMap[key] = false;
        })

        // flip the toggle.
        newMap[type] = !toggled;
        this.setState({
            iconsToggleMap: newMap
        });
        return;
    }

    toggleFilesIcons(type) {

        var newMap = this.state.filesToggleMap;
        var toggled = this.state.filesToggleMap[type];

        newMap[type] = !toggled;
        this.setState({
            filesToggleMap: newMap
        });
        return;
    }

    componentDidMount() {

        var estimate = this.state.priceEstimate ? this.state.priceEstimate : this.state.priceBought;
        var loan = this.state.priceBought - this.state.downPayment;
        var ltvRatio = loan / estimate * 100;

        var url = 'api/user/files/' + this.state.userID + '/' + this.state.propertyID;
        console.log(this.state.propertyID);
        console.log(url);
        var files;
        axios({
            method: 'get',
            url: url,
        }).then(response => {

            if (response == null) {
                return;
            }
            files = [];

            var data = response.data;
            this.setState({
                ltvRatio: Number(ltvRatio.toFixed(2)),
                numBedrooms: 4,
                numBathrooms: 2,
                files: data.map((object, i) =>
                    <div id="property_card_files_graphic" key={i}>
                        <p>
                            {object["name"]}
                            {object["uploaded_at"]}
                            {object["last_edited_at"]}
                        </p>
                    </div>
                ),
                isLoading: false
            })
            console.log(this.state.files);
        }).catch(error => {
            if (error.response.status === 404) {
                files = [];
            }
            this.setState({
                ltvRatio: Number(ltvRatio.toFixed(2)),
                numBedrooms: 4,
                numBathrooms: 2,
                isLoading: false
            })
        });
            
    }

    renderSubSection() {
        if (this.state.iconsToggleMap['analysis']) {
            return (
                <div></div>
            )
        } else if (this.state.iconsToggleMap['files']) {
            return (
                <div id="property_card_files_box" className="property_card_graphics_parent_title_box">
                    <ul id="property_card_files_overall_tag">
                        <li 
                            className={this.state.filesToggleMap['other'] ? "property_card_files_tag property_card_files_tag_on" : "property_card_files_tag property_card_files_tag_off" }
                            onClick={() => this.toggleFilesIcons('other')}
                        >
                            Other
                        </li>
                        <li 
                            className={this.state.filesToggleMap['taxes'] ? "property_card_files_tag property_card_files_tag_on" : "property_card_files_tag property_card_files_tag_off" }
                            onClick={() => this.toggleFilesIcons('taxes')}
                        >
                            Taxes
                        </li>
                        <li 
                            className={this.state.filesToggleMap['repairs'] ? "property_card_files_tag property_card_files_tag_on" : "property_card_files_tag property_card_files_tag_off" }
                            onClick={() => this.toggleFilesIcons('repairs')}
                        >
                            Repairs
                        </li>
                        <li 
                            className={this.state.filesToggleMap['receipts'] ? "property_card_files_tag property_card_files_tag_on" : "property_card_files_tag property_card_files_tag_off"}
                            onClick={() => this.toggleFilesIcons('receipts')}
                        >
                            Receipts
                        </li>
                        <li 
                            className={this.state.filesToggleMap['property'] ? "property_card_files_tag property_card_files_tag_on" : "property_card_files_tag property_card_files_tag_off"} 
                            onClick={() => this.toggleFilesIcons('property')}
                        >
                            Property
                        </li>
                        <li 
                            className={ this.state.filesToggleMap['contracting'] ? "property_card_files_tag property_card_files_tag_on" : "property_card_files_tag property_card_files_tag_off" }
                            onClick={() => this.toggleFilesIcons('contracting')}
                        >
                            Contracting
                        </li>
                        <li 
                            className={this.state.filesToggleMap['mortgage'] ? "property_card_files_tag property_card_files_tag_on" : "property_card_files_tag property_card_files_tag_off" }
                            onClick={() => this.toggleFilesIcons('mortgage')}
                        >
                            Mortgage
                        </li>
                    </ul>
                    <div id="property_card_files_box">
                        {this.state.files}
                    </div>
                </div>
            )
        } else {
            return (
                <div id="property_card_graphics_box" className="property_card_graphics_parent_title_box">
                    <div id="property_card_graphics_padding_left_box">
                        <div className="property_card_graphics_parent_box">
                            <div className="property_card_graphics_box_circular_graph">
                                <CircularProgressbar 
                                    value={this.state.ltvRatio ? this.state.ltvRatio : 0}
                                    text={`${this.state.ltvRatio ? this.state.ltvRatio : 0}%`}
                                    background
                                    backgroundPadding={5}
                                    styles={buildStyles({
                                    backgroundColor: "#EE9E77",
                                    textColor: "#fff",
                                    pathColor: "#fff",
                                    trailColor: "transparent",
                                    })}/>
                            </div>
                            <p className="property_card_graphics_box_label">
                                Loan to Value Ratio
                            </p>
                        </div>
                        <div className="property_card_graphics_parent_box">
                            <div className="property_card_graphics_box_circular_graph">
                                <CircularProgressbar 
                                    value={this.state.ltvRatio ? this.state.ltvRatio : 0}
                                    text={`${this.state.ltvRatio ? this.state.ltvRatio : 0}%`}
                                    background
                                    backgroundPadding={5}
                                    styles={buildStyles({
                                    backgroundColor: "#85bb65",
                                    textColor: "#fff",
                                    pathColor: "#fff",
                                    trailColor: "transparent",
                                    })}/>
                            </div>
                            <p className="property_card_graphics_box_label">
                                LTV Ratio
                            </p>
                        </div>
                        <div className="property_card_graphics_parent_box">
                            <div className="property_card_graphics_box_circular_graph">
                                <CircularProgressbar 
                                    value={this.state.ltvRatio ? this.state.ltvRatio : 0}
                                    text={`${this.state.ltvRatio ? this.state.ltvRatio : 0}%`}
                                    background
                                    backgroundPadding={5}
                                    styles={buildStyles({
                                    backgroundColor: "#6e4ec1",
                                    textColor: "#fff",
                                    pathColor: "#fff",
                                    trailColor: "transparent",
                                    })}/>
                            </div>
                            <p className="property_card_graphics_box_label">
                                LTV Ratio
                            </p>
                        </div>
                        <div className="property_card_graphics_parent_box">
                            <div className="property_card_graphics_box_circular_graph">
                                <CircularProgressbar 
                                    value={this.state.ltvRatio ? this.state.ltvRatio : 0}
                                    text={`${this.state.ltvRatio ? this.state.ltvRatio : 0}%`}
                                    background
                                    backgroundPadding={5}
                                    styles={buildStyles({
                                    backgroundColor: "#296CF6",
                                    textColor: "#fff",
                                    pathColor: "#fff",
                                    trailColor: "transparent",
                                    })}/>
                            </div>
                            <p className="property_card_graphics_box_label">
                                LTV Ratio
                            </p>
                        </div> 
                    </div>
                </div>
            )
        }
    }

    render() {
        return (
            <div>
                { this.state.isLoading ? <div></div> : 
                <div>
                    <div className="propertyCard">
                        <p className="property_card_address">
                            {this.state.address} 
                        </p>
                        {this.state.rented ? 
                        <div id="property_rented_box">
                            <FaCheckCircle id="rented_check_icon">
                            </FaCheckCircle>
                            <p id="property_rented_text">
                                Rented
                            </p>
                        </div> : 
                        <div></div>}
                        <IoMdTrash  onClick={this.deletePropertyByUser} className="property_card_delete_button property_card_end_button"/>
                        <MdEdit className="property_card_edit_button property_card_end_button"></MdEdit>
                        <div
                            id="files"
                            onClick={(param) => this.toggleIcons('files')}>
                            <GoFileDirectory 
                                className={ this.state.iconsToggleMap['files'] ? "property_card_file_button_on property_card_end_button" : "property_card_file_button_off property_card_end_button"} 
                            />  
                        </div>
                        <div>
                            <SiGoogleanalytics
                                id="analysis"
                                onClick={() => {this.toggleIcons('analysis')}}
                                className={ this.state.iconsToggleMap['analysis'] ? "property_card_analytics_button_on property_card_end_button" : "property_card_analytics_button_off property_card_end_button"} 
                            />
                        </div> 
                        <div>
                            { this.state.iconsToggleMap['files'] ? 
                                    <MdFileUpload
                                    id="add_file"
                                    className="property_card_add_file_icon property_card_end_button"
                                    />
                                : <div></div>
                            } 
                        </div>        
                        <div className="clearfix"/>
                        <div id="property_card_sub_info_box">
                            <p id="property_card_sub_info_subaddress">
                                {this.state.city}, {this.state.state} {this.state.zipCode}
                            </p>
                            <br></br>
                            <p className="property_card_sub_info_estimate">
                                ${this.state.priceEstimate ? this.numberWithCommas(this.state.priceEstimate) : this.numberWithCommas(this.state.priceBought)}
                                {this.state.priceEstimate ? <div></div> : <HiOutlineExclamationCircle id="estimate_warning_icon"></HiOutlineExclamationCircle>}
                            </p>
                            <div className="clearfix"/>
                            <br></br>
                            <div id="property_card_sub_info_subtext_box">
                                <div className="property_card_sub_info_subbox">
                                    <BsHouseFill className="property_card_sub_info_icon"></BsHouseFill>
                                    <p className="property_card_sub_info_subtext_title">
                                        {this.state.numBedrooms ? this.state.numBedrooms : "-"} beds {this.state.numBathrooms ? this.state.numBathrooms : "-"} baths 
                                    </p>
                                </div>
                                <div className="property_card_sub_info_subbox">
                                    <GiTwoCoins className="property_card_sub_info_icon"></GiTwoCoins>
                                    <p className="property_card_sub_info_subtext_title">
                                        ${this.state.priceRented ? this.state.priceRented : "-"}
                                    </p>
                                    <p className="property_card_sub_info_subtext_subtitle">
                                            / month
                                        </p> 
                                    </div>
                                    <div className="clearfix"/>
                                    <div className="property_card_sub_info_subbox">
                                        <SiGooglecalendar className="property_card_sub_info_icon"></SiGooglecalendar>
                                        <p className="property_card_sub_info_subtext_title">
                                            {this.state.boughtDate ? this.state.boughtDate : "-"} 
                                        </p>
                                        <p className="property_card_sub_info_subtext_subtitle">
                                            purchase date
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {this.renderSubSection()}
                    </div>
                </div>}
            </div>
        )
    }
}

export default PropertyCard;