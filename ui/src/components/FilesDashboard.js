import React from 'react';
import axios from 'axios';

import './CSS/FilesDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import FileCard from './FileCard.js';
import UploadFileModal from './UploadFileModal.js';
import FolderCard from './FolderCard.js';

import ProgressBar from './../utility/ProgressBar.js';

import { MdFileDownload, MdEdit } from 'react-icons/md';
import { IoMdArrowDropdown } from 'react-icons/io';
import { IoTrashSharp } from 'react-icons/io5';
import { GoFileDirectory } from 'react-icons/go';
import { FaFolder } from 'react-icons/fa';
import { 
    AiFillFile, 
    AiFillFileImage, 
    AiFillFileExclamation, 
    AiFillFilePdf, 
    AiFillFileExcel, 
    AiFillFilePpt, 
    AiFillFileText, 
    AiFillFileWord, 
    AiFillFileZip } from 'react-icons/ai';

/****
 * The UI is rendered using a field "filesToDisplay".
 * filesToDisplay is re-set every time we call renderFiles().
 * renderFiles() takes in a map of [propertyID -> []Files]
 * renderFiles() will automatically recreate the ui state and update the UI. 
 * All edits to the state should be done by editing this.state.propertyToFilesMap 
 * and passing it in to renderFiles(). 
 */

const small = "small";
const medium = "medium";

const folders = "folders";
const files = "files";

