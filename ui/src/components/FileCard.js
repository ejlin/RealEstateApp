import React from 'react';

import './CSS/FileCard.css';
import './CSS/Style.css';

import { trimTrailingName, mapFileTypeToIcon, bytesToSize, capitalizeName } from '../utility/Util.js';

const metadata = "metadata";

class FileCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            file: this.props.data.state.file,
            backgroundColor: this.props.data.state.backgroundColor,
            setActiveFileAttributes: this.props.data.state.setActiveFileAttributes,
            openSignedURL: this.props.data.state.openSignedURL,
            timeClicked: null,
            isClicked: false
        };
        this.clickCard = this.clickCard.bind(this);
    }

    clickCard() {
        let now = Date.now();
        let file = this.state.file;
        if (this.state.timeClicked === null || (now - this.state.timeClicked) > 200) { 
            // Let parent know this file was clicked
            let success = this.state.setActiveFileAttributes(file["id"], this.state.file, this.state.isClicked);
            if (success) {
                this.setState({
                    isClicked: !this.state.isClicked,
                    timeClicked: Date.now()
                });
            }
        } else {
            this.state.openSignedURL(this.state.file["get_signed_url"]);
            if (this.state.setActiveFileAttributes(file["id"], this.state.file, false)) {
                this.setState({
                    isClicked: true,
                    timeClicked: Date.now()
                })
            }
        }
    }

    render() {

        let file = this.state.file;
        console.log(file);
        let className = "file_card_individual_file";
        if (this.state.isClicked) {
            className += " file_card_active";
        } else {
            className += " " + this.state.backgroundColor;
        }

        let fileType = "";
        let fileSize = "";

        if (file[metadata]){
            if (file[metadata]["type"]) {
                fileType = file[metadata]["type"];
            }
            if (file[metadata]["size_bytes"]) {
                fileSize = file[metadata]["size_bytes"];
            }
        }
        return (
            <div className={className} 
                // onDoubleClick={() => this.doubleClickCard()}
                onMouseDown={() => this.clickCard()}
                >
                {mapFileTypeToIcon(fileType, this.state.isClicked, "file_card_file_type_icon")}
                {/* <p className={
                    this.state.isClicked ?
                    "file_card_individual_file_footer_title file_card_individual_file_footer_title_active":
                    "file_card_individual_file_footer_title"}
                    title={this.state.file["name"] ? this.state.file["name"] : "Unknown File"}>
                    {this.state.file["name"] ? trimTrailingName(this.state.file["name"], 20) : "Unknown File"}
                </p> */}
                <div className="clearfix"/>
                <p className={
                    this.state.isClicked ?
                    "file_card_individual_file_footer_title file_card_individual_file_footer_title_active":
                    "file_card_individual_file_footer_title"}
                    title={this.state.file["name"] ? this.state.file["name"] : "Unknown File"}>
                    {this.state.file["name"] ? trimTrailingName(this.state.file["name"], 20) : "Unknown File"}
                </p>
                <div className="file_card_file_type_box">
                    <p>
                        {file["type"] ? capitalizeName(file["type"]) : "Other"} &middot; {file["year"]} &middot; {bytesToSize(fileSize)}
                    </p>
                </div>
                {/* <p className="file_card_file_year_size_text">
                   {bytesToSize(fileSize)}
                </p> */}
            </div>
        )
    }
}

export default FileCard;