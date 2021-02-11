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
    if (x === null || x === undefined || x.length === 0) {
        return x;
    }
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
    if (!x || x === null || x === undefined) {
        return x;
    }
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

export function getCashFlowData(propertySummary, expenses) {

    let data = [];
    if (!propertySummary) {
        return;
    }
    let income = propertySummary["total_rent"];
    let totalIncome = parseFloat(income);
    let incomeBar = [];
    incomeBar.push(
        {value: income, color: "#296CF6", label: "Income"}
    );
    let incomeObj = {bar: incomeBar}
    data.push(incomeObj);

    let expensesBar = [];

    let totalMortgagePayment = propertySummary["total_mortgage_payment"];
    let totalExpenses = 0;

    if (totalMortgagePayment && totalMortgagePayment !== 0.00){
        expensesBar.push(
            {value: parseFloat(Number(totalMortgagePayment).toFixed(2)), color: "", label: "Loan/Mortgage"}
        );
        totalExpenses += parseFloat(Number(totalMortgagePayment).toFixed(2));
    }

    for (let i = 0; i < expenses.length; i++) {
        let expense = expenses[i];
        let title = expense["title"];
        let amount = expense["amount"];
        expensesBar.push(
            {value: amount, color: "", label: title}
        );
        totalExpenses += parseFloat(amount);
    }

    let expensesObj = {bar: expensesBar};
    data.push(expensesObj);
    return [data, totalIncome, totalExpenses];
}

export function getHistoricalAnalysisData(historicalAnalysis) {

    let data = [];

    let trailingMonths = getTrailingTwelveMonths();

    if (historicalAnalysis === null 
            || historicalAnalysis === undefined 
            || (Object.keys(historicalAnalysis).length === 0 && historicalAnalysis.constructor === Object)) {

        let defaultData = [];
        for (let i = 0; i < trailingMonths.length; i++) {
            let trailingMonthObj = trailingMonths[i];
            let month = trailingMonthObj[0];
            let yearStr = trailingMonthObj[1].toString();
            let trimmedMonth = month.substring(0,3);
            let xVal;
            if (i === 0 || trimmedMonth.toLowerCase() === 'jan') {
                xVal = trimmedMonth + " '" + yearStr.substring(2,4);
            } else {
                xVal = trimmedMonth;
            } 
            let obj = {x: xVal, y: 0}
            defaultData.push(obj);
        }
        return defaultData;
    }

    let properties = historicalAnalysis["properties"];

    if (!properties || properties === null || properties === undefined) {
        return [];
    }

    let monthYearToEstimatesArrayMap = new Map();

    // Iterate through our properties. Because PropertyPage is the view of a single property,
    // we can expect this to be a length of 0-1.
    for (let i = 0; i < properties.length; i++) {
        let property = properties[i];
        let estimates = property["property_estimates"];
        // Iterate through every single estimate we have associated with this property. This is capped
        // server side to be within the past year.
        let totalEstimate = 0;

        for (let j = 0; j < estimates.length; j++) {
            let estimate = estimates[j];
            let estimateValue = parseFloat(estimate["estimate"]);

            totalEstimate += estimateValue;

            let month = estimate["month"];
            let year = estimate["year"];
            
            // We cannot key by tuple, so do a stupid hack. Concat month and year string to serve as a key.
            // https://stackoverflow.com/questions/43592760/typescript-javascript-using-tuple-as-key-of-map.
            let key = monthArr[month - 1] + year;
            let arr;
            // Populate our map, which is a map of {key -> []estimates}. We associate every month/year combination
            // with all the estimates from that month/year. That way we can average out the estimates to get
            // an overall estimate. 
            if (!monthYearToEstimatesArrayMap.has(key)) {
                arr = [];
            } else {
                arr = monthYearToEstimatesArrayMap.get(key);
            }
            arr.push(estimateValue);
            monthYearToEstimatesArrayMap.set(key, arr);
        }
    }
    
    // Iterate through the past 12 months. 
    for (let i = 0; i < trailingMonths.length; i++) {
        let trailingMonthsObj = trailingMonths[i];
        let month = trailingMonthsObj[0];
        let year = trailingMonthsObj[1];

        let trimmedMonth = month.substring(0, 3)

        let yearStr = year.toString();

        let key = month.toString() + year.toString();
        let obj;
        let xVal;
        if (i === 0 || trimmedMonth.toLowerCase() === 'jan') {
            xVal = trimmedMonth + " '" + yearStr.substring(2,4);
        } else {
            xVal = trimmedMonth;
        } 
        if (monthYearToEstimatesArrayMap.has(key)) {
            let estimatesArr = monthYearToEstimatesArrayMap.get(key);
            let estimateTotal = 0;
            for (let j = 0; j < estimatesArr.length; j++) {
                estimateTotal += estimatesArr[j];
            }
            obj = {x: xVal, y: estimateTotal};
        } else {
            obj = {x: xVal, y: 0};
        }
        data.push(obj);
    }
    return data;
}