import React from 'react';

import './CSS/ExpenseCard.css';
import './CSS/Style.css';

import { capitalizeName } from './MainDashboard.js';

import { MdEdit } from 'react-icons/md';
import { IoTrashSharp } from 'react-icons/io5';

class ExpenseCard extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            expense: this.props.data.state.expense,
            properties: this.props.data.state.properties,
            expandCard: false,
            deleteExpense: this.props.data.state.deleteExpense,
        };

        this.convertDate = this.convertDate.bind(this);
    }

    componentDidMount() {
        console.log(this.state.expense);
        console.log(this.state.properties);
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
            <div>
                <div className="expenses_table_subtitle_row">
                    <div className="expenses_table_first_row_long">
                        <p className="expenses_table_first_row_subtitle">
                            {capitalizeName(this.state.expense["title"])}
                        </p>
                    </div>
                    <div className="expenses_table_first_row_long">
                        <p className="expenses_table_first_row_subtitle">
                            {this.state.properties ? this.state.properties : "None"}
                        </p>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <p className="expenses_table_first_row_subtitle">
                            {capitalizeName(this.state.expense["frequency"])}
                        </p>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <p className="expenses_table_first_row_subtitle">
                            {this.convertDate(this.state.expense["date"])}
                        </p>
                    </div>
                    <div className="expenses_table_first_row_short">
                        <p className="expenses_table_first_row_subtitle">
                            ${this.state.expense["amount"]}
                        </p>
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