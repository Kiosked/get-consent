import {
    isConsentPayload,
    isGooglePayload,
    isVendorPayload,
    waitForConsentData
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
 *  data or "vendor" for vendors consent data.
 * @property {Window=} win Optional window override.
 */

/**
 * Get consent data from a CMP
 * @param {GetConsentDataOptions=} options Options for the CMP/consent
 *  request
 * @returns {Promise.<null|ConsentPayload|VendorConsentPayload|GoogleConsentPayload>}
 *  A promise that resolves with consent data, or null if appropriate
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

export function getConsentString(options) {
    return getConsentData(
        Object.assign({}, options, {
            type: ""
        })
    ).then(result => (result ? result.consentData : result));
}

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

export function getVendorConsentData(options) {
    return getConsentData(
        Object.assign({}, options, {
            type: "vendor"
        })
    );
}

export function onConsentData(cb, type = "", win = window) {
    let live = true;
    getConsentData({ type, win })
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

export function onConsentString(cb, win = window) {
    return onConsentData(
        (err, data) => {
            if (err) {
                cb(err, null);
                return;
            }
            cb(null, data.consentData);
        },
        "",
        win
    );
}

export function onGoogleConsent(cb, win = window) {
    return onConsentData(
        (err, data) => {
            if (err) {
                cb(err, null);
                return;
            }
            cb(null, data.googlePersonalizationData.consentValue);
        },
        "google",
        win
    );
}

export function onVendorConsent(cb, win = window) {
    return onConsentData(
        (err, data) => {
            if (err) {
                cb(err, null);
                return;
            }
            cb(null, data);
        },
        "vendor",
        win
    );
}
