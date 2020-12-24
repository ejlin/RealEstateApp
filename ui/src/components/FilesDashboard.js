import React from 'react';
import axios from 'axios';

import './CSS/FilesDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import FileCard from './FileCard.js';

import ProgressBar from './../utility/ProgressBar.js';

import { MdFileDownload, MdFileUpload, MdEdit } from 'react-icons/md';
import { IoMdTrash } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';
import { AiFillFile, AiFillFileImage, AiFillFileExclamation, AiFillFilePdf, AiFillFileExcel, AiFillFilePpt, AiFillFileText, AiFillFileWord, AiFillFileZip } from 'react-icons/ai';

class FilesDashboard extends React.Component {
        
    constructor(props) {
        super(props);

        this.state = {
            userID: this.props.location.state.id,
            firstName: this.props.location.state.firstName,
            lastName: this.props.location.state.lastName,
            email: this.props.location.state.email,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            sortToggleMap: [['A-Z', false]],
            files: [],
            properties: new Map(),
            activeFiles: new Map(),
            activeSearchFiles: [],
            displayUploadFileBox: false,
            fileUploadProgressBar: 0,
            isFileLoading: true,
            isPropertiesLoading: true,
        };

        this.setActiveFileAttributes = this.setActiveFileAttributes.bind(this);
        this.openSignedURL = this.openSignedURL.bind(this);
        this.downloadActiveFiles = this.downloadActiveFiles.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        this.deleteActiveFiles = this.deleteActiveFiles.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.handleSearchBar = this.handleSearchBar.bind(this);
        this.handleFileUploadChange = this.handleFileUploadChange.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.trimTrailingFileName = this.trimTrailingFileName.bind(this);
        this.renderFileUploadPropertiesSelection = this.renderFileUploadPropertiesSelection.bind(this);
    }

    componentDidMount() {
        // Load our files list.
        axios({
            method: 'get',
            url: 'api/user/files/' + this.state.userID,
        }).then(response => {
            var filesList = response.data;
            this.setState({
                files: filesList.map((file, i) => 
                    <FileCard key={i} data={{
                        state: {
                            userID: this.state.userID,
                            file: file,
                            setActiveFileAttributes: this.setActiveFileAttributes,
                            openSignedURL: this.openSignedURL, 
                            mapFileTypeToIcon: this.mapFileTypeToIcon
                        }                       
                    }}/>
                ),
                isFileLoading: false
            });
        }).catch(error => {
            this.setState({
                isFileLoading: false
            })
            console.log(error);
        });

        // Load our properties list.
        axios({
            method: 'get',
            url:  'api/user/property/' + this.state.userID,
        }).then(response => {
            var propertiesList = response.data;

            var propertiesMap = new Map();
            for (var i = 0; i < propertiesList.length; i++) {
                var propertyID = propertiesList[i]["id"];
                var propertyAddress = propertiesList[i]["address"];
                propertiesMap.set(propertyID, propertyAddress);
            }
            this.setState({
                properties: [...propertiesMap],
                isPropertiesLoading: false
            });
        }).catch(error => {
            console.log(error);
            this.setState({
                isPropertiesLoading: false
            })
        });
    }

    // file Key = propertyID + '/' + fileName
    setActiveFileAttributes(fileKey, toRemove) {
        var currentActiveFiles = this.state.activeFiles;
        if (currentActiveFiles.size >= 25 && !toRemove) {
            return false
        }
        if (!toRemove) {
            currentActiveFiles.set(fileKey, true);
        } else {
            // Remove from active ("unclicked")
            currentActiveFiles.delete(fileKey);
        }
        this.setState({
            activeFiles: currentActiveFiles
        });
        return true;
    }

    openSignedURL(fileKey) {
        var url = "api/user/files/" + this.state.userID + "/" + fileKey;
        axios({
            method: 'get',
            url: url,
            params: {
                request: "signed_url"
            }
        }).then(response => {
            var url = response.data;
            if (url !== "") {
                window.open(url, '_blank', 'noopener,noreferrer')
            }
        }).catch(error => console.log(error));
    }

