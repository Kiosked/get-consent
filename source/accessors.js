import {
    isConsentPayload,
    isGooglePayload,
    isVendorPayload,
    waitForConsentData
} from "./consent.js";
import { timeoutPromise } from "./timeout.js";

export function getConsentData(options = {}) {
    const { noConsent = "reject", timeout = null, type = "", win = window } = options;
    let consentPromise;
    if (type === "google") {
        consentPromise = waitForConsentData({
            cmpCmd: "getGooglePersonalization",
            cmpParam: undefined,
            validate: isGooglePayload,
            win
        });
    } else if (type === "vendor" || type === "vendors") {
        consentPromise = waitForConsentData({
            cmpCmd: "getVendorConsents",
            validate: isVendorPayload,
            win
        });
    } else {
        consentPromise = waitForConsentData({ win });
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

export function onConsentData(cb, type = "", win = window) {
    let live = true;
    getConsentData()
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
    return onConsentData(data => {
        cb(null, data.consentData);
    });
}

export function onGoogleConsent(cb, win = window) {
    return onConsentData(data => {
        cb(null, data.consentData);
    }, "google");
}

export function onVendorConsent(cb, win = window) {
    return onConsentData(data => {
        cb(null, data.consentData);
    }, "vendor");
}
