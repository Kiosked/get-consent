import { waitForConsentData } from "./consent.js";
import { timeoutPromise } from "./timeout.js";

export function getConsentData(options = {}) {
    const { noConsent = "reject", timeout = null, type = "" } = options;
    let consentPromise;
    if (type === "google") {
        consentPromise = waitForConsentData({
            cmpCmd: "getGooglePersonalization",
            cmpParam: undefined,
            validate: false
        });
    } else if (type === "vendor" || type === "vendors") {
        consentPromise = waitForConsentData({
            cmpCmd: "getVendorConsents",
            validate: false
        });
    } else {
        consentPromise = waitForConsentData();
    }
    if (typeof timeout === "number" && timeout > 0) {
        consentPromise = timeoutPromise(
            consentPromise,
            timeout,
            "Timed-out waiting for consent data"
        );
    }
    return consentPromise.catch(err => {
        if (err.name === "InvalidConsentError" && noConsent === "resolve") {
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
    ).then(result => (result ? result.consentData : result));
}

export function getVendorConsentData(options) {
    return getConsentData(
        Object.assign({}, options, {
            type: "vendor"
        })
    ).then(result => (result ? result.consentData : result));
}

export function onConsentData(cb) {}

export function onConsentString(cb) {}

export function onGoogleConsent(cb) {}

export function onVendorConsent(cb) {}
