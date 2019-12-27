/**
 * Test if a string is a valid USP string
 * @param {String} str The string to check
 * @returns {Boolean} True if valid, false otherwise
 * @private
 */
export function isUSPString(str) {
    return typeof str === "string" && /^1[YN-]{3}$/i.test(str);
}

/**
 * Detect whether or not a value is indicative of
 * USP applying to the user (does not detect
 * whether or not the string disables data sales).
 * @param {String|*} str The USP string or value
 * @returns {Boolean} Whether or not a value is a
 *  USP string and whether or not USP applies due
 *  to it
 * @memberof module:GetConsent
 * @see uspOptsOut
 * @example
 *  uspApplies("1---") // false
 *  uspApplies("1YN-") // true
 */
export function uspApplies(str) {
    if (!isUSPString(str)) {
        return false;
    }
    // Documented by IAB to indicate a condition where the
    // US privacy framework does NOT apply:
    return str !== "1---";
}

/**
 * Detect whether or not a USP string opts a user
 * out of data sales.
 * @param {String|*} str The USP string or value
 * @returns {Boolean} True if the value is a USP
 *  string that opts the user out from the sale
 *  of their data
 * @memberof module:GetConsent
 * @example
 *  uspOptsOut("1---") // false
 *  uspOptsOut("1YYN") // true
 */
export function uspOptsOut(str) {
    if (!isUSPString(str)) {
        return false;
    }
    const [, , optOut] = str.split("");
    return (optOut && optOut.toLowerCase() === "y") || false;
}
