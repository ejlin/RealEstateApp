import React from 'react';

import './CSS/FolderCard.css';
import './CSS/Style.css';

import { GoFileDirectory } from 'react-icons/go';

class FolderCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.data.state.user,
            folderName: this.props.data.state.folderName,
            isClicked: false,
        };

        this.clickCard = this.clickCard.bind(this);
    }

    clickCard() {

        var now = Date.now();
        var key = this.state.file["property_id"] + '/' + this.state.file["name"];
        if (this.state.timeClicked === null || (now - this.state.timeClicked) > 200) { 
            // Let parent know this file was clicked
            var success = this.state.setActiveFileAttributes(key, this.state.file, this.state.isClicked);
            if (success) {
                this.setState({
                    isClicked: !this.state.isClicked,
                    timeClicked: Date.now()
                });
            }
        } else {
            console.log("yooooo")
            this.state.openSignedURL(this.state.user["id"], key);
            if (this.state.setActiveFileAttributes(key, this.state.file, false)) {
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
        return (
            <div
                onClick={() => {
                    this.setState({
                        isClicked: !this.state.isClicked,
                    })
                }} 
                className={this.state.isClicked ? "files_dashboard_folder_card clicked_folder_card" : "files_dashboard_folder_card"}>
                <GoFileDirectory className={this.state.isClicked ? "files_dashboard_folder_card_icon clicked_folder_card_icon" : "files_dashboard_folder_card_icon"}></GoFileDirectory>
                <p className={this.state.isClicked ? "files_dashboard_folder_card_text clicked_folder_card_text" : "files_dashboard_folder_card_text"}>
                    {this.state.folderName}
                </p>
            </div>
        )
    }
}

export default FolderCard;