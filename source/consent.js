import { startTimer, stopTimer } from "./timer.js";
import { getCookieValue } from "./cookie.js";
import { isUSPString } from "./usp.js";

/**
 * @typedef {Object} ConsentPayload
 * @property {String} consentData Consent string for the user
 * @property {Boolean} gdprApplies Whether or not GDPR consent applies for
 *  this particular user
 * @property {Boolean} hasGlobalConsent ?
 * @property {Boolean} hasGlobalScope Whether or not the publisher is
 *  participating in the global scope for the IAB's consent framework
 */

/**
 * @typedef {Object} VendorConsentPayload
 * @property {Boolean} gdprApplies Whether or not GDPR consent applies for
 *  this particular user
 * @property {Boolean} hasGlobalConsent ?
 * @property {Boolean} hasGlobalScope Whether or not the publisher is
 *  participating in the global scope for the IAB's consent framework
 * @property {String} metadata Base64 encoded header information
 * @property {Object.<String, Boolean>} purposeConsents Key-value list of
 *  purposes that the user has consented to. Key is a purpose ID, value
 *  is whether or not consent was granted.
 * @property {Object.<String, Boolean>} vendorConsents Key-value list of
 *  vendor IDs that the user has consented to
 */

/**
 * @typedef {Object} GoogleConsentPayload
 * @property {Object} googlePersonalizationData Data related to Google
 *  personalization state
 * @property {Number} googlePersonalizationData.consentValue Either 1 or
 *  0, indicating whether or not Google personalization consent was
 *  granted
 * @property {Date|null} googlePersonalizationData.created When the consent state was created for this
 *  user
 * @property {Date|null} googlePersonalizationData.lastUpdated When the consent state was last updated
 *  for this user
 */

/**
 * Timing values for checking if the __cmp() method is available
 * @private
 */
const CMP_CHECK_TIMINGS = [0, "4x25", "4x50", "5x100", "2x200", "3x300", "10x500", "10x750", 1000];
const INVALID_CONSENT_ERROR = "InvalidConsentError";
const USPAPI_GET_COMMAND = "getuspdata";
const USPAPI_PROMISE_KEY = "_uspapiWaitPromise";
const USPAPI_VERSION = 1;

/**
 * Get SourcePoint CMP Google consent status
 * @param {Window=} win Optional window override
 * @returns {null|Boolean} Null if no SourcePoint CMP Google consent state detected, or Boolean
 *  if state can be retrieved
 * @private
 */
function getSourcePointGoogleConsent(win = window) {
    // SourcePoint CMP: https://help.sourcepoint.com/en/articles/2322023-strategies-to-manage-dfp-tag-firing-for-consent
    const dfpPersonalisedAds = getCookieValue(win, "_sp_enable_dfp_personalized_ads");
    if (dfpPersonalisedAds && /^(true|false)$/i.test(dfpPersonalisedAds)) {
        return /^true$/i.test(dfpPersonalisedAds);
    }
    return null;
}

/**
 * Get the cookie value for the USP string
 * @param {Window=} win Optional window override
 * @returns {String|null} The USP string or null if
 *  not found
 */
function getUSPCookieValue(win = window) {
    return getCookieValue(win, "us_privacy", null);
}

/**
 * Check if an object has a property
 * @param {Object} obj Object to check
 * @param {String} propertyName Property name to check
 * @returns {Boolean} True if the object contains the specified property
 * @private
 */
function hasProperty(obj, propertyName) {
    return obj.hasOwnProperty(propertyName) || Object.keys(obj).indexOf(propertyName) >= 0;
}

/**
 * Check if a CMP ping payload is valid
 * @param {Object} payload The ping response from a CMP instance
 * @returns {Boolean}
 * @private
 */
export function isCMPPing(payload) {
    if (typeof payload !== "object" || payload === null || !hasProperty(payload, "cmpLoaded")) {
        return false;
    }
    return true;
}

/**
 * Check if a consent payload object is valid
 * @param {Object|ConsentPayload} payload The GDPR consent payload from a __cmp() call
 * @returns {Boolean} True if valid, false otherwise
 * @private
 */
export function isConsentPayload(payload) {
    if (typeof payload !== "object" || payload === null) {
        return false;
    } else if (!hasProperty(payload, "consentData") || !hasProperty(payload, "gdprApplies")) {
        return false;
    }
    return true;
}

/**
 * Check if a Google consent payload is valid
 * @param {Object|GoogleConsentPayload} payload The response from a CMP instance
 * @returns {Boolean}
 * @private
 */
