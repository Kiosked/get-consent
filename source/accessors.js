import {
    isConsentPayload,
    isGooglePayload,
    isVendorPayload,
    waitForConsentData,
    waitForUSPData
} from "./consent.js";
import { timeoutPromise } from "./timeout.js";
import { createMem, mem } from "./mem.js";

const CONSENT_EXPECTED_ERROR_NAMES = ["InvalidConsentError", "TimeoutError"];

/**
 * @typedef {Object} GetConsentDataOptions
 * @property {Mem=} mem Memoization collection for caching results
 * @property {String=} noConsent Action to take when no consent or fetching
 *  times-out. When set to "reject" (default), an error is thrown. When set
 *  to "resolve", null is returned.
 * @property {Number|null=} timeout Timeout in milliseconds. Defaults to
 *  null (no timeout).
 * @property {String=} type Type of consent data to fetch. Defaults to ""
 *  (generic CMP consent data). Can be set to "google" for Google consent
 *  data, "usp" for USP strings or "vendor" for vendors consent data.
 * @property {Window=} win Optional window override.
 */

/**
 * Get consent data from a CMP
 * @param {GetConsentDataOptions=} options Options for the CMP/consent
 *  request
 * @returns {Promise.<null|ConsentPayload|VendorConsentPayload|GoogleConsentPayload>}
 *  A promise that resolves with consent data, or null if appropriate
 * @memberof module:GetConsent
 */
export function getConsentData(options = {}) {
    const {
        mem: memInst = createMem(),
        noConsent = "reject",
        timeout = null,
        type = "",
        win = window
    } = options;
    let consentPromise;
    if (type === "google") {
        consentPromise = mem(
            memInst,
            waitForConsentData,
            [
                {
                    cmpCmd: "getGooglePersonalization",
                    cmpParam: false,
                    validate: isGooglePayload,
                    win
                }
            ],
            ["getGooglePersonalization", win]
        );
    } else if (type === "vendor" || type === "vendors") {
        consentPromise = mem(
            memInst,
            waitForConsentData,
            [
                {
                    cmpCmd: "getVendorConsents",
                    validate: isVendorPayload,
                    win
                }
            ],
            ["getVendorConsents", win]
        );
    } else if (type === "usp") {
        consentPromise = mem(memInst, waitForUSPData, [{ win }], ["getUSP", win]);
    } else {
        consentPromise = mem(memInst, waitForConsentData, [{ win }], [win]);
    }
    if (typeof timeout === "number" && timeout > 0) {
        consentPromise = timeoutPromise(
            consentPromise,
            timeout,
            "Timed-out waiting for consent data"
        );
    }
    return consentPromise.catch(err => {
        if (CONSENT_EXPECTED_ERROR_NAMES.indexOf(err.name) >= 0 && noConsent === "resolve") {
            return null;
        }
        throw err;
    });
}

/**
 * Get the current consent string, if available
 * @param {GetConsentDataOptions=} options Options for the lookup
 * @returns {Promise.<String|null>}
 * @memberof module:GetConsent
 */
export function getConsentString(options) {
    return getConsentData(
        Object.assign({}, options, {
            type: ""
        })
    ).then(result => (result ? result.consentData : result));
}

/**
 * Get the current Google consent state, if available
 * @param {GetConsentDataOptions=} options Options for the lookup
 * @returns {Promise.<Number|null>} Returns 1 or 0 for Google consent,
 *  or null if not available and specified not to throw
 * @memberof module:GetConsent
 */
export function getGoogleConsent(options) {
    return getConsentData(
        Object.assign({}, options, {
            type: "google"
        })
    ).then(result =>
        result && result.googlePersonalizationData
            ? result.googlePersonalizationData.consentValue
            : result
    );
}

/**
 * Get the USP string, if available (CCPA)
 * @param {GetConsentDataOptions=} options Options for the lookup
 * @returns {Promise.<String|null>} The USP string if found or
 *  null
 * @memberof module:GetConsent
 */
