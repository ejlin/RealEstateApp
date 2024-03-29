import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import './CSS/FolderPage.css';
import './CSS/Style.css';

import Loader from './Loader.js';

import DashboardSidebar from './DashboardSidebar.js';
import NotificationSidebar from './NotificationSidebar.js';
import FileCard from './FileCard.js';
import UploadFileModal from './UploadFileModal.js';
import FolderCard from './FolderCard.js';

import { trimTrailingName, mapFileTypeToIcon, openSignedURL } from '../utility/Util.js';

import ProgressBar from './../utility/ProgressBar.js';

import { MdFileDownload, MdEdit, MdAdd, MdKeyboardBackspace } from 'react-icons/md';
import { IoTrashSharp, IoCaretBackOutline, IoArrowBackCircle, IoArrowBackCircleSharp } from 'react-icons/io5';
import { RiErrorWarningFill } from 'react-icons/ri';

let URLBuilder = require('url-join');

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

class FolderPage extends React.Component {
        
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.location.state.user,
            folderPropertyID: this.props.location.state.folderPropertyID,
            folderName: this.props.location.state.folderName,
            totalEstimateWorth: this.props.location.state.totalEstimateWorth,
            missingEstimate: this.props.location.state.missingEstimate,
            propertiesMap: this.props.location.state.propertiesMap,
            profilePicture: this.props.location.state.profilePicture,
            host: window.location.protocol + "//" + window.location.host,
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
        };

        this.setActiveFileAttributes = this.setActiveFileAttributes.bind(this);
        this.downloadActiveFiles = this.downloadActiveFiles.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        this.deleteActiveFiles = this.deleteActiveFiles.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.handleSearchBar = this.handleSearchBar.bind(this);
        this.closeUploadFileModal = this.closeUploadFileModal.bind(this);
        this.renderActiveFolderFiles = this.renderActiveFolderFiles.bind(this);
        this.setRecentlyUploadedFile = this.setRecentlyUploadedFile.bind(this);
        this.renderFileElements = this.renderFileElements.bind(this);
        this.renderNoFiles = this.renderNoFiles.bind(this);
    }

    componentDidMount() {

        let host = this.state.host;

        let userID = this.state.user["id"];
        let folderPropertyID = this.state.folderPropertyID;
        
        let getFilesByPropertyURL;

        // If we are in our All folder, list all our files.
        if (folderPropertyID === All) {
            getFilesByPropertyURL = URLBuilder(host, "api/user/files", userID)
        } else {
            getFilesByPropertyURL = URLBuilder(host, "api/user/files/property", userID, folderPropertyID)
        }

        axios({
            method: 'get',
            url: getFilesByPropertyURL
        }).then(response => {
            // Downloads the file
            // Credit: https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
            let activeFolderFilesMap = new Map();
            let activeFolderFiles = response.data;
            
            if (activeFolderFiles !== undefined && activeFolderFiles && activeFolderFiles.length > 0) {
                activeFolderFiles = activeFolderFiles.sort(function(a, b){
                    if (a["last_modified_at"] < b["last_modified_at"]) {
                        return 1;
                    } else if (a["last_modified_at"] > b["last_modified_at"]) {
                        return -1;
                    }
                    return 0;
                });

                for (let i = 0; i < activeFolderFiles.length; i++) {
                    let activeFolderFile = activeFolderFiles[i];
                    let fileID = activeFolderFile["id"];
                    activeFolderFilesMap.set(fileID, activeFolderFile);
                }
            }
            this.setState({
                activeFolderFilesMap: activeFolderFilesMap,
                pageToDisplay: files,
                isLoading: false,
            })
        }).catch(error => console.log(error));
    }

    renderNoFiles() {
        return (
            <div style={{
                borderRadius: "8px",
                float: "left",
                marginTop: "150px",
                textAlign: "center",
                width: "100%",
            }}>
                <p style={{
                    color: "black",
                    fontSize: "1.0em",
                    fontWeight: "bold",
                }}>
                    No Files
                </p>
                <div 
                    onMouseDown={() => {
                        this.setState({
                            displayUploadFileBox: true,
                        })
                    }}
                    className="opacity"
                    style={{
                        backgroundColor: "#296cf6",
                        borderRadius: "50px",
                        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.10), 0 6px 10px 0 rgba(0, 0, 0, 0.09)",
                        cursor: "pointer",
                        display: "inline-block",
                        marginTop: "15px",
                        padding: "5px 15px 5px 15px",
                    }}>
                    <p style={{
                        color: "white",
                        fontFamily: "'Poppins', sans-serif",
                    }}>
                        Add a File to Start
                    </p>
                </div>
            </div>
        );
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
        let host = this.state.host;
        let userID = this.state.user["id"];
        let deleteFileURL = URLBuilder(host, "api/user/files", userID, fileID)
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

        this.setState({
            isDeleting: true,
        })

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
            isDeleting: false,
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

        let activeFolderPropertyID = this.state.folderPropertyID;
        let activeFolderFilesMap = this.state.activeFolderFilesMap;

        console.log(activeFolderPropertyID);
        console.log(associatedProperties);

        let isAssociatedProperty = false;
        for (let i = 0; i < associatedProperties.length; i++) {
            let associatedPropertyID = associatedProperties[i];
            if (associatedPropertyID === activeFolderPropertyID) {
                isAssociatedProperty = true;
                break;
            }
        }

        let newActiveFolderFilesMap;
        console.log(isAssociatedProperty);
        if (isAssociatedProperty) {
            newActiveFolderFilesMap = new Map();
            newActiveFolderFilesMap.set(file["id"], file);

            activeFolderFilesMap.forEach((value, key, map) => {
                newActiveFolderFilesMap.set(key, value);
            })
        } else {
            newActiveFolderFilesMap = activeFolderFilesMap;
        }

        console.log(newActiveFolderFilesMap);

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
        return this.state.activeSearchFiles.length > 0 ? this.state.activeSearchFiles : this.renderNoFiles();
    }

    renderFileElements(activeFolderFilesMap) {
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
                            file: activeFolderFile,
                            backgroundColor: "white",
                            setActiveFileAttributes: this.setActiveFileAttributes,
                            openSignedURL: openSignedURL,
                            isSmall: false,
                        }
                    }}
                />
            );
            activeFolderFileNextElem = activeFolderFilesIterator.next();
        }
        if (fileElements.length === 0){
            fileElements.push(
                this.renderNoFiles()
            );
        }
        return fileElements;
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
    
    renderActiveFolderFiles() {

        let fileElements = this.renderFileElements(this.state.activeFolderFilesMap);
        return (
            <div>
                <div style={{
                    float: "left",
                }}>
                    <MdKeyboardBackspace
                        onMouseDown={() => {
                            this.setState({
                                redirectToFoldersParent: "/files",
                            })
                        }}
                        style={{
                            borderRadius: "50px",
                            boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                            backgroundColor: "#32384D",
                            color: "white",
                            cursor: "pointer",
                            float: "left",
                            height: "25px",
                            marginTop: "5px",
                            padding: "5px",
                            width: "25px",
                        }}/>
                    <div style={{
                        backgroundColor: "#296cf6",
                        borderRadius: "50px",
                        boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09), 0 3px 10px 0 rgba(0, 0, 0, 0.09)",
                        float: "left",
                        marginLeft: "15px",
                        marginTop: "5px",
                        padding: "5px 25px 5px 25px",
                    }}>
                        <p style={{
                            color: "white",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "1.0em",
                            textAlign: "center",
                        }}>
                            {this.state.folderName}
                        </p>
                    </div>
                </div>
                <div style={{
                    float: "right",
                }}>
                    {this.state.activeFiles.size >= 1 ?
                        (this.state.isDeleting ? 
                        <div className="folder_page_delete_loader_box">
                            <Loader data={{
                                state: {
                                    class: "folder_page_delete_loader",
                                }
                            }}></Loader> 
                        </div>:
                        <IoTrashSharp className="files_dashboard_icons" onClick={() => this.deleteActiveFiles()}></IoTrashSharp>) : 
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
                <div>
                    {fileElements.length > 0 ? fileElements : <p>No Files</p>}
                </div>
            </div>
        );
    }

    render() {
        if (this.state.redirectToFoldersParent) {
            return <Redirect to={{
                pathname: this.state.redirectToFoldersParent,
                state: {
                    user: this.state.user,
                    folderPropertyID: this.state.activeFolderPropertyID,
                    folderName: this.state.activeFolderName,
                    // Pass in the profilePicture so we don't have to load it again.
                    profilePicture: this.state.profilePicture
                }
            }} />
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
                <div id="folder_page_parent_box">
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
                    <div style={{
                        height: "30px",
                        width: "100%",
                    }}>
                        <div className="page-white-background">
                            <div style={{
                                float: "left",
                                paddingBottom: "10px",
                                paddingTop: "10px",
                                width: "100%",
                            }}>
                                <input id="files_dashboard_search_bar" className="search_bar" placeholder="Search..." onChange={this.handleSearchBar}>
                                </input>
                                <p
                                    style={{
                                        float: "left",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "1.1em",
                                        lineHeight: "40px",
                                        width: "200px",
                                    }}>
                                    FILES
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
                                        // backgroundColor: "#f5f5fa",
                                        borderRadius: "50%",
                                        color: "#296cf6",
                                        float: "left",
                                        height: "20px",
                                        marginTop: "10px",
                                        // padding: "7.5px",
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
                                margin: "15px 40px 0px 40px",
                                width: "calc(100% - 80px)",
                            }}>
                                <div style={{
                                    marginTop: "10px",
                                    width: "100%",
                                }}>
                                    {/* {this.state.activeFiles.size >= 1 ?
                                        (this.state.isDeleting ? 
                                        <div className="folder_page_delete_loader_box">
                                            <Loader data={{
                                                state: {
                                                    class: "folder_page_delete_loader",
                                                }
                                            }}></Loader> 
                                        </div>:
                                        <IoTrashSharp className="files_dashboard_icons" onClick={() => this.deleteActiveFiles()}></IoTrashSharp>) : 
                                        <div></div>}
                                    {this.state.activeFiles.size >= 1 ? 
                                        <MdFileDownload className="files_dashboard_icons" onClick={() => this.downloadActiveFiles()}></MdFileDownload> : 
                                        <div></div>
                                    }
                                    {this.state.activeFiles.size === 1 ? 
                                        <MdEdit className="files_dashboard_icons"></MdEdit> : 
                                        <div></div>
                                    }
                                    <div className="clearfix"/>
                                */}
                                    {
                                        this.state.isLoading ? 
                                        <div></div> :
                                        <div>
                                            {this.renderActiveFolderFiles()}
                                        </div>
                                    } 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <NotificationSidebar data={{
                    state: {
                        user: this.state.user,
                        totalEstimateWorth: this.state.totalEstimateWorth,
                        missingEstimate: this.state.missingEstimate 
                    }
                }}/>
            </div>
        )
    }
}

export default FolderPage;