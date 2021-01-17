import React from 'react';

import './CSS/ExpenseCard.css';
import './CSS/Style.css';

import { capitalizeName, numberWithCommas } from './MainDashboard.js';
import { convertDate } from './ExpensesDashboard.js';

import { MdEdit } from 'react-icons/md';
import { IoTrashSharp, IoReturnDownForwardSharp, IoAttachSharp } from 'react-icons/io5';
import { FaCaretDown } from 'react-icons/fa';
import { VscExpandAll } from 'react-icons/vsc';

class ExpenseCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            expense: this.props.data.state.expense,
            properties: this.props.data.state.properties,
            expandCard: false,
            deleteExpense: this.props.data.state.deleteExpense,
            displayExpandedView: false,
            setActiveExpandedExpenseCard: this.props.data.state.setActiveExpandedExpenseCard,
        };
    }

    componentDidMount() {
        this.clickTimeout = null;
    }

    render() {
        return (
            <div key={this.state.expense["id"]}>
                <div className="expenses_table_subtitle_row">
                    <div className="expenses_table_down_icon_box">
                        <VscExpandAll 
                            onClick={() => {
                                this.state.setActiveExpandedExpenseCard(this.state.expense);
                            }}
                            className={this.state.displayExpandedView ? "expenses_table_down_icon toggled_icon" : "expenses_table_down_icon"}></VscExpandAll>
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
                            {convertDate(this.state.expense["date"])}
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
                
                <div className="expenses_table_title_row_subdivider">
                </div>
            </div>
        );
    }
}

export default ExpenseCard;