export function isGooglePayload(payload) {
    return !!(
        payload &&
        payload.googlePersonalizationData &&
        typeof payload.googlePersonalizationData === "object"
    );
}

/**
 * Check if a vendors consent payload is valid
 * @param {Object|VendorConsentPayload} payload The response from a CMP instance
 * @returns {Boolean}
 * @private
 */
export function isVendorPayload(payload) {
    return !!(
        payload &&
        typeof payload.purposeConsents === "object" &&
        typeof payload.vendorConsents === "object"
    );
}

/**
 * Wait for a CMP instance to appear
 * @param {Window=} win Optional window override
 * @returns {Promise.<String>} Returns a promise that resolves with the
 *  type of CMP connection detected ("obj" is local window object, "msg"
 *  is via postMessage)
 * @private
 */
function waitForCMP(win = window) {
    if (win._cmpWaitPromise) {
        return win._cmpWaitPromise;
    }
    const topWin = win.top;
    win._cmpWaitPromise = new Promise(resolve => {
        const stopListening = () => {
            stopTimer(timer);
            win.removeEventListener("message", handleMsg, false);
        };
        const timer = startTimer(() => {
            if (typeof win.__cmp === "function") {
                stopListening();
                resolve("obj");
            }
            topWin.postMessage(
                JSON.stringify({
                    __cmp: {
                        command: "ping",
                        parameter: null
                    }
                }),
                "*"
            );
        }, CMP_CHECK_TIMINGS);
        const handleMsg = msg => {
            let { data } = msg;
            try {
                data = typeof data === "string" ? JSON.parse(data) : data;
            } catch (err) {}
            if (data && typeof data === "object" && data.__cmpReturn) {
                stopListening();
                resolve("msg");
            }
        };
        win.addEventListener("message", handleMsg, false);
    });
    return win._cmpWaitPromise;
}

/**
 * @typedef {Object} WaitForConsentDataOptions
 * @property {String=} cmpCmd CMP command to execute (default: "getConsentData")
 * @property {null|Boolean=} cmpParam Extra parameter to send to CMP (default: null). If
 *  set to false it will not be provided in the __cmp call.
 * @property {Boolean=} validate Validate CMP payload (only necessary for "getConsentData")
 *  (default: true)
 * @property {Window=} win Optional window reference override
 */

/**
 * Wait for consent data from the CMP
 * @param {WaitForConsentDataOptions=} options Options for the CMP request
 * @returns {Promise.<ConsentPayload|VendorConsentPayload|GoogleConsentPayload>} The
 *  requested consent data
 * @private
 */
export function waitForConsentData(options = {}) {
    const {
        cmpCmd = "getConsentData",
        cmpParam = null,
        validate = isConsentPayload,
        win = window
    } = options;
    const winTop = win.top || win;
    // Special consideration: Google consent w/ SourcePoint CMP
    if (cmpCmd === "getGooglePersonalization") {
        const spGoogleConsent = getSourcePointGoogleConsent(win);
        if (spGoogleConsent !== null) {
            return Promise.resolve({
                googlePersonalizationData: {
                    consentValue: spGoogleConsent ? 1 : 0,
                    created: null,
                    lastUpdated: null
                }
            });
        }
    }
    return waitForCMP(win).then(
        accessMethod =>
            new Promise((resolve, reject) => {
                if (accessMethod === "obj") {
                    // CMP is in the local window/frame - make requests against the __cmp
                    // object - This is obviously the preferred approach.
                    const cmpArgs = cmpParam === false ? [cmpCmd] : [cmpCmd, cmpParam];
                    win.__cmp(...cmpArgs, (consentPayload, wasSuccessful) => {
                        if (wasSuccessful === false || !validate(consentPayload)) {
                            const err = new Error("Invalid consent payload from CMP");
                            err.name = INVALID_CONSENT_ERROR;
                            return reject(err);
                        }
                        resolve(consentPayload);
                    });
                } else if (accessMethod === "msg") {
                    // CMP is in the top frame/window whereas we're most likely within an
                    // iframe - Not sure if all CMPs support this. Seems that Google
                    // personalization is not supported via this method.
                    const handleMsg = msg => {
                        let { data } = msg;
                        try {
                            data = typeof data === "string" ? JSON.parse(data) : data;
                        } catch (err) {}
                        try {
                            const { __cmpReturn: output } = data;
                            // There's no way to really tell if there was an invalid
                            // response destined for this listener
                            if (output && output.success && validate(output.returnValue)) {
                                winTop.removeEventListener("message", handleMsg, false);
                                resolve(output.returnValue);
                            }
                        } catch (err) {}
                    };
                    winTop.addEventListener("message", handleMsg, false);
                    winTop.postMessage(
                        JSON.stringify({
                            __cmp: {
                                command: cmpCmd,
                                parameter: cmpParam
                            }
                        }),
                        "*"
                    );
                } else {
                    reject(new Error(`Unknown CMP access method: ${accessMethod}`));
                }
            })
    );
}

