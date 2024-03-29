import React from 'react';
import { Link } from "react-router-dom";

import { FiCheck } from 'react-icons/fi';
import { BsFillHouseFill } from 'react-icons/bs';

import NavigationBar from './NavigationBar.js';
import Footer from './Footer.js';

import './CSS/PricingPage.css';
import './CSS/Style.css';

class PricingPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <div>
                <NavigationBar></NavigationBar>
                <div id="pricing_page_parent">
                    <div id="pricing_page_top_box">
                        <div id="pricing_page_title_box">
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "2.2em",
                                fontWeight: "bold",
                                textAlign: "center",
                            }}>
                                Pricing
                            </p>
                            <p style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1.0em",
                                marginLeft: "calc((100% - 600px)/2)",
                                marginTop: "5px",
                                textAlign: "center",
                                width: "600px",
                            }}>
                                Plans to fit every need from the learning investor to the savvy expert. Choose the one that best fits you.
                            </p>
                        </div>
                        <div id="pricing_page_prices_box">
                            
                            <div id="pricing_page_elements_box">
                                <div className="pricing_page_prices_element">
                                    <div className="pricing_page_prices_title_box">
                                        <p className="pricing_page_prices_title">
                                            Starter
                                        </p>
                                        <p className="pricing_page_prices_subtitle blue">
                                            Getting started with Real Estate
                                        </p>
                                    </div>
                                    <div className="clearfix"/>
                                    <div className="pricing_page_features_box">
                                        <div className="pricing_page_bullet">
                                            <BsFillHouseFill className="pricing_page_bullet_icon blue"></BsFillHouseFill>
                                            <p className="pricing_page_bullet_text blue large">
                                                $9 / month
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon blue"></FiCheck>
                                            <p className="pricing_page_bullet_text blue">
                                                3 properties
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon blue"></FiCheck>
                                            <p className="pricing_page_bullet_text blue">
                                                Basic Analytics
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon blue"></FiCheck>
                                            <p className="pricing_page_bullet_text blue">
                                                Linked Bank Accounts
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon blue"></FiCheck>
                                            <p className="pricing_page_bullet_text blue">
                                                3 GB File Storage
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon blue"></FiCheck>
                                            <p className="pricing_page_bullet_text blue">
                                                Ticketed Support
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pricing_page_prices_element" id="pricing_page_prices_element_second">
                                    <div className="pricing_page_prices_title_box">
                                        <p className="pricing_page_prices_title" id="pricing_page_prices_title_second">
                                            Professional
                                        </p>
                                        <p className="pricing_page_prices_subtitle white">
                                            For the professional investors
                                        </p>
                                    </div>
                                    <div className="pricing_page_features_box">
                                        <div className="pricing_page_bullet">
                                            <BsFillHouseFill className="pricing_page_bullet_icon white"></BsFillHouseFill>
                                            <p className="pricing_page_bullet_text white large">
                                                $59 / month
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon white"></FiCheck>
                                            <p className="pricing_page_bullet_text white">
                                                Everything in Starter
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon white"></FiCheck>
                                            <p className="pricing_page_bullet_text white">
                                                25 properties
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon white"></FiCheck>
                                            <p className="pricing_page_bullet_text white">
                                                Advanced Analytics
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon white"></FiCheck>
                                            <p className="pricing_page_bullet_text white">
                                                End-of-Year Tax Reporting
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon white"></FiCheck>
                                            <p className="pricing_page_bullet_text white">
                                                50 GB File Storage
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon white"></FiCheck>
                                            <p className="pricing_page_bullet_text white">
                                                Priority Ticketed Support
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pricing_page_prices_element" id="pricing_page_prices_element_third">
                                    <div className="pricing_page_prices_title_box">
                                        <p className="pricing_page_prices_title" >
                                            Enterprise
                                        </p>
                                        <p className="pricing_page_prices_subtitle blue">
                                            Investing at scale
                                        </p>
                                    </div>
                                    <div className="pricing_page_features_box">
                                        <div className="pricing_page_bullet">
                                            <BsFillHouseFill className="pricing_page_bullet_icon blue"></BsFillHouseFill>
                                            <p className="pricing_page_bullet_text blue large">
                                                $179 / month
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon blue"></FiCheck>
                                            <p className="pricing_page_bullet_text blue">
                                                Everything in Professional
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon blue"></FiCheck>
                                            <p className="pricing_page_bullet_text blue">
                                                Up to 100 Properties*
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon blue"></FiCheck>
                                            <p className="pricing_page_bullet_text blue">
                                                Up to 300 GB File Storage*
                                            </p>
                                        </div>
                                        <div className="pricing_page_bullet">
                                            <FiCheck className="pricing_page_bullet_icon blue"></FiCheck>
                                            <p className="pricing_page_bullet_text blue">
                                                Dedicated Priority Support
                                            </p>
                                        </div>
                                        <p className="pricing_page_asterick blue">
                                            * $1/additional property; $1/additional 5GB
                                        </p>

                                    </div>
                                </div>
                            </div>
                            <div className="clearfix"/>
                            <div className="pricing_page_custom_solutions_talk_box">
                                <p className="pricing_page_custom_solutions_sales_text">
                                    Don't see a plan that fits your needs? Talk to 
                                </p>
                                <Link to="/contact">
                                    <div className="pricing_page_custom_solutions_sales_button opacity">
                                        <p className="pricing_page_custom_solutions_sales_button_text">
                                            Sales
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default PricingPage;