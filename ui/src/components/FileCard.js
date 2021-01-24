import React from 'react';

import './CSS/FileCard.css';
import './CSS/Style.css';

import { trimTrailingName, mapFileTypeToIcon } from '../utility/Util.js';

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
            console.log("yooooo")
            this.state.openSignedURL(this.state.user["id"], file["id"]);
            if (this.state.setActiveFileAttributes(file["id"], this.state.file, false)) {
                this.setState({
                    isClicked: true,
                    timeClicked: Date.now()
                })
            }
        }
    }

    componentDidMount() {
        this.clickTimeout = null;
    }

    render() {

        let className = "file_card_individual_file";
        if (this.state.isClicked) {
            className += " file_card_active";
        } else {
            className += " " + this.state.backgroundColor;
        }

        let fileType;
        if (this.state.file["metadata"] && this.state.file["metadata"]["file_type"]) {
            fileType = this.state.file["metadata"]["file_type"];
        } else {
            fileType = "";
        }
        return (
            <div className={className} 
                // onDoubleClick={() => this.doubleClickCard()}
                onMouseDown={() => this.clickCard()}
                >
                {mapFileTypeToIcon(fileType, this.state.isClicked, "file_card_file_type_icon")}
                <div className="file_card_individual_file_footer">
                    <p className={
                        this.state.isClicked ?
                        "file_card_individual_file_footer_title file_card_individual_file_footer_title_active":
                        "file_card_individual_file_footer_title"}
                        title={this.state.file["name"] ? this.state.file["name"] : "Unknown File"}>
                        {this.state.file["name"] ? trimTrailingName(this.state.file["name"], 20) : "Unknown File"}
                    </p>
                </div>
            </div>
        )
    }
}

export default FileCard;