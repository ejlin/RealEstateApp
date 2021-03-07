import React from 'react';

import { AiFillHome } from 'react-icons/ai';

import './CSS/NavigationBar.css';

import logo from './Images/LogoStretch.png';

import { Link } from "react-router-dom";

class NavigationBar extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        window.addEventListener("scroll", this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }

    handleScroll = () => {
        if (window.scrollY > 20) {
          document.querySelector("#navigation_bar_parent").className = "scroll";
        } else {
          document.querySelector("#navigation_bar_parent").className = "";
        }
    };

      
    render() {
        return (
            <div id="navigation_bar_parent">
                <div id="navigation_bar_subparent">
                    <Link to="/">
                        <li id="navigation_bar_subparent_first_child">
                            <img src={logo} id="navigation_bar_logo"></img>
                        </li>
                    </Link>
                    <li 
                        style={{
                            float: "right",
                            fontWeight: "bold",
                            marginLeft: "40px",
                            marginTop: "calc((75px - 40px)/2)",
                        }}>
                        <p 
                            className="opacity"
                            style={{
                                backgroundColor: "#296cf6",
                                borderRadius: "50px",
                                color: "white",
                                cursor: "pointer",
                                fontFamily: "'Poppins', sans-serif",
                                float: "left",
                                fontSize: "1.0em",
                                height: "40px",
                                lineHeight: "40px",
                                paddingLeft: "20px",
                                paddingRight: "20px",
                                // padding: "7.5px 20px 7.5px 20px",
                            }}>
                        Sign Up
                        </p>
                    </li>
                    <li className="navigation_bar_subparent_list">
                        FAQ
                    </li>
                    <li className="navigation_bar_subparent_list">
                        Company
                    </li>
                    <Link to="/pricing">
                        <li className="navigation_bar_subparent_list">
                            Pricing
                        </li>
                    </Link>
                </div>
            </div>
        )
    }
}

export default NavigationBar;