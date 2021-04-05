import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/FilesDashboard.css';
import './CSS/Style.css';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import FileCard from './FileCard.js';
import UploadFileModal from './UploadFileModal.js';
import FolderCard from './FolderCard.js';
import FolderPage from './FolderPage.js';

import { trimTrailingName, mapFileTypeToIcon, openSignedURL, bytesToSize } from '../utility/Util.js';

import ProgressBar from './../utility/ProgressBar.js';

import { MdFileDownload, MdEdit, MdAdd } from 'react-icons/md';
import { IoTrashSharp, IoCaretBackOutline } from 'react-icons/io5';
import { RiErrorWarningFill } from 'react-icons/ri';

let URLBuilder = require('url-join');


export function renderNoFiles() {
    return (
        <div id="files_dashboard_no_files_box">
            <p id="files_dashboard_no_files_box_title">
                No Files
            </p>
        </div>
    );
}

/****
 * The UI is rendered using a field "filesToDisplay".
 * filesToDisplay is re-set every time we call renderFiles().
 * renderFiles() takes in a map of [propertyID -> []Files]
 * renderFiles() will automatically recreate the ui state and update the UI. 
 * All edits to the state should be done by editing this.state.propertyToFilesMap 
 * and passing it in to renderFiles(). 
 */

const folders = "folders";
const files = "files";

const All = "All";

class FilesDashboard extends React.Component {
        
    constructor(props) {
        super(props);

        let redirect;
        let user;
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            user = JSON.parse(loggedInUser);
            redirect = null;
        } else {
            user = null;
            redirect = "/";
        }

        this.state = {
            user: user,
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
            isLoading: true,
            pageToDisplay: folders,
            activeFolderPropertyID: null,
            redirect: redirect,
        };

