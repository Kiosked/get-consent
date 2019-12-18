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
 * USP applying to the user
 * @param {String|*} str The USP string or value
 * @returns {Boolean} Whether or not a value is a
 *  USP string and whether or not USP applies due
 *  to it
 * @memberof module:GetConsent
 */
export function uspApplies(str) {
    if (!isUSPString(str)) {
        return false;
    }
    // Documented by IAB to indicate a condition where the
    // US privacy framework does NOT apply:
    return str !== "1---";
}
