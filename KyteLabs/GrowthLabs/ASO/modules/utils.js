// utils.js

// Utility function to introduce a delay
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to remove duplicate items based on a property
export function removeDuplicates(array, key) {
    return array.reduce((arr, item) => {
        if (!arr.some(i => i[key] === item[key])) {
            arr.push(item);
        }
        return arr;
    }, []);
}

// Function to filter specific fields from data
// Define a default set of keys to exclude
const defaultKeysToExclude = ['maxInstalls', 'minInstalls', 'currency', 'scoreText', 'price', 'available', 'offersIAP', 'androidVersion', 'androidVersionText', 'androidMaxVersion', 'developerId', 'developerEmail', 'developerWebsite', 'developerAddress', 'privacyPolicy', 'developerInternalID', 'genreId', 'icon', 'contentRating', 'preregister', 'earlyAccessEnabled', 'isAvailableInPlayPass', 'priceText'];

// Function to filter specific fields from data
export function filterData(data, keysToExclude = defaultKeysToExclude) {
    const isObject = val => val != null && typeof val === 'object' && !Array.isArray(val);

    function filter(obj) {
        if (!isObject(obj)) return obj;

        const filteredObj = {};
        Object.keys(obj).forEach(key => {
            if (!keysToExclude.includes(key)) {
                filteredObj[key] = isObject(obj[key]) ? filter(obj[key]) : obj[key];
            }
        });
        return filteredObj;
    }

    return isObject(data) ? filter(data) : data;
}