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

import { IoOpenOutline, IoBedSharp , IoWaterSharp, IoTrailSignSharp, IoBookmarkSharp} from 'react-icons/io5';


class PropertyCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            property: this.props.data.state.property_details,
            isLoading: true
        };

        console.log(this.state.property);
        // this.deletePropertyByUser = this.deletePropertyByUser.bind(this);
        // this.removePropertyFromState = this.props.removePropertyFromState;
        this.numberWithCommas = this.numberWithCommas.bind(this);
        // this.toggleIcons = this.toggleIcons.bind(this);
        // this.toggleFilesIcons = this.toggleFilesIcons.bind(this);
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

    // toggleIcons(type) {

    //     var newMap = this.state.iconsToggleMap;
    //     var toggled = this.state.iconsToggleMap[type];

    //     Object.keys(this.state.iconsToggleMap).map(function(key) {
    //         newMap[key] = false;
    //     })

    //     // flip the toggle.
    //     newMap[type] = !toggled;
    //     this.setState({
    //         iconsToggleMap: newMap
    //     });
    //     return;
    // }

    // toggleFilesIcons(type) {

    //     var newMap = this.state.filesToggleMap;
    //     var toggled = this.state.filesToggleMap[type];

    //     newMap[type] = !toggled;
    //     this.setState({
    //         filesToggleMap: newMap
    //     });
    //     return;
    // }

    componentDidMount() {

        var estimate = this.state.priceEstimate ? this.state.priceEstimate : this.state.priceBought;
        var loan = this.state.priceBought - this.state.downPayment;
        var ltvRatio = loan / estimate * 100;

        var url = 'api/user/files/' + this.state.user["id"] + '/' + this.state.property["id"];
        var files;
        axios({
            method: 'get',
            url: url,
        }).then(response => {
            if (response == null) {
                return;
            }

            var data = response.data;
            this.setState({
                isLoading: false
            })
        }).catch(error => {
            this.setState({
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
                    <div className="property_card_box">
                        <div className="property_box_title_box">
                            <p className="property_card_box_title">
                                ${this.numberWithCommas(this.state.property["estimate"])}
                            </p>
                            <IoOpenOutline className="property_card_box_title_expand_icon">
                            </IoOpenOutline>
                            {/* <div className="property_card_box_title_expand_button">
                                Expand
                            </div> */}
                        </div>
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
                                        {this.numberWithCommas(this.state.property["square_footage"])} sq ft
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    // <div className="propertyCard">
                    //     <p className="property_card_address">
                    //         {this.state.address} 
                    //     </p>
                    //     {this.state.rented ? 
                    //     <div id="property_rented_box">
                    //         <FaCheckCircle id="rented_check_icon">
                    //         </FaCheckCircle>
                    //         <p id="property_rented_text">
                    //             Rented
                    //         </p>
                    //     </div> : 
                    //     <div></div>}
                    //     <IoMdTrash  onClick={this.deletePropertyByUser} className="property_card_delete_button property_card_end_button"/>
                    //     <MdEdit className="property_card_edit_button property_card_end_button"></MdEdit>
                    //     <div
                    //         id="files"
                    //         onClick={(param) => this.toggleIcons('files')}>
                    //         <GoFileDirectory 
                    //             className={ this.state.iconsToggleMap['files'] ? "property_card_file_button_on property_card_end_button" : "property_card_file_button_off property_card_end_button"} 
                    //         />  
                    //     </div>
                    //     <div>
                    //         <SiGoogleanalytics
                    //             id="analysis"
                    //             onClick={() => {this.toggleIcons('analysis')}}
                    //             className={ this.state.iconsToggleMap['analysis'] ? "property_card_analytics_button_on property_card_end_button" : "property_card_analytics_button_off property_card_end_button"} 
                    //         />
                    //     </div> 
                    //     <div>
                    //         { this.state.iconsToggleMap['files'] ? 
                    //                 <MdFileUpload
                    //                 id="add_file"
                    //                 className="property_card_add_file_icon property_card_end_button"
                    //                 />
                    //             : <div></div>
                    //         } 
                    //     </div>        
                    //     <div className="clearfix"/>
                    //     <div id="property_card_sub_info_box">
                    //         <p id="property_card_sub_info_subaddress">
                    //             {this.state.city}, {this.state.state} {this.state.zipCode}
                    //         </p>
                    //         <br></br>
                    //         <p className="property_card_sub_info_estimate">
                    //             ${this.state.priceEstimate ? this.numberWithCommas(this.state.priceEstimate) : this.numberWithCommas(this.state.priceBought)}
                    //             {this.state.priceEstimate ? <div></div> : <HiOutlineExclamationCircle id="estimate_warning_icon"></HiOutlineExclamationCircle>}
                    //         </p>
                    //         <div className="clearfix"/>
                    //         <br></br>
                    //         <div id="property_card_sub_info_subtext_box">
                    //             <div className="property_card_sub_info_subbox">
                    //                 <BsHouseFill className="property_card_sub_info_icon"></BsHouseFill>
                    //                 <p className="property_card_sub_info_subtext_title">
                    //                     {this.state.numBedrooms ? this.state.numBedrooms : "-"} beds {this.state.numBathrooms ? this.state.numBathrooms : "-"} baths 
                    //                 </p>
                    //             </div>
                    //             <div className="property_card_sub_info_subbox">
                    //                 <GiTwoCoins className="property_card_sub_info_icon"></GiTwoCoins>
                    //                 <p className="property_card_sub_info_subtext_title">
                    //                     ${this.state.priceRented ? this.state.priceRented : "-"}
                    //                 </p>
                    //                 <p className="property_card_sub_info_subtext_subtitle">
                    //                         / month
                    //                     </p> 
                    //                 </div>
                    //                 <div className="clearfix"/>
                    //                 <div className="property_card_sub_info_subbox">
                    //                     <SiGooglecalendar className="property_card_sub_info_icon"></SiGooglecalendar>
                    //                     <p className="property_card_sub_info_subtext_title">
                    //                         {this.state.boughtDate ? this.state.boughtDate : "-"} 
                    //                     </p>
                    //                     <p className="property_card_sub_info_subtext_subtitle">
                    //                         purchase date
                    //                     </p>
                    //                 </div>
                    //             </div>
                    //         </div>
                    //         {this.renderSubSection()}
                // </div>
                }
            </div>
        )
    }
}

export default PropertyCard;