    downloadFile(value, key, map) {
        var url = "api/user/files/" + this.state.userID + "/" + key;
        axios({
            method: 'get',
            url: url,
            params: {
                request: "download"
            },
            responseType: 'blob'
        }).then(response => {
            // Downloads the file
            // Credit: https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'unknown';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename='(.+)'/);
                if (fileNameMatch.length === 2)
                    fileName = fileNameMatch[1];
            }
            link.setAttribute('download', fileName); //or any other extension
            document.body.appendChild(link);
            link.click();
        }).catch(error => console.log(error));
    }

    downloadActiveFiles() {
        this.state.activeFiles.forEach(this.downloadFile)
    }

    async deleteFile(key) {
        var url = "api/user/files/" + this.state.userID + "/" + key;
        var success = false;
        await axios({
            method: 'delete',
            url: url,
        }).then(response => {
            if (response.status === 200) {
                success = true;
                return success;
            }
        }).catch(error => console.log(error));
        return success;
    }

    async deleteActiveFiles() {
        var currFiles = this.state.files;
        var activeFiles = this.state.activeFiles
        var activeFilesIterator = activeFiles.entries();

        var nextElem = activeFilesIterator.next();
        while (nextElem !== null && nextElem.value !== undefined) {
            var key = nextElem.value[0];
            var success = await this.deleteFile(key);
            if (success === true) {
                activeFiles.delete(key);
                for (var i = 0; i < currFiles.length; i++) {
                    var file = currFiles[i].props.data.state.file;
                    var fKey = file["property_id"] + "/" + file["name"];
                    if (key === fKey) {
                        currFiles.splice(i, 1);
                        continue;
                    }
                }
            }
            nextElem = activeFilesIterator.next();
        }
        this.setState({
            files: [...currFiles],
            activeFiles: [...activeFiles]
        });
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

        // var signedURL;
        // axios({
        //     method: 'get',
        //     url: 'api/user/files/upload/' + this.state.userID + '/' + propertySelectValue + '?file_name=' + fileName,
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


        // If user wants to override the default name.
        if (nameInputValue !== "") {
            formData.append('file_name', nameInputValue);
        }

        axios({
            method: 'post',
            url: 'api/user/files/upload/' + this.state.userID,
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
            var currFiles = this.state.files;

            currFiles.push(<FileCard key={currFiles.length + 1} data={{
                state: {
                    userID: this.state.userID,
                    file: response.data,
                    setActiveFileAttributes: this.setActiveFileAttributes,
                    openSignedURL: this.openSignedURL, 
                    mapFileTypeToIcon: this.mapFileTypeToIcon,
                }                       
            }}/>);
            this.setState({
                files: currFiles,
                displayUploadFileBox: false,
                fileToUpload: null,
                fileUploadProgressBar: 0,
            })
        }).catch(error => console.log(error));
    }

    trimTrailingFileName(fileName) {
        if (fileName.length > 20) {
            return fileName.substring(0,20) + "...";
        }
        return fileName;
    }

    // isSmall is used for small icons
    mapFileTypeToIcon(imageType, isSmall) {
        if (imageType === null || imageType === undefined) {
            return (
                <div>
                    <AiFillFileExclamation 
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon grey" : 
                            "files_dashboard_upload_image_type grey"
                        }>
                    </AiFillFileExclamation>
                </div>
            )
        }

        if (imageType.includes("image")){
            return (
                <div>
                    <AiFillFileImage 
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon blue": 
                            "files_dashboard_upload_image_type blue"
                    }>
                    </AiFillFileImage>
                </div>
            );
        } else if (imageType.includes("pdf")) {
            return (
                <div>
                    <AiFillFilePdf
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon red": 
                            "files_dashboard_upload_image_type red"
                    }>
                    </AiFillFilePdf>
                </div>
            )
        } else if (imageType.includes("video")) {
            return (
                <div>
                    <AiFillFile 
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon blue": 
                            "files_dashboard_upload_image_type blue"
                    }>
                    </AiFillFile>
                </div>
            )
        } else if (imageType.includes("audio")) {
            return (
                <div>
                    <AiFillFile 
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon blue": 
                            "files_dashboard_upload_image_type blue"
                    }>
                    </AiFillFile>
                </div>
            )
        } else if (imageType.includes("zip")) {
            return (
                <div>
                    <AiFillFileZip
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon grey": 
                            "files_dashboard_upload_image_type grey"
                    }>
                    </AiFillFileZip>
                </div>
            )
        } else if (imageType.includes("text")) {
            return (
                <div>
                    <AiFillFileText
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon grey": 
                            "files_dashboard_upload_image_type grey"
                    }>
                    </AiFillFileText>
                </div>
            )
        } else if (imageType.includes("presentation")) {
            return (
                <div>
                    <AiFillFilePpt
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon orange": 
                            "files_dashboard_upload_image_type orange"
                    }>
                    </AiFillFilePpt>
                </div>
            )
        } else if (imageType.includes("spreadsheet")) {
            return (
                <div>
                    <AiFillFileExcel
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon green": 
                            "files_dashboard_upload_image_type green"
                    }>
                    </AiFillFileExcel>
                </div>
            )
        } else if (imageType.includes("doc")) {
            return (
                <div>
                    <AiFillFileWord
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon blue": 
                            "files_dashboard_upload_image_type blue"
                    }>
                    </AiFillFileWord>
                </div>
            )
        } else {
            return (
                <div>
                    <AiFillFileExclamation
                        className={
                            isSmall ? 
                            "files_dashboard_upload_image_type_mini_icon grey": 
                            "files_dashboard_upload_image_type grey"
                    }>
                    </AiFillFileExclamation>
                </div>
            )
        }
    }

    renderFileUploadPropertiesSelection() {
        return (
            this.state.properties.map((property, i) => 
            <option name={property[1]} key={i} value={property[0]}>{property[1]}</option>
        ))
    }

    handleSearchBar(e) {
        var searchValue = e.target.value.toLowerCase();
        this.setState({
            activeSearchFiles: this.state.files.filter(file => {
                return file.props.data.state.file["name"].toLowerCase().startsWith(searchValue);
            })
        })
    }

    render() {
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        id: this.state.userID,
                        firstName: this.state.firstName,
                        lastName: this.state.lastName,
                        email: this.state.email,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        currentPage: "files"
                    }
                }}/>
                <div id="files_dashboard_parent_box">
                    <div id="files_dashboard_welcome_box">
                        <p id="files_dashboard_welcome_box_title">
                            Files
                        </p>
                        <input id="files_dashboard_search_bar" placeholder="Search..." onChange={this.handleSearchBar}>
                        </input>
                    </div>
                    <div className="clearfix"/>
                    {/* <div id="files_dashboard_sort_box">
                        <p id="files_dashboard_sort_box_title">
                            Filter: 
                        </p> 
                        <ul id ="files_dashboard_sort_box_list">
                            <li className={this.state.sortToggleMap['A-Z'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Mortgage
                            </li>
                            <li className={this.state.sortToggleMap['Date'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Contracting
                            </li>
                            <li className={this.state.sortToggleMap['Property'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Property
                            </li>
                            <li className={this.state.sortToggleMap['A-Z'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Receipts
                            </li>
                            <li className={this.state.sortToggleMap['Date'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Repairs
                            </li>
                            <li className={this.state.sortToggleMap['Property'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Taxes
                            </li>
                            <li className={this.state.sortToggleMap['Property'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Other
                            </li>
                        </ul>
                        <div className="clearfix"/>
                        <p id="files_dashboard_sort_box_title">
                            Sort: 
                        </p>
                        <ul id ="files_dashboard_sort_box_list">
                            <li className={this.state.sortToggleMap['A-Z'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                A - Z
                            </li>
                            <li className={this.state.sortToggleMap['Date'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Uploaded Date
                            </li>
                            <li className={this.state.sortToggleMap['Date'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Last Edited Date
                            </li>
                            <li className={this.state.sortToggleMap['Property'] ? "files_dashboard_sort_box_type_list_on files_dashboard_sort_box_type_list" : "files_dashboard_sort_box_type_list_off files_dashboard_sort_box_type_list"}>
                                Property
                            </li>
                            <BsCaretDownFill id="files_dashboard_sort_box_arrow_icon"></BsCaretDownFill>
                        </ul>
                    </div> */}
                    {this.state.isFileLoading || this.state.isPropertiesLoading ? <div></div> : 
                    <div>
                        <div id="files_dashboard_icons_box">
                            <div id="files_dashboard_upload_file_text_button" onClick={() => this.setState({displayUploadFileBox: true})}>Add File</div>
                            {this.state.activeFiles.size >= 1 ? 
                                <MdFileDownload className="files_dashboard_icons" onClick={() => this.downloadActiveFiles()}></MdFileDownload> : 
                                <div></div>
                            }
                            {this.state.activeFiles.size >= 1 ?
                                <IoMdTrash className="files_dashboard_icons" onClick={() => this.deleteActiveFiles()}></IoMdTrash> : 
                                <div></div>}
                            {this.state.activeFiles.size === 1 ? 
                                <MdEdit className="files_dashboard_icons"></MdEdit> : 
                                <div></div>
                            }
                        </div>
                        <div className="clearfix"/>
                        {this.state.displayUploadFileBox ? 
                        <div id="files_dashboard_upload_file_box">
                            <div id="files_dashboard_upload_file_left_box">
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
                                            <p id="files_dashboard_upload_file_title">
                                                Choose File
                                            </p>
                                        </div>}
                                </label>
                                <input id="files_dashboard_upload_file_button" type="file" onChange={this.handleFileUploadChange}></input>
                            </div>
                            <div id="files_dashboard_upload_file_right_box">
                                <div>
                                    <p id="files_dashboard_upload_file_label">Upload a File</p>
                                    <IoCloseSharp 
                                        id="files_dashboard_upload_file_close_icon" 
                                        onClick={() => 
                                            this.setState({
                                                displayUploadFileBox: false,
                                                fileToUpload: null
                                            })}>
                                    </IoCloseSharp>
                                    <MdFileUpload id="files_dashboard_upload_file_final_button" onClick={this.handleFileUpload}>
                                    </MdFileUpload>
                                </div>
                                <input 
                                    id="files_dashboard_upload_file_name_input"
                                    placeholder={this.state.fileToUpload && this.state.fileToUpload["name"] ? this.state.fileToUpload["name"] : "File Name"} 
                                    className={this.state.fileToUpload && this.state.fileToUpload["name"] ? "upload_file_input dark_placeholder" : "upload_file_input"}>
                                </input>
                                <br></br>
                                <select id="files_dashboard_upload_file_property_select" className="upload_file_select">
                                    <option value="" disabled selected>Property</option>
                                    <option name="general" value="general">General</option>
                                    {this.renderFileUploadPropertiesSelection()}
                                </select>
                                <br></br>
                                <select id="files_dashboard_upload_file_category_select" className="upload_file_select">
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
                            <div className="clearfix"></div>
                            <ProgressBar id="upload_file_progress_bar" bgColor="#296CF6" completed={this.state.fileUploadProgressBar}></ProgressBar>
                        </div> : <div></div>}
                        <div className="clearfix"/>
                        <div id="files_dashboard_files_box">
                            {
                                this.state.isLoading ? 
                                <div></div> : 
                                (
                                    this.state.activeSearchFiles.length > 0 ? 
                                    this.state.activeSearchFiles :
                                    (this.state.files ?
                                    this.state.files : 
                                    <div id="files_dashboard_no_files_box">
                                        <p id="files_dashboard_no_files_box_title">
                                            No Files
                                        </p>
                                    </div>
                                    )
                                )
                            }
                        </div>
                    </div>}
                    <NotificationSidebar data={{
                        state: {
                            totalEstimateWorth: this.state.totalEstimateWorth,
                            missingEstimate: this.state.missingEstimate 
                        }
                    }}/>
                </div>
            </div>
        )
    }
}

export default FilesDashboard;