export const openSignedURL = (userID, fileKey)  => {
    var url = "api/user/files/" + userID + "/" + fileKey;
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


 // isSmall is used for small icons
 export const mapFileTypeToIcon = (imageType, size, isActive) => {
    var classNames;
    if (size === small) {
         classNames = "files_dashboard_upload_image_type_mini_icon";
    } else if (size === medium) {
        classNames = "files_dashboard_upload_image_type_medium_icon";
    } else {
        classNames = "files_dashboard_upload_image_type";
    }

    if (imageType === null || imageType === undefined) {
        classNames += isActive? " card_white" : " card_grey";
        return (
            <div>
                <AiFillFileExclamation 
                    className={classNames}>
                </AiFillFileExclamation>
            </div>
        )
    }

    if (imageType.includes("image")){
        classNames += isActive? " card_white" : " card_blue";
        return (
            <div>
                <AiFillFileImage 
                    className={classNames}>
                </AiFillFileImage>
            </div>
        );
    } else if (imageType.includes("pdf")) {
        classNames += isActive? " card_white" : " card_red";
        return (
            <div>
                <AiFillFilePdf
                    className={classNames}>
                </AiFillFilePdf>
            </div>
        )
    } else if (imageType.includes("video")) {
        classNames += isActive? " card_white" : " card_blue";
        return (
            <div>
                <AiFillFile 
                    className={classNames}>
                </AiFillFile>
            </div>
        )
    } else if (imageType.includes("audio")) {
        classNames += isActive? " card_white" : " card_blue";
        return (
            <div>
                <AiFillFile 
                    className={classNames}>
                </AiFillFile>
            </div>
        )
    } else if (imageType.includes("zip")) {
        classNames += isActive? " card_white" : " card_grey";
        return (
            <div>
                <AiFillFileZip
                    className={classNames}>
                </AiFillFileZip>
            </div>
        )
    } else if (imageType.includes("text")) {
        classNames += isActive? " card_white" : " card_grey";
        return (
            <div>
                <AiFillFileText
                    className={classNames}>
                </AiFillFileText>
            </div>
        )
    } else if (imageType.includes("presentation")) {
        classNames += isActive? " card_white" : " card_orange";
        return (
            <div>
                <AiFillFilePpt
                    className={classNames}>
                </AiFillFilePpt>
            </div>
        )
    } else if (imageType.includes("spreadsheet")) {
        classNames += isActive? " card_white" : " card_green";
        return (
            <div>
                <AiFillFileExcel
                    className={classNames}>
                </AiFillFileExcel>
            </div>
        )
    } else if (imageType.includes("doc")) {
        classNames += isActive? " card_white" : " card_blue";
        return (
            <div>
                <AiFillFileWord
                    className={classNames}>
                </AiFillFileWord>
            </div>
        )
    } else {
        classNames += isActive? " card_white" : " card_grey";
        return (
            <div>
                <AiFillFileExclamation
                    className={classNames}>
                </AiFillFileExclamation>
            </div>
        )
    }
}

class FilesDashboard extends React.Component {
        
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            profilePicture: this.props.location.state.profilePicture,
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
            pageToDisplay: folders,
            activeFolderPropertyID: null,
        };

        this.setActiveFileAttributes = this.setActiveFileAttributes.bind(this);
        this.downloadActiveFiles = this.downloadActiveFiles.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        this.deleteActiveFiles = this.deleteActiveFiles.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.handleSearchBar = this.handleSearchBar.bind(this);
        this.trimTrailingFileName = this.trimTrailingFileName.bind(this);
        this.convertPropertyToFilesMapToElements = this.convertPropertyToFilesMapToElements.bind(this);
        this.closeFileUpload = this.closeFileUpload.bind(this);
        this.renderFolders = this.renderFolders.bind(this);
        this.setActiveFolder = this.setActiveFolder.bind(this);
        this.renderActiveFolderFiles = this.renderActiveFolderFiles.bind(this);
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
                propertiesMap: propertiesMap,
                isPropertiesLoading: false
            });
        }).catch(error => {
            console.log(error);
            this.setState({
                isPropertiesLoading: false
            })
        });
    }

    closeFileUpload() {
        this.setState({
            displayUploadFileBox: false
        })
    }
    
    downloadFile(value, key, map) {
        var url = "api/user/files/" + this.state.user["id"] + "/" + key;
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
        var url = "api/user/files/" + this.state.user["id"] + "/" + key;
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
     
    trimTrailingFileName(fileName) {
        if (fileName.length > 20) {
            return fileName.substring(0,20) + "...";
        }
        return fileName;
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
        })
        return true;
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
                            user: this.state.user,
                            file: file,
                            backgroundColor: "white",
                            setActiveFileAttributes: this.setActiveFileAttributes,
                            openSignedURL: openSignedURL, 
                            mapFileTypeToIcon: mapFileTypeToIcon
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

    setActiveFolder(folderPropertyID) {



        this.setState({
            activeFolderPropertyID: folderPropertyID,
            pageToDisplay: files,
        })
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

    renderActiveFolderFiles() {

    }

    renderFolders() {

        let propertiesMap = this.state.propertiesMap;

        let folders = [];

        // Add our All folder(s).
        folders.push(
            <FolderCard data={{
                state: {
                    user: this.state.user,
                    folderPropertyID: "All",
                    folderName: "All",
                    setActiveFolder: this.setActiveFolder,
                }
            }}
            ></FolderCard>
        );

        propertiesMap.forEach((value, key, map) => {
            folders.push(
                <FolderCard data={{
                    state: {
                        user: this.state.user,
                        folderPropertyID: key,
                        folderName: value,
                    }
                }}
                ></FolderCard>
            )
        })
        return folders;
    }

    render() {
        return (
            <div>
                <DashboardSidebar data={{
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate,
                        profilePicture: this.state.profilePicture,
                        currentPage: "files"
                    }
                }}/>
                <div id="files_dashboard_parent_box">
                    {this.state.displayUploadFileBox ? 
                        <div className="files_dashboard_display_add_file_box">
                            <UploadFileModal
                                data={{
                                    state: {
                                        propertiesMap: this.state.propertiesMap,
                                        closeFileUpload: this.closeFileUpload
                                    }                       
                                }}/>
                        </div> :
                    <div></div>}
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
                            {/*<div   
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
                            </div> */}
                            {/* {
                                this.state.displaySortBox ? 
                                <div 
                                    id="files_dashboard_sort_options_box" 
                                    className="files_dashboard_category_and_sort_options_box"
                                    onMouseEnter={() => this.setState({displaySortBox: true})} 
                                    onMouseLeave={() => this.setState({displaySortBox: false})}>
                                    {this.renderSortOptions()}
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
                            } */}
                            <div 
                                className="files_dashboard_upload_file_text_button" 
                                onClick={() => this.setState({
                                    displayUploadFileBox: true
                                    })}>Add File</div>
                            {this.state.activeFiles.size >= 1 ?
                                <IoTrashSharp className="files_dashboard_icons" onClick={() => this.deleteActiveFiles()}></IoTrashSharp> : 
                                <div></div>}
                            {this.state.activeFiles.size >= 1 ? 
                                <MdFileDownload className="files_dashboard_icons" onClick={() => this.downloadActiveFiles()}></MdFileDownload> : 
                                <div></div>
                            }
                            {this.state.activeFiles.size === 1 ? 
                                <MdEdit className="files_dashboard_icons"></MdEdit> : 
                                <div></div>
                            }
                        </div>                        
                        <div className="clearfix"/>
                        <div id="files_dashboard_files_box">
                            {
                                this.state.pageToDisplay === folders ?
                                (this.state.isLoading ? 
                                    <div></div> : 
                                    <div>
                                        <p className="files_dashboard_page_to_display_title">Folders</p>
                                        {this.renderFolders()}
                                    </div>
                                ): (
                                    this.state.pageToDisplay === files ?
                                    <div>
                                        {this.renderActiveFolderFiles()}
                                    </div>:
                                    <div></div>
                                )
                            }
                            
                            {/* {
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
                            } */}
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