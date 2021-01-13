import React from 'react';

import './CSS/ExpenseCard.css';
import './CSS/Style.css';

import { capitalizeName, numberWithCommas } from './MainDashboard.js';

import { MdEdit } from 'react-icons/md';
import { IoTrashSharp } from 'react-icons/io5';
import { FaCaretDown } from 'react-icons/fa';

class ExpenseCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            expense: this.props.data.state.expense,
            properties: this.props.data.state.properties,
            expandCard: false,
            deleteExpense: this.props.data.state.deleteExpense,
            displayExpandedView: false,
        };

        this.convertDate = this.convertDate.bind(this);
    }

    componentDidMount() {
        this.clickTimeout = null;
    }

    convertDate(date) {

        date = date.split("T")[0];

        var split = date.split("-");

        var date = split[2];
        var month = split[1];
        var year = split[0];

        return month + "/" + date + "/" + year;
    }

    render() {
        return (
            <div key={this.state.expense["id"]}>
                <div className="expenses_table_subtitle_row">
                    <div className="expenses_table_down_icon_box">
                        <FaCaretDown 
                            onClick={() => this.setState({
                                displayExpandedView: !this.state.displayExpandedView,
                            })}
                            className={this.state.displayExpandedView ? "expenses_table_down_icon toggled_icon" : "expenses_table_down_icon"}></FaCaretDown>
                    </div>
                    <div className="expenses_table_first_row_long">
                        <div className="expenses_table_first_row_subtitle">
                            {capitalizeName(this.state.expense["title"])}
                        </div>
                    </div>
                    <div className="expenses_table_first_row_long">
                        <div className="expenses_table_first_row_subtitle">
                            {this.state.properties ? this.state.properties : "None"}
                        </div>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <div className="expenses_table_first_row_subtitle">
                            {capitalizeName(this.state.expense["frequency"])}
                        </div>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <div className="expenses_table_first_row_subtitle">
                            {this.convertDate(this.state.expense["date"])}
                        </div>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <div className="expenses_table_first_row_subtitle">
                            ${numberWithCommas(this.state.expense["amount"])}
                        </div>
                    </div>
                    <IoTrashSharp 
                        onClick={() => this.state.deleteExpense}
                        className="expenses_table_first_row_subtitle_icon"></IoTrashSharp>
                    <MdEdit className="expenses_table_first_row_subtitle_icon"></MdEdit>
                </div>
                <div className="clearfix"/>
                {this.state.displayExpandedView ? 
                    <div className="expenses_card_expanded_view">
                        <div className="expenses_card_expanded_view_text">
                            {this.state.expense["description"]}
                        </div>
                    </div> : 
                    <div></div>}
                <div className="expenses_table_title_row_subdivider">
                </div>
            </div>
        );
    }
}

export default ExpenseCard;