function waitForUSPAPI(win = window) {
    if (win[USPAPI_PROMISE_KEY]) {
        return win[USPAPI_PROMISE_KEY];
    }
    const topWin = win.top;
    const callID = `uspAPITest:${Math.floor(Math.random() * 9e6)}`;
    win[USPAPI_PROMISE_KEY] = new Promise(resolve => {
        const stopListening = () => {
            stopTimer(timer);
            win.removeEventListener("message", handleMsg, false);
        };
        const timer = startTimer(() => {
            if (typeof win.__uspStrOvr === "string") {
                stopListening();
                return resolve("ovr");
            } else if (typeof win.__uspapi === "function") {
                stopListening();
                return resolve("obj");
            }
            topWin.postMessage(
                JSON.stringify({
                    __uspapiCall: {
                        command: USPAPI_GET_COMMAND, // Only 'getuspdata' is supported currently
                        version: USPAPI_VERSION,
                        callId: callID
                    }
                }),
                "*"
            );
        }, CMP_CHECK_TIMINGS);
        const handleMsg = msg => {
            let { data } = msg;
            try {
                data = typeof data === "string" ? JSON.parse(data) : data;
            } catch (err) {}
            if (data && typeof data === "object" && data.__uspapiReturn) {
                stopListening();
                resolve("msg");
            }
        };
        win.addEventListener("message", handleMsg, false);
    });
    return win[USPAPI_PROMISE_KEY];
}

export function waitForUSPData(options = {}) {
    const { win = window } = options;
    const winTop = win.top || win;
    // Check cookie first
    const uspStr = getUSPCookieValue(win);
    if (uspStr && isUSPString(uspStr)) {
        return Promise.resolve(uspStr);
    }
    // Check callback API
    return waitForUSPAPI(win).then(
        accessMethod =>
            new Promise((resolve, reject) => {
                if (accessMethod === "obj") {
                    // USP API is in the local window/frame - make requests against the __uspapi
                    // object - This is obviously the preferred approach.
                    win.__uspapi(USPAPI_GET_COMMAND, USPAPI_VERSION, (uspObject, wasSuccessful) => {
                        if (
                            wasSuccessful === false ||
                            (uspObject && !isUSPString(uspObject.uspString))
                        ) {
                            const err = new Error("Invalid USP payload from USP API");
                            err.name = INVALID_CONSENT_ERROR;
                            return reject(err);
                        }
                        resolve(uspObject.uspString);
                    });
                } else if (accessMethod === "msg") {
                    const callID = `uspAPI:${Math.floor(Math.random() * 9e6)}`;
                    // USP API is in the top frame/window whereas we're most likely within an
                    // iframe
                    const handleMsg = msg => {
                        let { data } = msg;
                        try {
                            data = typeof data === "string" ? JSON.parse(data) : data;
                        } catch (err) {}
                        try {
                            const { __uspapiReturn: output } = data;
                            if (output.callId === callID) {
                                if (output && output.success && isUSPString(output.returnValue)) {
                                    winTop.removeEventListener("message", handleMsg, false);
                                    resolve(output.returnValue);
                                } else {
                                    const err = new Error(
                                        "Invalid USP payload response from USP API postMessage listener"
                                    );
                                    err.name = INVALID_CONSENT_ERROR;
                                    return reject(err);
                                }
                            }
                        } catch (err) {}
                    };
                    winTop.addEventListener("message", handleMsg, false);
                    winTop.postMessage(
                        JSON.stringify({
                            __uspapiCall: {
                                command: USPAPI_GET_COMMAND,
                                version: USPAPI_VERSION,
                                callId: callID
                            }
                        }),
                        "*"
                    );
                } else if (accessMethod === "ovr") {
                    const str = win.__uspStrOvr;
                    if (isUSPString(str)) {
                        return resolve(str);
                    }
                    const err = new Error(
                        `Invalid USP payload response from USP override property: ${str}`
                    );
                    err.name = INVALID_CONSENT_ERROR;
                    return reject(err);
                } else {
                    reject(new Error(`Unknown USP API access method: ${accessMethod}`));
                }
            })
    );
}
