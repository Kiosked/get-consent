import { startTimer, stopTimer } from "./timer.js";

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
 * @property {Date} created When the consent state was created for this
 *  user
 * @property {Date} lastUpdated When the consent state was last updated
 *  for this user
 */

/**
 * Timing values for checking if the __cmp() method is available
 * @private
 */
const CMP_CHECK_TIMINGS = [0, "4x25", "4x50", "5x100", "2x200", "3x300", "10x500", "10x750", 1000];

let __cmpWaitPromise;

/**
 * Check if a consent payload object is valid
 * @param {Object} payload The GDPR consent payload from a __cmp() call
 * @returns {Boolean} True if valid, false otherwise
 * @private
 * @static
 */
function consentPayloadValid(payload) {
    if (typeof payload !== "object" || payload === null) {
        return false;
    } else if (!hasProperty(payload, "consentData") || !hasProperty(payload, "gdprApplies")) {
        return false;
    }
    return true;
}

function waitForCMP() {
    if (__cmpWaitPromise) {
        return __cmpWaitPromise;
    }
    __cmpWaitPromise = new Promise(resolve => {
        const stopListening = () => {
            stopTimer(timer);
            topmostWindow.removeEventListener("message", handleMsg, false);
        };
        const timer = startTimer(() => {
            if (typeof win.__cmp === "function") {
                stopListening();
                resolve("obj");
            }
            topmostWindow.postMessage(
                JSON.stringify({
                    __cmp: {
                        command: "ping",
                        parameter: null
                    }
                })
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
        topmostWindow.addEventListener("message", handleMsg, false);
    });
    return __cmpWaitPromise;
}

/**
 * @typedef {Object} WaitForConsentDataOptions
 * @property {String=} cmpCmd CMP command to execute (default: "getConsentData")
 * @property {null|undefined=} cmpParam Extra parameter to send to CMP (default: null)
 * @property {Boolean=} validate Validate CMP payload (only necessary for "getConsentData")
 *  (default: true)
 * @property {Window=} win Optional window reference override
 */

/**
 * Wait for consent data from the CMP
 * @param {WaitForConsentDataOptions=} options Options for the CMP request
 * @returns {Promise.<ConsentPayload|VendorConsentPayload|GoogleConsentPayload>} The
 *  requested consent data
 */
export function waitForConsentData(options = {}) {
    const { cmpCmd = "getConsentData", cmpParam = null, validate = true, win = window } = options;
    const winTop = win.top || win;
    return waitForCMP().then(
        accessMethod =>
            new Promise((resolve, reject) => {
                if (accessMethod === "obj") {
                    // CMP is in the local window/frame - make requests against the __cmp
                    // object - This is obviously the preferred approach.
                    const cmpArgs = typeof cmpParam === "undefined" ? [cmpCmd] : [cmpCmd, cmpParam];
                    window.__cmp(...cmpArgs, (consentPayload, wasSuccessful) => {
                        const isValid = validate ? consentPayloadValid(consentPayload) : true;
                        if (!wasSuccessful || !isValid) {
                            const err = new Error("Invalid consent payload from CMP");
                            err.name = "InvalidConsentError";
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
                            if (output && !output.success) {
                                const err = new Error("Invalid consent payload from CMP");
                                err.name = "InvalidConsentError";
                                winTop.removeEventListener("message", handleMsg, false);
                                return reject(err);
                            } else if (
                                output.success &&
                                output.returnValue &&
                                output.returnValue.consentData
                            ) {
                                winTop.removeEventListener("message", handleMsg, false);
                                resolve(output.returnValue);
                            }
                        } catch (err) {}
                    };
                    winTop.addEventListener("message", handleMsg, false);
                    winTop.postMessage(
                        JSON.stringify({
                            command: cmpCmd,
                            parameter: cmpParam
                        })
                    );
                } else {
                    reject(new Error(`Unknown CMP access method: ${accessMethod}`));
                }
            })
    );
}
