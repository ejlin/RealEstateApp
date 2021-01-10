import React from 'react';

import './CSS/UploadFileModal.css';
import './CSS/Style.css';

import { IoCloseSharp, IoCloseOutline, IoTrashSharp } from 'react-icons/io5';
import { MdFileUpload } from 'react-icons/md';

import ProgressBar from './../utility/ProgressBar.js';

class UploadFileModal extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            closeFileUpload: this.props.data.state.closeFileUpload,
            properties: this.props.data.state.properties,
        };
    
        this.renderFileUploadPropertiesSelection = this.renderFileUploadPropertiesSelection.bind(this);
    }

    componentDidMount() {
        this.clickTimeout = null;
    }

    trimTrailingFileName(fileName) {
        if (fileName.length > 18) {
            return fileName.substring(0,18) + "...";
        }
        return fileName;
    }

    renderFileUploadPropertiesSelection() {
        return (
            this.state.properties.map((property, i) => 
            <option name={property[1]} key={property[1] + i} value={property[0]}>{property[1]}</option>
        ))
    }

    render() {
        return (
            <div>
                <div className="create_expense_modal_parent_box">
                    <div className="create_expense_modal_parent_box_title_box">
                        <IoCloseOutline 
                            onClick={() => {
                                this.state.closeFileUpload();
                            }}
                            className="create_expense_modal_parent_box_title_box_close_icon"></IoCloseOutline>
                    </div>
                    <div className="upload_file_modal_parent_box_inner_box">
                        <p className="create_expense_modal_parent_box_title">
                            Add a File 
                        </p>
                        <div className="clearfix"/>
                        <label htmlFor="files_dashboard_upload_file_button" id="files_dashboard_upload_file_button_label">
                            {this.state.fileToUpload ? 
                            <div alt={this.state.fileToUpload["name"] ? this.state.fileToUpload["name"] : "Unknown File"}>
                                <div>
                                    {this.mapFileTypeToIcon(this.state.fileToUpload["type"], false)}
                                </div>
                                <p id="files_dashboard_uploaded_file_name">
                                    {this.state.fileToUpload["name"] ? this.trimTrailingFileName(this.state.fileToUpload["name"]) : "Unable to Upload File"}
                                </p>
                            </div> : 
                            <div>
                                <MdFileUpload id="files_dashboard_upload_file_icon"></MdFileUpload>
                                <p className="files_dashboard_upload_file_title">
                                    Choose File
                                </p>
                            </div>}
                        </label>
                        <input id="files_dashboard_upload_file_button" type="file" onChange={this.handleFileUploadChange}></input>
                        <div className="files_dashboard_upload_file_right_box">
                            <input 
                                id="files_dashboard_upload_file_name_input"
                                placeholder={this.state.fileToUpload && this.state.fileToUpload["name"] ? this.state.fileToUpload["name"] : "File Name"} 
                                className={this.state.fileToUpload && this.state.fileToUpload["name"] ? "upload_file_input dark_placeholder" : "upload_file_input"}>
                            </input>
                            <div className="clearfix"/>
                            <div className="files_dashboard_upload_file_right_box_left_box">
                                <p className="files_dashboard_title">
                                    Associated Properties
                                </p>
                                <input 
                                    placeholder="Add a Property"
                                    className="files_dashboard_associated_properties_input">
                                </input>
                            </div>
                            <div className="files_dashboard_upload_file_right_box_right_box">
                                <p className="files_dashboard_title">
                                    Year
                                </p>
                                <input 
                                    placeholder="YYYY"
                                    className="files_dashboard_associated_properties_input">
                                </input>
                                <p className="files_dashboard_title">
                                    File Type
                                </p>
                                <select id="files_dashboard_upload_file_category_select" className="files_dashboard_file_type">
                                    <option value="" disabled selected>File Type</option>
                                    <option name="mortgage" value="mortgage">Mortgage</option>
                                    <option name="contracting" value="contracting">Contracting</option>
                                    <option name="property" value="property">Property</option>
                                    <option name="receipts" value="receipts">Receipts</option>
                                    <option name="repairs" value="repairs">Repairs</option>
                                    <option name="taxes" value="taxes">Taxes</option>
                                    <option name="other" value="other">Other</option>
                                </select>
                            </div>
                            {/* <select id="files_dashboard_upload_file_property_select" className="upload_file_select">
                                <option value="" disabled selected>Property</option>
                                <option name="general" value="general">General</option>
                                {this.renderFileUploadPropertiesSelection()}
                            </select> */}
                            
                            
                            {/* <input 
                                id="files_dashboard_upload_file_year_input" 
                                className="upload_file_input_half_right" 
                                type="number" 
                                maxlength="4"
                                onChange={this.enforceYearInput}
                                placeholder="Year">
                            </input> */}
                            <div className="clearfix"></div>
                            {/* <ProgressBar id="upload_file_progress_bar" bgColor="#296CF6" completed={this.state.fileUploadProgressBar}></ProgressBar> */}
                            <div className="files_dashboard_upload_file_final_button" onClick={this.handleFileUpload}>
                                Upload
                            </div>
                        </div>
                    </div>
                </div>
                <div className="create_expense_modal_padding_bottom">
                </div>
            </div>
        );
    }
}

export default UploadFileModal;