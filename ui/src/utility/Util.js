import { 
    AiFillFile, 
    AiFillFileImage, 
    AiFillFileExclamation, 
    AiFillFilePdf, 
    AiFillFileExcel, 
    AiFillFilePpt, 
    AiFillFileText, 
    AiFillFileWord, 
    AiFillFileZip,
    AiFillFileMarkdown } from 'react-icons/ai';

export const monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// trimTrailingName will take a name, and trim off any part of it longer than maxLength and append
// a trailing ellipses (...) to it.
export function trimTrailingName(name, maxLength) {
    if (name === null || name === undefined) {
        return "";
    }
    name = name.trim();
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

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getDateSuffix(date) {
    // convert string to int.
    let strDate = parseInt(date);


    if ((strDate >= 4 && strDate <= 20) || (strDate >= 24 && strDate <= 30)) {
        return 'th';
    }

    if (strDate === 2 || strDate === 22) {
        return 'nd';
    }

    if (strDate === 3 || strDate === 23) {
        return 'rd';
    }

    if (strDate === 1 || strDate === 21 || strDate === 31) {
        return 'st';
    }

}

/*****************************************************************************/

 // isSmall is used for small icons
 export function mapFileTypeToIcon (imageType, isActive, customClassName) {

    const small = "small";
    const medium = "medium";

    let classNames;
    if (customClassName != null && customClassName != "") {
        classNames = customClassName;
    }

    // let classNames;
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
                <AiFillFileMarkdown
                    className={classNames}>
                </AiFillFileMarkdown>
            </div>
        )
    } else if (imageType.includes("audio")) {
        classNames += isActive? " card_white" : " card_blue";
        return (
            <div>
                <AiFillFileMarkdown
                    className={classNames}>
                </AiFillFileMarkdown>
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

export function openSignedURL(signedURL) {
    if (signedURL !== "") {
        window.open(signedURL, '_blank', 'noopener,noreferrer')
    }
}

/* Credit https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript */
export function bytesToSize(bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 }

 export function getTrailingTwelveMonths() {
    let today = new Date();
    let mm = today.getMonth();
    let year = today.getFullYear();

    let numMonths = 12;

    let trailingMonths = [];

    let firstBackwardsMonth = monthArr.slice(0, mm + 1);
    for (let i = 0; i < firstBackwardsMonth.length; i++) {
        let month = firstBackwardsMonth[i];
        trailingMonths.push([month, year]);
    }

    let lastBackwardsMonth = monthArr.slice(mm + 1, numMonths);
    for (let i = lastBackwardsMonth.length - 1; i >= 0; i--) {
        let month = lastBackwardsMonth[i];
        trailingMonths.unshift([month, year - 1]);
    }

    return trailingMonths;
}

export function getMonthAndYear(createdAt) {

    // Format is 2020-01-01TXXX.XXXZ
    if (createdAt === undefined || createdAt === null) {
        return ["", ""];
    }
    let split = createdAt.split("T");

    let fullDate = split[0];

    let splitFullDate = fullDate.split("-");

    let year = splitFullDate[0];
    let month = splitFullDate[1];

    return [month, year];
}