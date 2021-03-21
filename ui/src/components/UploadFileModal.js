import React from 'react';

import axios from 'axios';

import './CSS/UploadFileModal.css';
import './CSS/Style.css';
import DropdownSelect from './DropdownSelect.js';

import Loader from './Loader.js';


import { IoCloseSharp, IoCloseOutline, IoTrashSharp } from 'react-icons/io5';
import { MdFileUpload } from 'react-icons/md';

import ProgressBar from './../utility/ProgressBar.js';

import { getByValue, mapFileTypeToIcon } from '../utility/Util.js';

let URLBuilder = require('url-join');

const All = "All";
const None = "None";

const properties = "properties";

class UploadFileModal extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            propertiesMap: this.props.data.state.propertiesMap,
            propertiesAddresses: Array.from(this.props.data.state.propertiesMap.values()),
            closeUploadFileModal: this.props.data.state.closeUploadFileModal,
            setRecentlyUploadedFile: this.props.data.state.setRecentlyUploadedFile,
            host: window.location.protocol + "//" + window.location.host,
        };

        this.renderFileUploadPropertiesSelection = this.renderFileUploadPropertiesSelection.bind(this);
        this.handleFileUploadChange = this.handleFileUploadChange.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.setParentList = this.setParentList.bind(this);
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
            this.state.propertiesMap.map((property, i) => 
            <option name={property[1]} key={property[1] + i} value={property[0]}>{property[1]}</option>
        ))
    }

    enforceYearInput(e) {
        e.target.value = e.target.value > 4 ? e.target.value.slice(0, 4) : e.target.value;
    }

    handleFileUploadChange(event) {
        let file = event.target.files[0];
        if (file !== null && file !== undefined) {
            this.setState({
                fileToUpload: file
            })
        }
    }

    handleFileUpload() {
        this.setState({
            loadUpload: true,
        })
        
        let file = this.state.fileToUpload;
        if (file === null || file === undefined) {
            return;
        }

        let nameInput = document.getElementById("files_dashboard_upload_file_name_input");
        let nameInputValue = nameInput.value;

        let fileName = file["name"];
        if (nameInputValue !== "") {
            fileName = nameInputValue;
        }

        let fileCategorySelect = document.getElementById("upload_file_modal_category_select");
        let fileCategorySelectValue = fileCategorySelect.value;

        let yearInput = document.getElementById("upload_file_modal_year_input");

        // Year sanitization is handled server side. If empty, server will fill in with current year. 
        let yearInputValue = yearInput.value;

        // let signedURL;
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

        let formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', fileCategorySelectValue);
        formData.append('metadata_file_type', file["type"]);
        formData.append('metadata_file_size_bytes', file["size"]);
        formData.append('year', yearInputValue);


        // If user wants to override the default name.
        if (nameInputValue !== "") {
            formData.append('file_name', nameInputValue);
        }

        let currSelectedAssociatedProperties = this.state.currSelectedAssociatedProperties;
        let indexAll = currSelectedAssociatedProperties.indexOf(All);
        let indexNone = currSelectedAssociatedProperties.indexOf(None);

        let associatedProperties = [];
        let propertiesMap = this.state.propertiesMap;

        if (indexAll >= 0) {
            // Add all of our properties.
            propertiesMap.forEach((value, key, map) => {
                // Add our propertyIDs
                if (key != None && key != All){
                    associatedProperties.push(key);
                }
            })
        } else if (indexNone >= 0) {
        } else {
            // Add all the ids of the properties selected.
            for (let i = 0; i < currSelectedAssociatedProperties.length; i++) {
                let currSelectedAssociatedProperty = currSelectedAssociatedProperties[i];
                let propertyID = getByValue(propertiesMap, currSelectedAssociatedProperty);
                if (propertyID !== null){
                    associatedProperties.push(propertyID);
                } else {
                    associatedProperties.push(None);
                }
            }
        }   

        formData.append(properties, associatedProperties);

        let userID = this.state.user["id"];
        let host = this.state.host;
        let uploadFileURL = URLBuilder(host, "api/user/files/upload", userID);
        
        axios({
            method: 'post',
            url: uploadFileURL,
            config: {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            },
            onUploadProgress: (progressEvent) => {
                // Use Math.min because we currently upload to the server, then upload to GCS. The GCS step can take a while,
                // but this only tracks progress from client -> server. Stop it at 90, then finish the last 10 once we 
                // successfully write to GCS.
                let progressCompleted = Math.min(Math.round((progressEvent.loaded * 100) / progressEvent.total), 98);
                this.setState({
                    fileUploadProgressBar: progressCompleted
                })
            },
            data: formData
        }).then(response => {
            // let currFiles = this.state.propertyToFilesMap;
            // if (!currFiles.has(propertySelectValue)) {
            //     currFiles.set(propertySelectValue, []);
            // }

            // let propertyArr = currFiles.get(propertySelectValue);
            // propertyArr.unshift(response.data);

            // currFiles.set(propertySelectValue, propertyArr);

            // let files = this.state.files;
            // files.push(response.data);

            // this.renderFiles(currFiles);

            // this.setState({
            //     files: [...files],
            //     displayUploadFileBox: false,
            //     fileToUpload: null,
            //     fileUploadProgressBar: 0,
            //     propertyToFilesMap: currFiles
            // })
            let file = response.data;
            this.state.closeUploadFileModal();
            this.state.setRecentlyUploadedFile(file, associatedProperties);
        }).catch(error => console.log(error));
    }

    setParentList(properties) {
        this.setState({
            currSelectedAssociatedProperties: properties,
        })
    }

    render() {
        return (
            <div>
                <div style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                    float: "left",
                    minHeight: "450px",
                    marginLeft: "max(15%, calc((100% - 475px)/2))",
                    marginRight: "10%",
                    marginTop: "125px",
                    maxWidth: "550px",
                    paddingBottom: "30px",
                    width: "475px",
                    zIndex: "11",
                }}>
                    <div className="create_expense_modal_parent_box_title_box">
                        <IoCloseOutline 
                            onClick={() => {
                                this.state.closeUploadFileModal();
                            }}
                            className="create_expense_modal_parent_box_title_box_close_icon"></IoCloseOutline>
                    </div>
                    <div className="upload_file_modal_parent_box_inner_box">
                        <p className="create_expense_modal_parent_box_title">
                            Add a File 
                        </p>
                        <div className="clearfix"/>
                        <div className="files_dashboard_upload_file_right_box">
                            <input 
                                id="files_dashboard_upload_file_name_input"
                                placeholder={this.state.fileToUpload && this.state.fileToUpload["name"] ? this.state.fileToUpload["name"] : "File Name"} 
                                className={this.state.fileToUpload && this.state.fileToUpload["name"] ? "upload_file_input dark_placeholder" : "upload_file_input"}>
                            </input>

                            <div className="clearfix"/>
                            <p className="files_dashboard_upload_file_title">Attach a File</p>
                            <div className="clearfix"/>

                            <label htmlFor="files_dashboard_upload_file_button" id="files_dashboard_upload_file_button_label">
                                {this.state.fileToUpload ? 
                                <div alt={this.state.fileToUpload["name"] ? this.state.fileToUpload["name"] : "Unknown File"}>
                                    <div>
                                        {mapFileTypeToIcon(this.state.fileToUpload["type"], false, "upload_file_modal_file_type_icon")}
                                    </div>
                                    <p className="upload_file_modal_uploaded_file_name">
                                        {this.state.fileToUpload["name"] ? this.trimTrailingFileName(this.state.fileToUpload["name"]) : "Unable to Upload File"}
                                    </p>
                                </div> : 
                                <div>
                                    <MdFileUpload id="files_dashboard_upload_file_icon"></MdFileUpload>
                                    <p className="files_dashboard_upload_box_file_title">
                                        Choose File
                                    </p>
                                </div>}
                            </label>
                            <input id="files_dashboard_upload_file_button" type="file" onChange={this.handleFileUploadChange}></input>
                            <div className="clearfix"/>
                            <div className="upload_files_dashboard_inner_parent_box">
                                <div className="files_dashboard_left_box">
                                    <p className="files_dashboard_title">
                                        File Type
                                    </p>
                                    <select id="upload_file_modal_category_select" className="files_dashboard_file_type">
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
                                <div className="files_dashboard_right_box">
                                    <p className="files_dashboard_title">
                                        Year
                                    </p>
                                    <input 
                                        id="upload_file_modal_year_input"
                                        type="number" 
                                        maxlength="4"
                                        placeholder="YYYY"
                                        onChange={this.enforceYearInput}
                                        className="files_dashboard_associated_properties_input">
                                    </input>
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <p className="files_dashboard_title">
                                Associated Properties
                            </p>
                            <DropdownSelect data={{
                                state: {
                                    inputMap: this.state.properties,
                                    inputList: this.state.propertiesAddresses,
                                    includeNone: true,
                                    includeAll: true,
                                    placeholderText: "Add a Property",
                                    setParentList: this.setParentList,
                                }
                            }}/>
                            <div className="create_expense_modal_render_associated_properties_box">
                                {/* {this.renderAssociatedProperties()} */}
                            </div>
                            {/* <select id="files_dashboard_upload_file_property_select" className="upload_file_select">
                                <option value="" disabled selected>Property</option>
                                <option name="general" value="general">General</option>
                                {this.renderFileUploadPropertiesSelection()}
                            </select> */}
                            
                            <div className="clearfix"></div>
                            {/* <ProgressBar id="upload_file_progress_bar" bgColor="#296CF6" completed={this.state.fileUploadProgressBar}></ProgressBar> */}
                            <div className={
                                    this.state.loadUpload ? 
                                    "files_dashboard_upload_file_final_button loading_button" :
                                    "files_dashboard_upload_file_final_button"
                                }
                                onClick={this.handleFileUpload}>
                                {this.state.loadUpload ? 
                                <Loader data={{
                                    state: {
                                        class: "upload_file_modal_loader",
                                    }
                                }}/> :
                                "Upload"}
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