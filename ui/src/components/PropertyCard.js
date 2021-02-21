import React from 'react';
import axios from 'axios';

import './CSS/PropertyCard.css';

import { numberWithCommas } from '../utility/Util.js';

class PropertyCard extends React.Component {
    constructor(props) {
        super(props);

        let user;

        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            user = JSON.parse(loggedInUser);
        } else {
            user = null;
        }

        this.state = {
            user: user,
            property: this.props.data.state.property_details,
            isLoading: false
        };
        
        this.setActiveProperty = this.props.setActiveProperty;
    }

    componentDidMount() {
        console.log(this.state.property);
        
        let propertyGoogleMapsURL = (this.state.property["address_one"] + (this.state.property["address_two"] ? " " + this.state.property["address_two"] : "")) + "," + this.state.property["city"] + "," + this.state.property["state"];
        propertyGoogleMapsURL = propertyGoogleMapsURL.replace(" ", "+");

        let markerCenter = (this.state.property["address_one"] + (this.state.property["address_two"] ? " " + this.state.property["address_two"] : "")) + "," + this.state.property["state"];
        markerCenter = markerCenter.replace(" ", "+");

        let googleMapsURL = 'https://maps.googleapis.com/maps/api/staticmap?center=' + propertyGoogleMapsURL + '&zoom=15&size=300x175&maptype=roadmap&markers=size:small%7Ccolor:0x296CF6%7C' + markerCenter + '&key=AIzaSyCbudHvO__fMV1eolNO_g5qtE2r2UNcjcA';
        this.setState({
            googleMapsURL: googleMapsURL
        })
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div></div>
            );
        }
        return (
            <div 
                onClick={() => {
                    this.setActiveProperty(this.state.property["id"])
                }}
                className="property_card_box opacity"
                style={{
                    cursor: "pointer",
                }}
            >
                <div style={{
                    position: "relative",
                }}
                >
                    <img style={{
                        height: "175px",
                        width: "100%",
                    }}
                    src={this.state.googleMapsURL}/>
                    <div style={{
                        backgroundColor: "#296cf6",
                        borderRadius: "50px",
                        marginRight: "10px",
                        marginTop: "10px",
                        padding: "5px 15px 5px 15px",
                        position: "absolute",
                        right: "0",
                        top: "0",
                    }}>
                        <p style={{
                            color: "white",
                            fontSize: "0.9em",
                        }}>
                            View
                        </p>
                    </div>
                </div>
                <div style={{
                    borderRadius: "6px 6px 0px 0px",
                    marginTop: "15px",
                    width: "100%",
                }}>
                    <p style={{
                        float: "left",
                        fontSize: "1.25em",
                        fontWeight: "bold",
                        marginLeft: "20px",
                    }}>
                        {this.state.property["address_one"]} {this.state.property["address_two"]} 
                    </p>
                    <div className="clearfix"/>
                    <p style={{
                        fontSize: "1.05em",
                        fontWeight: "bold",
                        marginLeft: "20px",
                        marginTop: "5px",
                        width: "calc(100% - 60px)",
                    }}>
                        {this.state.property["city"]}, {this.state.property["state"]} {this.state.property["zip_code"]}
                    </p>              
                </div>
                <p style={{
                    color: "grey",
                    float: "left",
                    fontSize: "1.2em",
                    fontWeight: "bold",
                    lineHeight: "55px",
                    marginLeft: "20px",
                    userSelect: "none",
                }}>
                    ${this.state.property["estimate"] ? numberWithCommas(this.state.property["estimate"]) : numberWithCommas(this.state.property["price_bought"])}
                </p>
                <div className="clearfix"/>
                {
                    this.state.property["currently_rented"] ?
                    <div style={{
                        backgroundColor: "#85bb65",
                        borderRadius: "50px",
                        float: "left",
                        marginLeft: "20px",
                        marginTop: "0px",
                        padding: "5px 10px 5px 10px",
                    }}>
                        <p style={{
                            color: "white",
                            fontSize: "0.8em",
                        }}>
                            RENTED
                        </p>
                    </div> :
                    <div style={{
                        backgroundColor: "grey",
                        borderRadius: "50px",
                        float: "left",
                        marginLeft: "20px",
                        marginTop: "0px",
                        padding: "5px 10px 5px 10px",
                    }}>
                        <p style={{
                            color: "white",
                            fontSize: "0.8em",
                        }}>
                            NOT RENTED
                        </p>
                    </div>
                }
                <div className="clearfix"/>
                <p style={{
                    color: "#296cf6",
                    fontSize: "1.1em",
                    fontWeight: "bold",
                    marginTop: "20px",
                    paddingBottom: "20px",
                    textAlign: "center",
                }}>
                    {
                        this.state.property["currently_rented"] && this.state.property["price_rented"] ?
                        "$" + numberWithCommas(this.state.property["price_rented"]) + "/mo." :
                        "$- /mo."
                    }
                </p>
                
                <div className="clearfix"/>
                <div style={{
                    margin: "0px 20px 0px 20px",
                    width: "calc(100% - 40px)",
                }}>
                    <div style={{
                        width: "100%",
                    }}>
                    </div>
                </div>
            </div>
        )
    }
}

export default PropertyCard;