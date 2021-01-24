import { 
    AiFillFile, 
    AiFillFileImage, 
    AiFillFileExclamation, 
    AiFillFilePdf, 
    AiFillFileExcel, 
    AiFillFilePpt, 
    AiFillFileText, 
    AiFillFileWord, 
    AiFillFileZip } from 'react-icons/ai';

// trimTrailingName will take a name, and trim off any part of it longer than maxLength and append
// a trailing ellipses (...) to it.
export function trimTrailingName(name, maxLength) {
    if (maxLength <= 0 || name.length <= maxLength) {
        return name;
    }
    return name.substring(0, maxLength) + "...";
}

export function capitalizeName(x) {
    return x.charAt(0).toUpperCase() + x.slice(1);
}

export function getByValue(map, searchValue){
    for (let [key, value] of map.entries()) {
      if (value === searchValue)
        return key;
    }
    return null;
}

/*****************************************************************************/

 // isSmall is used for small icons
 export function mapFileTypeToIcon (imageType, isActive, customClassName) {

    const small = "small";
    const medium = "medium";

    var classNames;
    if (customClassName != null && customClassName != "") {
        classNames = customClassName;
    }

    // var classNames;
    // if (size === small) {
    //      classNames = "files_dashboard_upload_image_type_mini_icon";
    // } else if (size === medium) {
    //     classNames = "files_dashboard_upload_image_type_medium_icon";
    // } else {
    //     classNames = "files_dashboard_upload_image_type";
    // }

    if (imageType === null || imageType === undefined) {
        classNames += isActive? " card_white" : " card_grey";
        return (
            <div>
                <AiFillFileExclamation 
                    className={classNames}>
                </AiFillFileExclamation>
            </div>
        )
    }

    if (imageType.includes("image")){
        classNames += isActive? " card_white" : " card_blue";
        return (
            <div>
                <AiFillFileImage 
                    className={classNames}>
                </AiFillFileImage>
            </div>
        );
    } else if (imageType.includes("pdf")) {
        classNames += isActive? " card_white" : " card_red";
        return (
            <div>
                <AiFillFilePdf
                    className={classNames}>
                </AiFillFilePdf>
            </div>
        )
    } else if (imageType.includes("video")) {
        classNames += isActive? " card_white" : " card_blue";
        return (
            <div>
                <AiFillFile 
                    className={classNames}>
                </AiFillFile>
            </div>
        )
    } else if (imageType.includes("audio")) {
        classNames += isActive? " card_white" : " card_blue";
        return (
            <div>
                <AiFillFile 
                    className={classNames}>
                </AiFillFile>
            </div>
        )
    } else if (imageType.includes("zip")) {
        classNames += isActive? " card_white" : " card_grey";
        return (
            <div>
                <AiFillFileZip
                    className={classNames}>
                </AiFillFileZip>
            </div>
        )
    } else if (imageType.includes("text")) {
        classNames += isActive? " card_white" : " card_grey";
        return (
            <div>
                <AiFillFileText
                    className={classNames}>
                </AiFillFileText>
            </div>
        )
    } else if (imageType.includes("presentation")) {
        classNames += isActive? " card_white" : " card_orange";
        return (
            <div>
                <AiFillFilePpt
                    className={classNames}>
                </AiFillFilePpt>
            </div>
        )
    } else if (imageType.includes("spreadsheet")) {
        classNames += isActive? " card_white" : " card_green";
        return (
            <div>
                <AiFillFileExcel
                    className={classNames}>
                </AiFillFileExcel>
            </div>
        )
    } else if (imageType.includes("doc")) {
        classNames += isActive? " card_white" : " card_blue";
        return (
            <div>
                <AiFillFileWord
                    className={classNames}>
                </AiFillFileWord>
            </div>
        )
    } else {
        classNames += isActive? " card_white" : " card_grey";
        return (
            <div>
                <AiFillFileExclamation
                    className={classNames}>
                </AiFillFileExclamation>
            </div>
        )
    }
}
