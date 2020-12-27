import React from 'react';
import axios from 'axios';

import './CSS/FilesDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import FileCard from './FileCard.js';

import ProgressBar from './../utility/ProgressBar.js';

import { MdFileDownload, MdFileUpload, MdEdit } from 'react-icons/md';
import { IoMdTrash, IoMdArrowDropdown } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';
import { AiFillFile, AiFillFileImage, AiFillFileExclamation, AiFillFilePdf, AiFillFileExcel, AiFillFilePpt, AiFillFileText, AiFillFileWord, AiFillFileZip } from 'react-icons/ai';

/****
 * The UI is rendered using a field "filesToDisplay".
 * filesToDisplay is re-set every time we call renderFiles().
 * renderFiles() takes in a map of [propertyID -> []Files]
 * renderFiles() will automatically recreate the ui state and update the UI. 
 * All edits to the state should be done by editing this.state.propertyToFilesMap 
 * and passing it in to renderFiles(). 
 */

class FilesDashboard extends React.Component {
        
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            sortToggleMap: [['A-Z', false]],
            // files is the main point with how files are displayed.
            files: [],
            originalLoadedFiles: [],
            propertyToFilesMap: new Map(),
            properties: new Map(),
            // activeFiles are files that the user has currently selected.
            activeFiles: new Map(),
            activeSearchFiles: [],
            filesToDisplay: null,
            displayUploadFileBox: false,
            fileUploadProgressBar: 0,
            displayUploadFileBox: false,
            sortType: null,
            categoryType: null,
            categoryTypeArrowDown: true,
            sortTypeArrowDown: true,
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
        this.convertPropertyToFilesMapToElements = this.convertPropertyToFilesMapToElements.bind(this);
    }

    componentDidMount() {
        // Load our files list.
        axios({
            method: 'get',
            url: 'api/user/files/' + this.state.user["id"],
        }).then(response => {
            var filesList = response.data;
            filesList.sort(function(a,b){
                return new Date(b["metadata"]["last_edited_at"]) - new Date(a["metadata"]["last_edited_at"]);
            })

            var propertyToFilesMap = new Map();

            for (var i = 0; i < filesList.length; i++) {

                var file = filesList[i];
                var propertyID = file["property_id"];
                
                // property does not exist yet. Add it.
                if (!propertyToFilesMap.has(propertyID)) {
                    propertyToFilesMap.set(propertyID, []);
                }

                var filesArrAtProperty = propertyToFilesMap.get(propertyID);
                filesArrAtProperty.push(file);
                propertyToFilesMap.set(propertyID, filesArrAtProperty);
            }  

            this.renderFiles(propertyToFilesMap);

            this.setState({
                files: filesList.slice(),
                originalLoadedFiles: filesList.slice(),
                // sort our properties map by alphabetical order, except leave General as last.
                propertyToFilesMap: propertyToFilesMap,
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
            url:  'api/user/property/' + this.state.user["id"],
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
    setActiveFileAttributes(fileKey, file, toRemove) {
        var currentActiveFiles = this.state.activeFiles;
        if (currentActiveFiles === null || currentActiveFiles === undefined || currentActiveFiles.length === 0) {
            currentActiveFiles = new Map();
        }
        if (currentActiveFiles.size >= 25 && !toRemove) {
            return false
        }
        if (!toRemove) {
            currentActiveFiles.set(fileKey, file);
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
        var activeFiles = this.state.activeFiles;
        var activeFilesIterator = activeFiles.entries();
        var currPropertyToFilesMap = new Map([...this.state.propertyToFilesMap]);

        var nextElem = activeFilesIterator.next();
        while (nextElem !== null && nextElem.value !== undefined) {
            var key = nextElem.value[0];
            var success = await this.deleteFile(key);
            if (success === true) {
                activeFiles.delete(key);
                var propertyID = nextElem.value[1]["property_id"];
                var arrAtPropertyID = currPropertyToFilesMap.get(propertyID);
                
                var arrAtPropertyIDLength = arrAtPropertyID.length;
                for (var i = 0; i < arrAtPropertyIDLength; i++) {
                    var fKey = arrAtPropertyID[i]["property_id"] + "/" + arrAtPropertyID[i]["name"]
                    if (key === fKey) {
                        arrAtPropertyID.splice(i, 1);
                        currPropertyToFilesMap.set(propertyID, arrAtPropertyID);
                        break;
                    }
                }

                for (var i = 0; i < currFiles.length; i++) {
                    // When we filter by properties, we inject <div> elements which do not have a state.
                    // Add this check to filter them out. 
                    var file = currFiles[i];
                    var fKey = file["property_id"] + "/" + file["name"];
                    if (key === fKey) {
                        currFiles.splice(i, 1);
                        continue;
                    }
                }
            }
            nextElem = activeFilesIterator.next();
        }
        this.renderFiles(currPropertyToFilesMap);

        this.setState({
            files: [...currFiles],
            activeFiles: [...activeFiles],
            propertyToFilesMap: currPropertyToFilesMap
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

        var yearInput = document.getElementById("files_dashboard_upload_file_year_input");

        // Year sanitization is handled server side. If empty, server will fill in with current year. 
        var yearInputValue = yearInput.value;

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
        formData.append('year', yearInputValue);


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
            <option name={property[1]} key={property[1] + i} value={property[0]}>{property[1]}</option>
        ))
    }

    handleSearchBar(e) {
        var searchValue = e.target.value.toLowerCase().replace(/\s/g, "");

        this.setState({
            activeSearchFiles: this.state.filesToDisplay.filter(file => {
                return (file.props && file.props.data) ? file.props.data.state.file["name"].toLowerCase().replace(/\s/g, "").startsWith(searchValue) : file;
            })
        })
    }

    renderActiveSearchFiles() {
        return this.state.activeSearchFiles.length > 0 ? this.state.activeSearchFiles : this.renderNoFiles();
    }

    renderNoFiles() {
        return (
            <div id="files_dashboard_no_files_box">
                <p id="files_dashboard_no_files_box_title">
                    No Files
                </p>
            </div>
        );
    }

    enforceYearInput(e) {
        e.target.value = e.target.value > 4 ? e.target.value.slice(0, 4) : e.target.value;
    }

    handleSortOptionsHelper(newPropertyToFilesMap, sortType, arrowDown) {

        newPropertyToFilesMap.forEach((key, value, map) => {
            
            // key is an array of html elements containing files.
            var files = key;

            switch (sortType) {
                case "A-Z":
                    files.sort(function(a,b) {
                        if (a["name"] > b["name"]) {
                            return arrowDown ? 1 : -1;
                        } else if (b["name"] > a["name"]){
                            return arrowDown ? -1 : 1;
                        }
                        return 0;
                    })
                    break;
                case "Uploaded Date":
                    files.sort(function(a,b) {
                        return arrowDown ? 
                        new Date(a["metadata"]["uploaded_at"]) - new Date(b["metadata"]["uploaded_at"]) :
                        new Date(b["metadata"]["uploaded_at"]) - new Date(a["metadata"]["uploaded_at"]);
                    })
                    break;
                case "Last Edited Date":
                    files.sort(function(a,b) {
                        return arrowDown ?
                        new Date(a["metadata"]["last_edited_at"]) - new Date(b["metadata"]["last_edited_at"]) :
                        new Date(b["metadata"]["last_edited_at"]) - new Date(a["metadata"]["last_edited_at"]);
                    })
                    break;
            }
        });
        return newPropertyToFilesMap; 
    }

    /* handleSortOptions is a state machine handler. There are three possible 
    /* states that our Sort button can be in. 
    /* State 1: Default: (Sort V) (V is the down Arrow)
    /* State 2: After click: (SORT_TYPE V), for example (A-Z V)
    /* State 3: After secondary click: (SORT_TYPE ^) (^ is the up Arrow)
    /* We cycle between these states */
    handleSortOptions(sortType) {

        var sortTypeArrowDown = this.state.sortTypeArrowDown;
        var newPropertyToFilesMap;

        if (this.state.sortType === null || this.state.sortType === undefined || this.state.sortType !== sortType) {
            newPropertyToFilesMap = this.handleSortOptionsHelper(this.state.propertyToFilesMap, sortType, true);
            sortTypeArrowDown = true;
        } else if (sortTypeArrowDown){
            newPropertyToFilesMap = this.handleSortOptionsHelper(this.state.propertyToFilesMap, sortType, false);
            sortTypeArrowDown = false;
        } else if (!sortTypeArrowDown) {
            // we sort by last edited date by default.
            newPropertyToFilesMap = this.handleSortOptionsHelper(this.state.propertyToFilesMap, "Last Edited Date", true);
            sortType = null;
            sortTypeArrowDown = true;
        }

        this.renderFiles(newPropertyToFilesMap);

        this.setState({
            sortType: sortType,
            displaySortBox: false,
            sortTypeArrowDown: sortTypeArrowDown,
            propertyToFilesMap: newPropertyToFilesMap,
        })
    }

    convertPropertyToFilesMapToElements(propertyToFilesMap) {

        var files = [];
        var generalArr = [];
        propertyToFilesMap.forEach((key, value, map) => {
            // key is an array of html elements; value is the propertyID.
            var tempElementsArr = [];
            var propertyID;
            var propertyAddress;
            var propertyName;
            
            for (var i = 0; i < key.length; i++) {
                var file = key[i];
                propertyID = file["property_id"];
                propertyAddress = file["address"];
                propertyName = file["name"]
                tempElementsArr.push(
                    <FileCard key={propertyID + "/" + propertyName} data={{
                        state: {
                            userID: this.state.userID,
                            file: file,
                            setActiveFileAttributes: this.setActiveFileAttributes,
                            openSignedURL: this.openSignedURL, 
                            mapFileTypeToIcon: this.mapFileTypeToIcon
                        }                       
                    }}/>
                )
            }
            // Add our clearfix.
            tempElementsArr.concat(
                <div className="clearfix"/>
            );

            tempElementsArr.unshift(
                <div key={propertyID + i}>
                    <div className="files_dashboard_property_sort_title">
                        {propertyAddress}
                    </div>
                    <div className="clearfix"/>
                </div>
            );

            // place general at the front.
            if (value === "general") {
                generalArr = tempElementsArr;
                return;
            }
            files = files.concat(tempElementsArr);
        })

        files = generalArr.concat(files);
        // files.unshift(generalArr);
        return files;
    }

    renderFiles(propertyToFilesMap) {
        this.setState({
            filesToDisplay: [...this.convertPropertyToFilesMapToElements(propertyToFilesMap)]
        })
    }

    // renderSortOptions() {
        
    //     var options = [];
    //     var sortTypes = ['A-Z', 'Uploaded Date', 'Last Edited At'];

    //     for (var i = 0; i < sortTypes.length; i++) {
    //         var sortType = sortTypes[i];
    //         options.push(
    //             <li key={"sort" + i} className={
    //                 this.state.sortType === {sortType} ?
    //                 "files_dashboard_sort_options_list files_dashboard_sort_focus" : 
    //                 "files_dashboard_sort_options_list"
    //             }
    //             onClick={this.handleSortOptions({sortType})}
    //             >{sortType}</li>
    //         );
    //     }
    //     return (<div>
    //         {options}
    //     </div>);
    // }

    renderUploadBox() {
        return (
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
                        <div id="files_dashboard_upload_file_final_button" onClick={this.handleFileUpload}>
                            Upload
                        </div>
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
                    <select id="files_dashboard_upload_file_category_select" className="upload_file_select_half_left">
                        <option value="" disabled selected>File Type</option>
                        <option name="mortgage" value="mortgage">Mortgage</option>
                        <option name="contracting" value="contracting">Contracting</option>
                        <option name="property" value="property">Property</option>
                        <option name="receipts" value="receipts">Receipts</option>
                        <option name="repairs" value="repairs">Repairs</option>
                        <option name="taxes" value="taxes">Taxes</option>
                        <option name="other" value="other">Other</option>
                    </select>
                    <input 
                        id="files_dashboard_upload_file_year_input" 
                        className="upload_file_input_half_right" 
                        type="number" 
                        maxlength="4"
                        onChange={this.enforceYearInput}
                        placeholder="Year">
                    </input>
                    <div className="clearfix"/>
                </div>
                <div className="clearfix"></div>
                <ProgressBar id="upload_file_progress_bar" bgColor="#296CF6" completed={this.state.fileUploadProgressBar}></ProgressBar>
            </div>
        )
    }

    render() {
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        user: this.state.user,
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

                    {this.state.isFileLoading || this.state.isPropertiesLoading ? <div></div> : 
                    <div>
                        <div id="files_dashboard_icons_box">
                            <div   
                                id="files_dashboard_category_parent"
                                className="files_dashboard_filter_and_sort_box" 
                                onMouseEnter={() => this.setState({displayCategoryBox: true})} 
                                onMouseLeave={() => this.setState({displayCategoryBox: false})}>
                                <div 
                                    id="files_dashboard_sort" 
                                    className={
                                            this.state.displayCategoryBox ? 
                                            "square_bottom_borders display_sort_box files_dashboard_category_and_sort" : 
                                            (
                                                this.state.categoryType ? 
                                                "display_sort_box files_dashboard_category_and_sort" : 
                                                "files_dashboard_category_and_sort"
                                            )}
                                    onClick={() => {
                                        if (this.state.sortType) {
                                            this.handleSortOptions(this.state.sortType);
                                            }}
                                        }
                                        >
                                    <p className="files_dashboard_sort_text">
                                        {this.state.categorType ? this.state.categoryType : "Category"}
                                    </p>
                                    <IoMdArrowDropdown id="files_dashboard_sort_icon" className={this.state.categoryTypeArrowDown ? "" : "files_dashboard_sort_icon_up"}></IoMdArrowDropdown>

                                </div>
                            </div>
                            {
                                this.state.displayCategoryBox ? 
                                <div 
                                    id="files_dashboard_category_options_box" 
                                    className="files_dashboard_category_and_sort_options_box"
                                    onMouseEnter={() => this.setState({displayCategoryBox: true})} 
                                    onMouseLeave={() => this.setState({displayCategoryBox: false})}>
                                    <li className={
                                            this.state.categoryType === "Mortgage" ? 
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" : 
                                            "files_dashboard_sort_options_list"
                                        } 
                                        onClick={() => this.handleCategoryOptions("Mortgage")}>
                                        Mortgage
                                    </li>
                                    <li className={
                                            this.state.categoryType === "Contracting" ? 
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" :
                                            "files_dashboard_sort_options_list"
                                        } 
                                        onClick={() => this.handleCategoryOptions("Contracting")}>
                                        Contracting
                                    </li>
                                    <li className={
                                            this.state.categoryType === "Property" ?
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" :
                                            "files_dashboard_sort_options_list"
                                        } onClick={() => this.handleCategoryOptions("Property")}>
                                        Property
                                    </li>
                                    <li className={
                                            this.state.categoryType === "Receipts" ?
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" :
                                            "files_dashboard_sort_options_list"
                                        } onClick={() => this.handleCategoryOptions("Receipts")}>
                                        Receipts
                                    </li>
                                    <li className={
                                            this.state.categoryType === "Repairs" ?
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" :
                                            "files_dashboard_sort_options_list"
                                        } onClick={() => this.handleCategoryOptions("Repairs")}>
                                        Repairs
                                    </li>
                                    <li className={
                                            this.state.categoryType === "Taxes" ?
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" :
                                            "files_dashboard_sort_options_list"
                                        } onClick={() => this.handleCategoryOptions("Taxes")}>
                                        Taxes
                                    </li>
                                    <li className={
                                            this.state.categoryType === "Other" ?
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" :
                                            "files_dashboard_sort_options_list"
                                        } onClick={() => this.handleCategoryOptions("Other")}>
                                        Other
                                    </li>
                                </div> : 
                                <div></div>
                            }
                            <div 
                                id="files_dashboard_sort_parent"
                                className="files_dashboard_filter_and_sort_box" 
                                onMouseEnter={() => this.setState({displaySortBox: true})} 
                                onMouseLeave={() => this.setState({displaySortBox: false})}>
                                <div 
                                    className={
                                            this.state.displaySortBox ? 
                                            "square_bottom_borders display_sort_box files_dashboard_category_and_sort" : 
                                            (
                                                this.state.sortType ? 
                                                "display_sort_box files_dashboard_category_and_sort" : 
                                                "files_dashboard_category_and_sort"
                                            )}
                                    onClick={() => {
                                        if (this.state.sortType) {
                                            this.handleSortOptions(this.state.sortType);
                                            }}
                                        }
                                        >
                                    <p className="files_dashboard_sort_text">
                                        {this.state.sortType ? this.state.sortType : "Sort"}
                                    </p>
                                    <IoMdArrowDropdown id="files_dashboard_sort_icon" className={this.state.sortTypeArrowDown ? "" : "files_dashboard_sort_icon_up"}></IoMdArrowDropdown>
                                    
                                </div>
                            </div>
                            {
                                this.state.displaySortBox ? 
                                <div 
                                    id="files_dashboard_sort_options_box" 
                                    className="files_dashboard_category_and_sort_options_box"
                                    onMouseEnter={() => this.setState({displaySortBox: true})} 
                                    onMouseLeave={() => this.setState({displaySortBox: false})}>
                                    {/* {this.renderSortOptions()} */}
                                    <li className={
                                            this.state.sortType === "A-Z" ? 
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" : 
                                            "files_dashboard_sort_options_list"
                                        } 
                                        onClick={() => this.handleSortOptions("A-Z")}>
                                        A-Z
                                    </li>
                                    <li className={
                                            this.state.sortType === "Uploaded Date" ? 
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" :
                                            "files_dashboard_sort_options_list"
                                        } 
                                        onClick={() => this.handleSortOptions("Uploaded Date")}>
                                        Uploaded Date
                                    </li>
                                    <li className={
                                            this.state.sortType === "Last Edited Date" ?
                                            "files_dashboard_sort_options_list files_dashboard_sort_focus" :
                                            "files_dashboard_sort_options_list"
                                        } onClick={() => this.handleSortOptions("Last Edited Date")}>
                                        Last Edited Date
                                    </li>
                                </div> : 
                                <div></div>
                            }
                            <div id="files_dashboard_upload_file_text_button" onClick={() => this.setState({displayUploadFileBox: true})}>Add File</div>
                            {this.state.activeFiles.size >= 1 ?
                                <IoMdTrash id="trash_file_icon" className="files_dashboard_icons" onClick={() => this.deleteActiveFiles()}></IoMdTrash> : 
                                <div></div>}
                            {this.state.activeFiles.size >= 1 ? 
                                <MdFileDownload id="download_file_icon" className="files_dashboard_icons" onClick={() => this.downloadActiveFiles()}></MdFileDownload> : 
                                <div></div>
                            }
                            {this.state.activeFiles.size === 1 ? 
                                <MdEdit id="edit_file_icon" className="files_dashboard_icons"></MdEdit> : 
                                <div></div>
                            }
                        </div>
                        <div className="clearfix"/>
                        {this.state.displayUploadFileBox ? 
                        this.renderUploadBox()
                         : <div></div>}
                        <div className="clearfix"/>
                        <div id="files_dashboard_files_box">
                            {
                                this.state.isLoading ? 
                                <div></div> : 
                                (
                                    (this.state.activeSearchFiles.length > 0 || document.getElementById("files_dashboard_search_bar").value !== "") ? 
                                    this.renderActiveSearchFiles() :
                                    (this.state.files ?
                                    this.state.filesToDisplay : 
                                    this.renderNoFiles()
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