export function getUSPString(options) {
    return getConsentData(
        Object.assign({}, options, {
            noConsent: "resolve",
            type: "usp"
        })
    );
}

/**
 * Get the current vendors consent state, if available
 * @param {GetConsentDataOptions=} options Options for the lookup
 * @returns {Promise.<VendorConsentPayload|null>}
 * @memberof module:GetConsent
 */
export function getVendorConsentData(options) {
    return getConsentData(
        Object.assign({}, options, {
            type: "vendor"
        })
    );
}

/**
 * Listen for consent data and fire a callback once received
 * @param {Function} cb The callback to fire - receives the
 *  `ConsentPayload`
 * @param {GetConsentDataOptions=} options Options for the lookup
 * @returns {Function} Function to call to stop listening
 * @memberof module:GetConsent
 * @example
 *  const remove = onConsentData(
 *      (err, data) => {
 *          if (err) {
 *              console.error(err);
 *          } else {
 *              console.log("Consent payload:", data);
 *          }
 *      },
 *      { win: window.top }
 *  );
 *  // Later:
 *  remove();
 */
export function onConsentData(cb, options = {}) {
    const { mem: memInst = createMem(), type = "", win = window } = options;
    let live = true;
    getConsentData({ mem: memInst, type, win })
        .then(data => {
            if (!live) {
                return;
            }
            cb(null, data);
        })
        .catch(err => {
            if (!live) {
                return;
            }
            cb(err, null);
        });
    return () => {
        live = false;
    };
}

/**
 * Listen for consent data and fire a callback with the
 *  consent string once received
 * @param {Function} cb Callback to fire - receives
 *  just the consent string or an error if not avail.
 * @param {GetConsentDataOptions=} options
 * @returns {Function} Removal function
 * @memberof module:GetConsent
 */
export function onConsentString(cb, options) {
    return onConsentData((err, data) => {
        if (err) {
            cb(err, null);
            return;
        }
        cb(null, data.consentData);
    }, options);
}

/**
 * Listen for consent data and fire a callback with the
 *  consent string once received
 * @param {Function} cb Callback to fire - receives
 *  just the consent string or an error if not avail.
 * @param {GetConsentDataOptions=} options
 * @returns {Function} Removal function
 * @memberof module:GetConsent
 */
export function onGoogleConsent(cb, options = {}) {
    return onConsentData(
        (err, data) => {
            if (err) {
                cb(err, null);
                return;
            }
            cb(null, data.googlePersonalizationData.consentValue);
        },
        Object.assign({}, options, {
            type: "google"
        })
    );
}

/**
 * @typedef {Object} OnUSPStringOptions
 * @property {Mem=} mem Optional mem instance override
 * @property {Window=} win Optional window instance override
 */

/**
 * Listen for a USP string and fire a callback with
 *  the privacy string once received
 * @param {Function} cb Callback to fire - called
 *  with (error, uspString): error if failed, or
 *  null and with uspString as following argument
 * @param {OnUSPStringOptions=} options
 * @returns {Function} Removal function
 * @memberof module:GetConsent
 */
export function onUSPString(cb, options = {}) {
    const { mem: memInst = createMem(), win = window } = options;
    let live = true;
    getConsentData({ mem: memInst, noConsent: "resolve", type: "usp", win })
        .then(uspString => {
            if (!live) {
                return;
            }
            cb(null, uspString);
        })
        .catch(err => {
            if (!live) {
                return;
            }
            cb(err, null);
        });
    return () => {
        live = false;
    };
}

/**
 * Listen for consent data and fire a callback with
 *  vendor consent data once received
 * @param {Function} cb Callback to fire - receives
 *  vendor consent data or an error if not avail.
 * @param {GetConsentDataOptions=} options
 * @returns {Function} Removal function
 * @memberof module:GetConsent
 */
export function onVendorConsent(cb, options) {
    return onConsentData(
        (err, data) => {
            if (err) {
                cb(err, null);
                return;
            }
            cb(null, data);
        },
        Object.assign({}, options, {
            type: "vendor"
        })
    );
}
