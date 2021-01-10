import React from 'react';

import axios from 'axios';

import './CSS/UploadFileModal.css';
import './CSS/Style.css';
import DropdownSelect from './DropdownSelect.js';

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
        this.handleFileUploadChange = this.handleFileUploadChange.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
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

    enforceYearInput(e) {
        e.target.value = e.target.value > 4 ? e.target.value.slice(0, 4) : e.target.value;
    }

    handleFileUploadChange(event) {
        var file = event.target.files[0];
        if (file !== null && file !== undefined) {
            this.setState({
                fileToUpload: file
            })
        }
    }

    handleFileUpload() {
        var file = this.state.fileToUpload;
        if (file === null || file === undefined) {
            return;
        }

        var nameInput = document.getElementById("files_dashboard_upload_file_name_input");
        var nameInputValue = nameInput.value;

        var fileName = file["name"];
        if (nameInputValue !== "") {
            fileName = nameInputValue;
        }

        var propertySelect = document.getElementById("files_dashboard_upload_file_property_select");
        var propertySelectValue = propertySelect.value;
        var propertySelectAddress = propertySelect.options[propertySelect.selectedIndex].text;

        var fileCategorySelect = document.getElementById("files_dashboard_upload_file_category_select");
        var fileCategorySelectValue = fileCategorySelect.value;

        var yearInput = document.getElementById("files_dashboard_upload_file_year_input");

        // Year sanitization is handled server side. If empty, server will fill in with current year. 
        var yearInputValue = yearInput.value;

        // var signedURL;
        // axios({
        //     method: 'get',
        //     url: 'api/user/files/upload/' + this.state.user["id"] + '/' + propertySelectValue + '?file_name=' + fileName,
        // }).then(response => {
        //     signedURL = response.data;
        //     axios({
        //         method: 'put',
        //         url: signedURL,
        //         data: file
        //     }).then(signedURLResponse => {
        //         console.log(signedURLResponse);
        //     }).catch(signedURLError => {
        //         console.log(signedURLError);
        //     });
        // }).catch(error => {
        // });

        var formData = new FormData();
        formData.append('file', file);
        formData.append('property_id', propertySelectValue);
        formData.append('file_category', fileCategorySelectValue);
        formData.append('file_type', file["type"]);
        formData.append('address', propertySelectAddress);
        formData.append('year', yearInputValue);


        // If user wants to override the default name.
        if (nameInputValue !== "") {
            formData.append('file_name', nameInputValue);
        }

        axios({
            method: 'post',
            url: 'api/user/files/upload/' + this.state.user["id"],
            config: {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            },
            onUploadProgress: (progressEvent) => {
                // Use Math.min because we currently upload to the server, then upload to GCS. The GCS step can take a while,
                // but this only tracks progress from client -> server. Stop it at 90, then finish the last 10 once we 
                // successfully write to GCS.
                var progressCompleted = Math.min(Math.round((progressEvent.loaded * 100) / progressEvent.total), 98);
                this.setState({
                    fileUploadProgressBar: progressCompleted
                })
            },
            data: formData
        }).then(response => {
            var currFiles = this.state.propertyToFilesMap;
            if (!currFiles.has(propertySelectValue)) {
                currFiles.set(propertySelectValue, []);
            }

            var propertyArr = currFiles.get(propertySelectValue);
            propertyArr.unshift(response.data);

            currFiles.set(propertySelectValue, propertyArr);

            var files = this.state.files;
            files.push(response.data);

            this.renderFiles(currFiles);

            this.setState({
                files: [...files],
                displayUploadFileBox: false,
                fileToUpload: null,
                fileUploadProgressBar: 0,
                propertyToFilesMap: currFiles
            })
        }).catch(error => console.log(error));
    }

    render() {
        return (
            <div>
                <div className="upload_file_modal_parent_box">
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
                                <DropdownSelect data={{
                                    state: {
                                        inputMap: this.state.properties,
                                        inputList: this.state.propertyAddresses,
                                        includeNone: true,
                                        includeAll: true,
                                        placeholderText: "Add a Property",
                                    }
                                }}/>
                                <div className="create_expense_modal_render_associated_properties_box">
                                    {/* {this.renderAssociatedProperties()} */}
                                </div>
                            </div>
                            <div className="files_dashboard_upload_file_right_box_right_box">
                                <p className="files_dashboard_title">
                                    Year
                                </p>
                                <input 
                                    type="number" 
                                    maxlength="4"
                                    placeholder="YYYY"
                                    onChange={this.enforceYearInput}
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