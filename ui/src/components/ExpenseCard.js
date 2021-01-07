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
            expandCard: false,
            deleteExpense: this.props.data.state.deleteExpense,
        };

        this.convertDate = this.convertDate.bind(this);
    }

    componentDidMount() {
        console.log(this.state.expense);
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
                <div 
                    onClick={() => this.setState({
                        expandCard: !this.state.expandCard,
                    })}
                    className={
                        this.state.expandCard? "expense_card_parent_box expense_card_parent_box_expanded":
                        "expense_card_parent_box"}>
                    <p className="expense_card_parent_box_title">
                        {this.state.expense["title"]}
                    </p>
                    <p className="expense_card_parent_box_price_title">
                        ${this.state.expense["amount"]}
                    </p>
                </div>
                {this.state.expandCard ? 
                <div>
                    <div className="expense_card_expanded_box">
                        <div className="expense_card_expanded_box_title_box">
                            <p className="expense_card_expanded_box_title_box_date">
                                {this.convertDate(this.state.expense["date"])}
                            </p>
                            <IoTrashSharp 
                                onClick={() => {
                                    this.state.deleteExpense(this.state.expense["id"], this.state.expense["properties"])
                                }}
                                className="expense_card_expanded_box_title_box_icon"></IoTrashSharp>
                            <MdEdit id="expense_card_expanded_box_title_box_leftmost_icon" className="expense_card_expanded_box_title_box_icon"></MdEdit>
                        </div>
                        <div className="clearfix"/>
                        <div className="expense_card_expanded_box_bottom_box">
                            <div className="expense_card_expanded_box_bottom_box_left_box">
                                <p className="expense_card_expanded_box_bottom_box_left_box_text">
                                    {this.state.expense["description"]}
                                </p>
                            </div>
                            <div className="expense_card_expanded_box_bottom_box_right_box">
                                <div className="expense_card_expanded_box_bottom_box_right_box_inner_box">
                                    <p className="expense_card_expanded_box_bottom_box_right_box_text_description">
                                        Frequency: 
                                    </p>
                                    <p className="expense_card_expanded_box_bottom_box_right_box_text_actual">
                                        {capitalizeName(this.state.expense["frequency"])}
                                    </p>
                                </div>
                                <div className="clearfix"/>
                                <div className="expense_card_expanded_box_bottom_box_right_box_inner_box">
                                    <p className="expense_card_expanded_box_bottom_box_right_box_text_description">
                                        Created: 
                                    </p>
                                    <p className="expense_card_expanded_box_bottom_box_right_box_text_actual">
                                        {this.convertDate(this.state.expense["created_at"])}
                                    </p>
                                </div>
                                <div className="clearfix"/>
                                <div className="expense_card_expanded_box_bottom_box_right_box_inner_box">
                                    <p className="expense_card_expanded_box_bottom_box_right_box_text_description">
                                        Last Modified: 
                                    </p>
                                    <p className="expense_card_expanded_box_bottom_box_right_box_text_actual">
                                        {this.convertDate(this.state.expense["last_modified_at"])}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="clearfix"/>
                </div> :
                <div></div>}
            </div>
        );
    }
}

export default ExpenseCard;