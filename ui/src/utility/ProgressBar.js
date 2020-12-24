import React from "react";

const ProgressBar = (props) => {

    const { bgcolor, completed } = props;

    const containerStyles = {
        bottom: 0,
        borderRadius: "0px 0px 0px 8px",
        height: 7,
        width: '100%',
        backgroundColor: "transparent",
    }

    const fillerStyles = {
        height: '100%',
        width: `${completed}%`,
        backgroundColor: "#296CF6",
        borderRadius: 'inherit',
        textAlign: 'right',
        transition: 'width 1s ease-in-out'
    }

    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
                <span></span>
            </div>
        </div>
    );
};

export default ProgressBar;