        this.setActiveFileAttributes = this.setActiveFileAttributes.bind(this);
        this.downloadActiveFiles = this.downloadActiveFiles.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        this.deleteActiveFiles = this.deleteActiveFiles.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.handleSearchBar = this.handleSearchBar.bind(this);
        this.closeUploadFileModal = this.closeUploadFileModal.bind(this);
        this.renderFolders = this.renderFolders.bind(this);
        this.setActiveFolder = this.setActiveFolder.bind(this);
        this.renderActiveFolderFiles = this.renderActiveFolderFiles.bind(this);
        this.setRecentlyUploadedFile = this.setRecentlyUploadedFile.bind(this);
        this.getFileStorageUsage = this.getFileStorageUsage.bind(this);
    }

    componentDidMount() {

        let userID = this.state.user["id"];
                
        // Load our properties list.
        let getPropertiesURL = URLBuilder("api/user/property", userID);
        let getFilesSummaryURL = URLBuilder("api/user/files/summary", userID);

        const getPropertiesRequest = axios.get(getPropertiesURL);
        const getFilesSummaryRequest = axios.get(getFilesSummaryURL);

        axios.all(
            [getPropertiesRequest, getFilesSummaryRequest]
        ).then(axios.spread((...responses) => {
            const propertiesRequestReponse = responses[0];
            let propertiesList = propertiesRequestReponse.data;
            // sort them according to last_modified_at.
            let propertiesMap = new Map();
            for (let i = 0; i < propertiesList.length; i++) {
                let property = propertiesList[i];
                let propertyID = property["id"];
                let propertyAddress = property["address_one"] + (property["address_two"] ? " " + property["address_two"] : "");
                propertiesMap.set(propertyID, propertyAddress);
            }

            const filesSummaryRequestResponse = responses[1];
            let filesSummary = filesSummaryRequestResponse.data;

            console.log(filesSummary);

            this.setState({
                propertiesMap: propertiesMap,
                filesSummary: filesSummary,
                isLoading: false
            });
        })).catch(error => {
            console.log(error);
            this.setState({
                isLoading: false
            })
        });
    }

    closeUploadFileModal() {
        this.setState({
            displayUploadFileBox: false
        })
    }
    
    downloadFile(value, key, map) {

        console.log(value);
        let file = value;
        let fileSignedURL = file["get_signed_url"];

        if (!fileSignedURL) {
            // TODO: create an alert that says unable to download file.
            return;
        }

        // Add this suffix to force it to download instead of opening in a new Tab.
        fileSignedURL = fileSignedURL + "&response-content-disposition=attachment";

        // const url = window.URL.createObjectURL(new Blob([file["get_signed_url"]]));
        const link = document.createElement('a');
        link.href = fileSignedURL;
        // const contentDisposition = response.headers['content-disposition'];
        let fileName = file["name"];
        // if (contentDisposition) {
        //     const fileNameMatch = contentDisposition.match(/filename='(.+)'/);
        //     if (fileNameMatch.length === 2)
        //         fileName = fileNameMatch[1];
        // }
        link.setAttribute('download', fileName); //or any other extension
        document.body.appendChild(link);
        link.click();

        // console.log(key);
        // let userID = this.state.user["id"];
        // let downloadFileURL = URLBuilder("api/user/files", userID, key);
        // axios({
        //     method: 'get',
        //     url: downloadFileURL,
        //     params: {
        //         request: "download"
        //     },
        //     responseType: 'blob'
        // }).then(response => {
        //     // Downloads the file
        //     // Credit: https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
        //     let file = response.data;
        //     const url = window.URL.createObjectURL(new Blob([file["get_signed_url"]]));
        //     const link = document.createElement('a');
        //     link.href = url;
        //     const contentDisposition = response.headers['content-disposition'];
        //     let fileName = 'unknown';
        //     if (contentDisposition) {
        //         const fileNameMatch = contentDisposition.match(/filename='(.+)'/);
        //         if (fileNameMatch.length === 2)
        //             fileName = fileNameMatch[1];
        //     }
        //     link.setAttribute('download', fileName); //or any other extension
        //     document.body.appendChild(link);
        //     link.click();
        // }).catch(error => console.log(error));
    }

    downloadActiveFiles() {
        this.state.activeFiles.forEach(this.downloadFile);
    }

    async deleteFile(fileID) {
        let userID = this.state.user["id"];
        let deleteFileURL = URLBuilder("api/user/files", userID, fileID)
        let success = false;
        await axios({
            method: 'delete',
            url: deleteFileURL,
        }).then(response => {
            if (response.status === 200) {
                success = true;
                return success;
            }
        }).catch(error => console.log(error));
        return success;
    }

    async deleteActiveFiles() {

        let activeFolderFilesMap = this.state.activeFolderFilesMap;
        let activeFiles = this.state.activeFiles;
        let activeFilesIterator = activeFiles.entries();

        let activeFilesNextElem = activeFilesIterator.next();
        while (activeFilesNextElem !== null && activeFilesNextElem.value !== undefined) {

            let fileID = activeFilesNextElem.value[0];
            let success = await this.deleteFile(fileID);
            if (success) {
                if (activeFolderFilesMap.has(fileID)){
                    activeFolderFilesMap.delete(fileID);
                }
                activeFiles.delete(fileID);
            }
            activeFilesNextElem = activeFilesIterator.next();
        }

        this.setState({
            activeFiles: activeFiles,
            activeFolderFilesMap: activeFolderFilesMap,
        })
        // let currFiles = this.state.files;
        // let activeFiles = this.state.activeFiles;
        // let activeFilesIterator = activeFiles.entries();
        // let currPropertyToFilesMap = new Map([...this.state.propertyToFilesMap]);

        // let nextElem = activeFilesIterator.next();
        // while (nextElem !== null && nextElem.value !== undefined) {
        //     let key = nextElem.value[0];
        //     console.log(key);
        //     let success = await this.deleteFile(key);
        //     if (success === true) {
        //         activeFiles.delete(key);
        //         let propertyID = nextElem.value[1]["property_id"];
        //         let arrAtPropertyID = currPropertyToFilesMap.get(propertyID);
                
        //         let arrAtPropertyIDLength = arrAtPropertyID.length;
        //         for (let i = 0; i < arrAtPropertyIDLength; i++) {
        //             let fKey = arrAtPropertyID[i]["property_id"] + "/" + arrAtPropertyID[i]["name"]
        //             if (key === fKey) {
        //                 arrAtPropertyID.splice(i, 1);
        //                 currPropertyToFilesMap.set(propertyID, arrAtPropertyID);
        //                 break;
        //             }
        //         }

        //         for (let i = 0; i < currFiles.length; i++) {
        //             // When we filter by properties, we inject <div> elements which do not have a state.
        //             // Add this check to filter them out. 
        //             let file = currFiles[i];
        //             let fKey = file["property_id"] + "/" + file["name"];
        //             if (key === fKey) {
        //                 currFiles.splice(i, 1);
        //                 continue;
        //             }
        //         }
        //     }
        //     nextElem = activeFilesIterator.next();
        // }
        // this.renderFiles(currPropertyToFilesMap);

        // this.setState({
        //     files: currFiles,
        //     activeFiles: activeFiles,
        //     propertyToFilesMap: currPropertyToFilesMap
        // });
    }

    setRecentlyUploadedFile(file, associatedProperties) {
        let activeFolderPropertyID = this.state.activeFolderPropertyID;
        let activeFolderFilesMap = this.state.activeFolderFilesMap;

        let isAssociatedProperty = false;
        for (let i = 0; i < associatedProperties.length; i++) {
            let associatedPropertyID = associatedProperties[i];
            if (associatedPropertyID === activeFolderPropertyID) {
                isAssociatedProperty = true;
                break;
            }
        }

        let newActiveFolderFilesMap;
        if (isAssociatedProperty) {
            newActiveFolderFilesMap = new Map();
            newActiveFolderFilesMap.set(file["id"], file);

            activeFolderFilesMap.forEach((value, key, map) => {
                newActiveFolderFilesMap.set(key, value);
            })
        } else {
            newActiveFolderFilesMap = activeFolderFilesMap;
        }

        this.setState({
            activeFolderFilesMap: newActiveFolderFilesMap,
        })
    }

    handleSearchBar(e) {
        let searchValue = e.target.value.toLowerCase().replace(/\s/g, "");

        this.setState({
            activeSearchFiles: this.state.filesToDisplay.filter(file => {
                return (file.props && file.props.data) ? file.props.data.state.file["name"].toLowerCase().replace(/\s/g, "").startsWith(searchValue) : file;
            })
        })
    }

    renderActiveSearchFiles() {
        return this.state.activeSearchFiles.length > 0 ? this.state.activeSearchFiles : renderNoFiles();
    }

    setActiveFileAttributes(fileID, file, toRemove) {

        let currentActiveFiles = this.state.activeFiles;
        if (currentActiveFiles === null || currentActiveFiles === undefined) {
            currentActiveFiles = new Map();
        }
        if (currentActiveFiles.size >= 15 && !toRemove) {
            return false
        }
        if (!toRemove) {
            currentActiveFiles.set(fileID, file);
        } else {
            // Remove from active ("unclicked")
            currentActiveFiles.delete(fileID);
        }
        this.setState({
            activeFiles: currentActiveFiles
        })
        return true;
    }

    setActiveFolder(folderPropertyID, folderName) {

        this.setState({
            activeFolderPropertyID: folderPropertyID,
            activeFolderName: folderName,
            // activeFolderFilesMap: activeFolderFilesMap,
            redirectToFolderPage: URLBuilder("files", folderPropertyID)
        });

    }

    renderActiveFolderFiles() {

        let activeFolderFilesMap = this.state.activeFolderFilesMap;
        let activeFolderFilesIterator = activeFolderFilesMap.entries();
        let fileElements = [];

        let activeFolderFileNextElem = activeFolderFilesIterator.next();
        while (activeFolderFileNextElem !== null && activeFolderFileNextElem !== undefined && activeFolderFileNextElem.value !== undefined){
            // activeFolderFileNextElem: [0] is fileID, [1] is file.
            let activeFolderFile = activeFolderFileNextElem.value[1];
            fileElements.push(
                <FileCard
                    key={activeFolderFile["id"]}
                    data={{
                        state: {
                            user: this.state.user,
                            file: activeFolderFile,
                            backgroundColor: "white",
                            setActiveFileAttributes: this.setActiveFileAttributes,
                            openSignedURL: openSignedURL,
                        }
                    }}
                >

                </FileCard>
            );
            activeFolderFileNextElem = activeFolderFilesIterator.next();
        }
        if (fileElements.length === 0){
            fileElements.push(
                renderNoFiles()
            );
        }

        
        return (
            <div>
                <div 
                    onMouseDown={() => {
                        this.setState({
                            activeFiles: new Map(),
                            pageToDisplay: folders,
                        })
                    }}
                    className="files_dashboard_back_to_folders_button">
                    <IoCaretBackOutline className="files_dashboard_back_to_folders_button_icon"></IoCaretBackOutline>
                    <p className="files_dashboard_back_to_folders_button_text">Folders</p>
                </div>
                <p className="files_dashboard_folder_name_title">{this.state.activeFolderName}</p>
                <div className="clearfix"/>
                <div>
                    {fileElements}
                </div>
            </div>
        );
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
                        setActiveFolder: this.setActiveFolder,
                    }
                }}
                ></FolderCard>
            )
        })
        return (
            <div>
                {folders}
            </div>
        );
    }

    getFileStorageUsage() {
        let filesSummary = this.state.filesSummary;
        if (!filesSummary || filesSummary === undefined) {
            return (
                <div></div>
            );
        }
        let filesTotalSize = filesSummary["files_total_size"];

        let user = this.state.user;

        let plan = user["plan"];
        let maximumSizeBytes;
        let maximumSize;

        switch (plan) {
            case "starter":
                maximumSizeBytes = 3221225472;
                maximumSize = "3 GB";
            case "professional":
                maximumSizeBytes = 53687091200;
                maximumSize = "50 GB";
            case "enterprise":
                maximumSizeBytes = 322122547200;
                maximumSize = "300 GB";
        }

        maximumSizeBytes = filesTotalSize >= 322122547200 ? bytesToSize(filesTotalSize) : maximumSize;
        maximumSize = filesTotalSize >= 322122547200 ? bytesToSize(filesTotalSize) : maximumSize;

        let width = filesTotalSize / maximumSizeBytes * 100.0;

        return (
            <div>
                
                {/* TODO:  TOOLTIP: "need more storage? upgrade" */}
                <div style={{
                    backgroundColor: "#E9EDF6",
                    borderRadius: "50px",
                    float: "right",
                    height: "10px",
                    width: "175px",
                }}>
                    <div style={{
                        backgroundColor: "#296cf6",
                        borderRadius: width === 100 ? "50px" : "50px 0px 0px 50px",
                        float: "left",
                        height: "10px",
                        width: width + "%",
                    }}>
                    </div>
                </div>
                <div className="clearfix"/>
                <p style={{
                    float: "right",
                    marginTop: "7.5px",
                }}>
                    {bytesToSize(filesTotalSize)} used of {maximumSize}
                </p>
            </div>
        )
    }

    render() {
        if (this.state.redirectToFolderPage) {
            return <Redirect to={{
                pathname: this.state.redirectToFolderPage,
                state: {
                    user: this.state.user,
                    folderPropertyID: this.state.activeFolderPropertyID,
                    folderName: this.state.activeFolderName,
                    propertiesMap: this.state.propertiesMap,
                    // Pass in the profilePicture so we don't have to load it again.
                    profilePicture: this.state.profilePicture
                }
            }} />
        }
        if (this.state.isLoading) {
            return (
                <div></div>
            );
        }
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
                                        user: this.state.user,
                                        propertiesMap: this.state.propertiesMap,
                                        closeUploadFileModal: this.closeUploadFileModal,
                                        setRecentlyUploadedFile: this.setRecentlyUploadedFile,
                                    }                       
                                }}/>
                        </div> :
                    <div></div>}
                    <div className="page-white-background">
                        <div style={{
                                float: "left",
                                paddingBottom: "10px",
                                paddingTop: "10px",
                                width: "100%",
                            }}>
                            <input id="files_dashboard_search_bar" className="search_bar" placeholder="Search..." onChange={this.handleSearchBar}/>
                            <p
                                style={{
                                    float: "left",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "1.1em",
                                    lineHeight: "40px",
                                    width: "200px",
                                }}>
                                FOLDERS
                            </p>
                            <div 
                                className="opacity"
                                onMouseDown={
                                    () => this.setState({
                                        displayUploadFileBox: true
                                })}                                
                                style={{
                                    cursor: "pointer",
                                    float: "right",
                                    marginRight: "25px",
                                }}>
                                <MdAdd style={{
                                    backgroundColor: "#f5f5fa",
                                    borderRadius: "50%",
                                    color: "#296cf6",
                                    float: "left",
                                    height: "20px",
                                    padding: "10px",
                                    width: "20px",
                                }}/>
                                <p
                                    style={{
                                        color: "#296cf6",
                                        float: "left",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: "bold",
                                        lineHeight: "40px",
                                        marginLeft: "10px",
                                        textDecoration: "none",
                                        userSelect: "none",
                                    }}>
                                    New
                                </p>
                            </div>
                        </div>
                        <div className="clearfix"/>
                        <div className="page-title-bar-divider"/>
                        <div style={{
                            margin: "20px 40px 0px 40px",
                            width: "calc(100% - 80px)",
                        }}>
                            <div style={{
                                float: "left",
                                width: "100%",
                            }}>
                                <div style={{
                                    backgroundColor: "#32384D",
                                    borderRadius: "6px",
                                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                                    float: "left",
                                    marginRight: "15px",
                                    padding: "7.5px 15px 7.5px 15px",
                                    userSelect: "none",
                                }}>
                                    <p style={{
                                        color: "white",
                                        display: "inline-block",
                                        fontSize: "0.9em",
                                        fontWeight: "bold",
                                    }}>
                                        {this.state.filesSummary["total_files"]}
                                    </p>
                                    <p style={{
                                        color: "white",
                                        display: "inline-block",
                                        fontWeight: "bold",
                                        fontSize: "0.9em",
                                        marginLeft: "5px",
                                    }}>
                                        Files
                                    </p>
                                </div>
                                <div style={{ 
                                    float: "right",
                                }}>
                                    <p style={{
                                        fontSize: "0.9em",
                                    }}>
                                        {this.getFileStorageUsage()}
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                float: "left",
                                marginTop: "20px",
                                width: "100%",
                            }}>
                                {
                                    this.state.pageToDisplay === folders ?
                                    (this.state.isLoading ? 
                                        <div></div> : 
                                        <div>
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
                            </div>
                        </div>
                    </div>
                    <div className="clearfix"/>
                    {this.state.isLoading ? <div></div> : 
                    <div>
                        <div id="files_dashboard_icons_box">
                            {/* <div
                                className="page_button" 
                                onMouseDown={() => this.setState({
                                    displayUploadFileBox: true
                                    })}>Add File</div> */}
                            {this.state.activeFiles.size >= 1 ?
                                <IoTrashSharp className="files_dashboard_icons" onMouseDown={() => this.deleteActiveFiles()}></IoTrashSharp> : 
                                <div></div>}
                            {this.state.activeFiles.size >= 1 ? 
                                <MdFileDownload className="files_dashboard_icons" onMouseDown={() => this.downloadActiveFiles()}></MdFileDownload> : 
                                <div></div>
                            }
                            {this.state.activeFiles.size === 1 ? 
                                <MdEdit className="files_dashboard_icons"></MdEdit> : 
                                <div></div>
                            }
                        </div>                        
                        <div className="clearfix"/>
                        
                    </div>}
                    <NotificationSidebar data={{
                        state: {
                            user: this.state.user,
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