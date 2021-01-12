import React from 'react';
import axios from 'axios';

import './CSS/DropdownSelect.css';
import './CSS/Style.css';

import { IoTrashSharp } from 'react-icons/io5';

const All = "All";
const None = "None";

class DropdownSelect extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            currSelectedListElements: [],
            inputMap: this.props.data.state.inputMap,
            inputList: this.props.data.state.inputList,
            includeNone: this.props.data.state.includeNone,
            includeAll: this.props.data.state.includeAll,
            placeholderText: this.props.data.state.placeholderText,
            setParentList: this.props.data.state.setParentList,
            closePotentialList: this.props.data.state.closePotentialList,
        };
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.displayPotentialElements = this.displayPotentialElements.bind(this);
        this.removeSelectedElement = this.removeSelectedElement.bind(this);
        this.renderElements = this.renderElements.bind(this);
    }

    componentDidMount() {
    }

    handleFieldChange(e) {
        this.setState({ 
            [e.target.name]: e.target.value
         })
    }

    displayPotentialElements(e) {

        var selectedPropertyInput = document.getElementById("associated_properties_input");

        var elements = [];
        var value = e.target.value;
        var currSelectedListElements = this.state.currSelectedListElements;

        var allIndex = currSelectedListElements.indexOf(All);
        if (allIndex < 0){
            elements.push(
                <div 
                    onClick={() => {
                        var currSelectedListElements = this.state.currSelectedListElements;
                        currSelectedListElements.push(All);
                        // Remove None from our list if we add a non-None element.
                        let index = currSelectedListElements.indexOf(None);
                        if (index >= 0) {
                            currSelectedListElements.splice(index, 1);
                        }
                        // reset the search bar to empty.
                        selectedPropertyInput.value = "";
                        this.state.setParentList(currSelectedListElements);
                        this.setState({
                            currSelectedListElements: [...currSelectedListElements],
                            filteredListElements: null,
                        })
                    }} 
                    className="associated_properties_dropdown_elements">
                    {All}
                </div>
            );
        }
        
        var noneIndex = currSelectedListElements.indexOf(None);
        if (noneIndex < 0){
            elements.push(
                <div 
                    onClick={() => {
                        var currSelectedListElements = this.state.currSelectedListElements;
                        currSelectedListElements = [None];
                        // reset the search bar to empty.
                        selectedPropertyInput.value = "";
                        this.state.setParentList(currSelectedListElements);
                        this.setState({
                            currSelectedListElements: [...currSelectedListElements],
                            filteredListElements: null,
                        })
                    }} 
                    className="associated_properties_dropdown_elements">
                    {None}
                </div>
            );
        }

        var inputList = this.state.inputList;
        var filteredInputList = inputList.filter(address => address.startsWith(value));
        for (var i = 0; i < filteredInputList.length; i++) {
            let filteredInput = filteredInputList[i];
            if (filteredInput === None || filteredInput === All) {
                continue;
            }
            var index = currSelectedListElements.indexOf(filteredInput);
            // Only show properties that are not currently selected.
            if (index < 0){
                elements.push(
                    <div 
                        onClick={() => {
                            var currSelectedListElements = this.state.currSelectedListElements;
                            currSelectedListElements.push(filteredInput);
                            // Remove None from our list if we add a non-None element.
                            let index = currSelectedListElements.indexOf(None);
                            if (index >= 0) {
                                currSelectedListElements.splice(index, 1);
                                console.log(currSelectedListElements);
                            }
                            // reset the search bar to empty.
                            selectedPropertyInput.value = "";
                            this.state.setParentList(currSelectedListElements);
                            this.setState({
                                currSelectedListElements: [...currSelectedListElements],
                                filteredListElements: null,
                            })
                        }} 
                        className="associated_properties_dropdown_elements">
                        {filteredInput}
                    </div>
                );
            }
        }
        this.setState({
            filteredListElements: elements,
        })
    }

    removeSelectedElement(addressToRemove) {
        var currSelectedListElements = this.state.currSelectedListElements;
        var index = currSelectedListElements.indexOf(addressToRemove);
        currSelectedListElements.splice(index, 1);
        this.state.setParentList(currSelectedListElements);
        this.setState({
            currSelectedListElements: currSelectedListElements,
        })
    }

    renderElements() {

        var elements = [];

        var currSelectedListElements = this.state.currSelectedListElements;
        for (var i = 0; i < currSelectedListElements.length; i++) {
            
            let currSelectedElement = currSelectedListElements[i];
            elements.push(
                <div className="current_selected_associated_properties">
                    <p className="current_selected_associated_properties_text">
                        {currSelectedElement}
                    </p>
                    <IoTrashSharp 
                        onClick={() => this.removeSelectedElement(currSelectedElement)}
                        className="current_selected_associated_properties_icon"></IoTrashSharp>
                </div>
            );
        }

        var wrappedElements = [];

        if (elements.length > 0) {
            wrappedElements.push(
                <div className="associated_properties_selected_parent_box">
                    {elements}
                </div>
            );
        }
        
        wrappedElements.push(
            <div>
                <input 
                    id="associated_properties_input"
                    onClick={(e) => {
                        this.displayPotentialElements(e);
                        e.stopPropagation();
                    }}
                    onChange={this.displayPotentialElements}
                    placeholder={this.state.placeholderText} 
                    className="create_expense_modal_associated_properties_input"></input>
                <div className="clearfix"/>
                {this.state.filteredListElements && this.state.filteredListElements.length > 0 ?
                <div className="create_expense_modal_associated_properties_filtered_properties_box">
                    {this.state.filteredListElements}
                </div>:
                <div></div>}
            </div>
        );
        return wrappedElements;
    }

    render() {
        return (
            <div>
                {this.renderElements()}
            </div>
        )
    }
}

export default DropdownSelect;