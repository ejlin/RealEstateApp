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

        let selectedPropertyInput = document.getElementById("associated_properties_input");

        let elements = [];
        let value = e.target.value;
        let currSelectedListElements = this.state.currSelectedListElements;

        let allIndex = currSelectedListElements.indexOf(All);
        if (allIndex < 0){
            elements.push(
                <div 
                    onClick={() => {
                        let currSelectedListElements = this.state.currSelectedListElements;
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
                            currSelectedListElements: currSelectedListElements,
                            filteredListElements: null,
                        }, () => console.log(this.state.currSelectedListElements))
                    }} 
                    className="associated_properties_dropdown_elements">
                    {All}
                </div>
            );
        }
        
        let noneIndex = currSelectedListElements.indexOf(None);
        if (noneIndex < 0){
            elements.push(
                <div 
                    onClick={() => {
                        let currSelectedListElements = this.state.currSelectedListElements;
                        currSelectedListElements = [None];
                        // reset the search bar to empty.
                        selectedPropertyInput.value = "";
                        this.state.setParentList(currSelectedListElements);
                        this.setState({
                            currSelectedListElements: currSelectedListElements,
                            filteredListElements: null,
                        }, () => console.log(this.state.currSelectedListElements))
                    }} 
                    className="associated_properties_dropdown_elements">
                    {None}
                </div>
            );
        }

        let inputList = this.state.inputList;
        let filteredInputList = inputList.filter(address => address.startsWith(value));
        for (let i = 0; i < filteredInputList.length; i++) {
            let filteredInput = filteredInputList[i];
            if (filteredInput === None || filteredInput === All) {
                continue;
            }
            let index = currSelectedListElements.indexOf(filteredInput);
            // Only show properties that are not currently selected.
            if (index < 0){
                elements.push(
                    <div 
                        onClick={() => {
                            let currSelectedListElements = this.state.currSelectedListElements;
                            currSelectedListElements.push(filteredInput);
                            // Remove None from our list if we add a non-None element.
                            let index = currSelectedListElements.indexOf(None);
                            if (index >= 0) {
                                currSelectedListElements.splice(index, 1);
                            }
                            // reset the search bar to empty.
                            selectedPropertyInput.value = "";
                            this.state.setParentList(currSelectedListElements);
                            this.setState({
                                currSelectedListElements: currSelectedListElements,
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
        let currSelectedListElements = this.state.currSelectedListElements;
        let index = currSelectedListElements.indexOf(addressToRemove);
        currSelectedListElements.splice(index, 1);
        this.state.setParentList(currSelectedListElements);
        this.setState({
            currSelectedListElements: currSelectedListElements,
        })
    }

    renderElements() {

        let elements = [];

        let currSelectedListElements = this.state.currSelectedListElements;
        for (let i = 0; i < currSelectedListElements.length; i++) {
            let currSelectedElement = currSelectedListElements[i];
            elements.push(
                <div style={{
                    backgroundColor: "#32384D",
                    borderRadius: "6px",
                    fontSize: "1.0em",
                    height: "35px",
                    lineHeight: "35px",
                    marginBottom: "10px",
                    padding: "2px",
                    width: "calc((100% - 4px))",
                }}>
                    <p style={{
                        color: "white",
                        float: "left",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "0.9em",
                        marginLeft: "15px",
                    }}>
                        {currSelectedElement}
                    </p>
                    <IoTrashSharp 
                        onClick={() => this.removeSelectedElement(currSelectedElement)}
                        className="current_selected_associated_properties_icon"></IoTrashSharp>
                </div>
            );
        }

        let wrappedElements = [];

        if (elements.length > 0) {
            wrappedElements.push(
                <div style={{
                    borderRadius: "6px",
                    marginTop: "10px",
                }}>
                    {elements}
                </div>
            );
        }
        
        wrappedElements.push(
            <div className="dropdown_select_parent_box">
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
                <div style={{
                    backgroundColor: "#f5f5fa",
                    border: "1px solid #d3d3d3",
                    borderRadius: "0px 0px 4px 4px",
                    position: "absolute",
                    width: "calc(100% - 2px)",
                    zIndex: "11 !important",
                }}>
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