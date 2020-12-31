import React from 'react';

import './CSS/FileCard.css';
import './CSS/Style.css';

class FileCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            file: this.props.data.state.file,
            setActiveFileAttributes: this.props.data.state.setActiveFileAttributes,
            openSignedURL: this.props.data.state.openSignedURL,
            mapFileTypeToIcon: this.props.data.state.mapFileTypeToIcon,
            timeClicked: null,
            isClicked: false
        };

        this.trimTrailingFileName = this.trimTrailingFileName.bind(this);
        this.clickCard = this.clickCard.bind(this);
        this.doubleClickCard = this.doubleClickCard.bind(this);
    }

    trimTrailingFileName(fileName) {
        if (fileName.length > 18) {
            return fileName.substring(0,18) + "...";
        }
        return fileName;
    }

    clickCard() {

        var now = Date.now();
        var key = this.state.file["property_id"] + '/' + this.state.file["name"];

        if (this.state.timeClicked === null || (now - this.state.timeClicked) > 200) { 
            // Let parent know this file was clicked
            if (this.state.setActiveFileAttributes(key, this.state.file, this.state.isClicked)) {
                this.setState({
                    isClicked: !this.state.isClicked,
                    timeClicked: Date.now()
                });
            }
        } else {
            this.state.openSignedURL(key)
            if (this.state.setActiveFileAttributes(key, this.state.file, false)) {
                this.setState({
                    isClicked: false,
                    timeClicked: Date.now()
                })
            }
        }
    }

    doubleClickCard() {
        if (this.state.isClicked) {
            return;
        }
        var key = this.state.file["property_id"] + '/' + this.state.file["name"];
        this.state.openSignedURL(key)
    }  

    componentDidMount() {
        this.clickTimeout = null;
    }

    render() {
        return (
            <div className={
                            this.state.isClicked ? 
                            "file_card_individual_file file_card_active" : 
                            "file_card_individual_file"
                            } 
                // onDoubleClick={() => this.doubleClickCard()}
                onMouseDown={() => this.clickCard()}
                >
                {this.state.mapFileTypeToIcon(this.state.file["metadata"]["file_type"], true)}
                <div className="file_card_individual_file_footer">
                    <p className="file_card_individual_file_footer_title" title={this.state.file["name"] ? this.state.file["name"] : "Unknown File"}>
                        {this.state.file["name"] ? this.trimTrailingFileName(this.state.file["name"]) : "Unknown File"}
                    </p>
                </div>
            </div>
        )
    }
}

export default FileCard;