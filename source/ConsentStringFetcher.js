import { startTimer, stopTimer } from "./timer.js";
import { timeoutPromise } from "./timeout.js";

const CALLBACKS = [
    "cmpDetected",
    "consentData",
    "consentString",
    "googleConsent",
    "noConsentData",
    "noGoogleConsent",
    "vendorConsentsData"
];

/**
 * Timing values for checking if the __cmp() method is available
 * @private
 */
const CMP_CHECK_TIMINGS = [0, "4x25", "4x50", "5x100", "2x200", "3x300", "10x500", "10x750", 1000];

/**
 * GDPR consent data (from getConsentData)
 * @typedef {Object} CMPConsentData
 * @property {String} consentData - GDPR consent string
 * @property {Boolean} gdprApplies - Whether GDPR applies in the current context or not
 * @property {Boolean} hasGlobalScope - "true if the vendor consent data is retrieved from the global cookie, false if from a publisher-specific (or publisher-group-specific) cookie"
 */

/**
 * GDPR vendor consents (from getVendorConsents)
 * @typedef {Object} CMPVendorConsentsData
 * @property {Boolean} gdprApplies - Whether GDPR applies in the current context or not
 * @property {Boolean} hasGlobalScope - "true if the vendor consent data is retrieved from the global cookie, false if from a publisher-specific (or publisher-group-specific) cookie"
 * @property {Object} purposeConsents - Key-value object with purpose consent statuses. Key is vendor ID, value is true/false for consent.
 * @property {Object} vendorConsents - Key-value object with vendor consent statuses. Key is vendor ID, value is true/false for consent.
 */

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

/**
 * Check if an object has a property
 * @param {Object} obj
 * @param {*} propertyName
 */
function hasProperty(obj, propertyName) {
    return obj.hasOwnProperty(propertyName) || Object.keys(obj).indexOf(propertyName) >= 0;
}

/**
 * Initialise the fetcher
 * @param {ConsentStringFetcher} fetcher The fetcher instance
 * @see https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/CMP%20JS%20API%20v1.1%20Final.md#what-api-will-need-to-be-provided-by-the-cmp-
 * @private
 * @static
 */
function initFetcher(fetcher) {
    const win = fetcher._window;
    let timer;
    const checkCMP = () => {
        if (typeof win.__cmp === "function") {
            fetcher._cmpDetected = true;
            fetcher._fireCallback("cmpDetected", null);
            stopTimer(timer);
            win.__cmp("getConsentData", null, (consentPayload, wasSuccessful) => {
                if (!fetcher || !fetcher._alive) {
                    return;
                }
                if (!wasSuccessful || !consentPayloadValid(consentPayload)) {
                    fetcher._lastConsentData = false;
                    fetcher._fireCallback("noConsentData", null);
                    return;
                }
                fetcher._lastConsentData = Object.assign({}, consentPayload);
                fetcher._fireCallback("consentData", fetcher._lastConsentData);
                fetcher._fireCallback("consentString", consentPayload.consentData);
            });
            win.__cmp("getVendorConsents", null, vendorConsentsPayload => {
                if (!fetcher || !fetcher._alive) {
                    return;
                }
                fetcher._lastVendorConsentsData = Object.assign({}, vendorConsentsPayload);
                fetcher._fireCallback("vendorConsentsData", fetcher._lastVendorConsentsData);
            });
            try {
                win.__cmp("getGooglePersonalization", (consentData, wasSuccessful) => {
                    if (!wasSuccessful) {
                        fetcher._googleConsent = false;
                        fetcher._fireCallback("noGoogleConsent", null);
                        return;
                    }
                    fetcher._googleConsent =
                        consentData.googlePersonalizationData.consentValue === 1;
                    fetcher._fireCallback("googleConsent", fetcher._googleConsent);
                });
            } catch (err) {}
        }
    };
    fetcher._timer = timer = startTimer(checkCMP, CMP_CHECK_TIMINGS);
}

/**
 * Consent String fetcher
 * @class ConsentStringFetcher
 */
export default class ConsentStringFetcher {
    /**
     * Create a fetcher attached to a window
     * @param {Window=} win The window to attach to
     * @returns {ConsentStringFetcher} New fetcher instance
     * @static
     * @memberof ConsentStringFetcher
     */
    static attachToWindow(win = window) {
        return new ConsentStringFetcher(win);
    }

    /**
     * Constructor for the fetcher
     * @param {Window} win The window instance (required)
     * @memberof ConsentStringFetcher
     */
    constructor(win) {
        if (!win) {
            throw new Error("First parameter is required (window)");
        }
        this._window = win;
        this._lastConsentData = null;
        this._lastVendorConsentsData = null;
        this._googleConsent = null;
        this._cmpDetected = false;
        this._callbacks = CALLBACKS.reduce((out, cbName) => ({ ...out, [cbName]: [] }), {});
        this._alive = true;
        initFetcher(this);
    }

    /**
     * The last successfully fetched consent data object (getConsentData)
     * @type {CMPConsentData|null}
     * @memberof ConsentStringFetcher
     * @readonly
     */
    get consentData() {
        return this._lastConsentData ? Object.freeze(this._lastConsentData) : null;
    }

    /**
     * The last successfully fetched vendor consents payload (getVendorConsents)
     * @type {CMPVendorConsentsData|null}
     * @memberof ConsentStringFetcher
     * @readonly
     */
    get vendorConsentsData() {
        return this._lastVendorConsentsData ? Object.freeze(this._lastVendorConsentsData) : null;
    }

    /**
     * Remove event listener
     * @param {String} eventType The event type that was being listened to
     * @param {Function} callback The callback function that was attached
     * @memberof ConsentStringFetcher
     */
    off(eventType, callback) {
        const ind = this._callbacks[eventType].indexOf(callback);
        if (ind >= 0) {
            this._callbacks[eventType].splice(ind, 1);
        }
    }

    /**
     * .on() return value
     * @typedef OnMethodReturnValue
     * @property {Function} remove - Remove method to cancel the listener
     */

    /**
     * Attach an event
     * @param {*} eventType The type of event to listen to
     * @param {*} callback The callback to fire when the event is triggered
     * @returns {OnMethodReturnValue} Controls for the listener
     * @memberof ConsentStringFetcher
     */
    on(eventType, callback) {
        this._callbacks[eventType].push(callback);
        return {
            remove: () => this.off(eventType, callback)
        };
    }

    /**
     * Shutdown the fetcher (detatch from window)
     * @memberof ConsentStringFetcher
     */
    shutdown() {
        if (this._timer) {
            stopTimer(this._timer);
        }
        this._alive = false;
    }

    /**
     * Wait for the appearance of a __cmp method
     * @param {Number|null=} timeout Timeout, in milliseconds, to wait for a
     *  CMP to appear
     * @returns {Promise} A promise that resolves once a CMP has been detected
     * @memberof ConsentStringFetcher
     * @throws {TimeoutError} Throws a timeout error if the timeout is
     *  specified and it is reached
     */
    waitForCMP(timeout = null) {
        const work = new Promise(resolve => {
            if (this._cmpDetected) {
                return resolve();
            }
            const { remove } = this.on("cmpDetected", () => {
                remove();
                resolve();
            });
        });
        return timeout === null ? work : timeoutPromise(work, timeout, "Timed out waiting for CMP");
    }

    /**
     * Wait for consent data
     * @param {Number|null=} timeout Timeout, in milliseconds, for the fetching of
     *  consent data
     * @returns {Promise.<CMPConsentData>} Promise that resolves with consent data
     *  from the CMP system
     * @memberof ConsentStringFetcher
     * @throws {TimeoutError} Throws a timeout error if the timeout is
     *  specified and it is reached
     */
    waitForConsent(timeout = null) {
        if (this._lastConsentData === false) {
            return Promise.reject(new Error("No consent data available"));
        }
        const work = new Promise((resolve, reject) => {
            if (this.consentData) {
                return resolve(this.consentData);
            }
            const { remove: removeOnConsentData } = this.on("consentData", data => {
                removeOnConsentData();
                removeOnNoConsent();
                resolve(data);
            });
            const { remove: removeOnNoConsent } = this.on("noConsentData", () => {
                removeOnConsentData();
                removeOnNoConsent();
                reject(new Error("No consent data available"));
            });
        });
        return timeout === null
            ? work
            : timeoutPromise(work, timeout, "Timed out waiting for consent");
    }

    /**
     * Wait for a consent string
     * @param {Number|null=} timeout Timeout, in milliseconds, for the fetching of
     *  a consent string
     * @returns {Promise.<String>} Promise that resolves with a consent string
     *  from the CMP system
     * @see waitForConsent
     * @memberof ConsentStringFetcher
     * @throws {TimeoutError} Throws a timeout error if the timeout is
     *  specified and it is reached
     */
    waitForConsentString(timeout) {
        return this.waitForConsent(timeout).then(data => data.consentData);
    }

    /**
     * Wait for a consent state for Google personalized ads
     * @param {Number|null=} timeout Timeout, in milliseconds, for the fetching of
     *  a consent string
     * @returns {Promise.<Boolean>} Promise that resolves with a consent status from
     *  a supporting CMP system (eg. Quantcast)
     * @memberof ConsentStringFetcher
     * @throws {TimeoutError} Throws a timeout error if the timeout is
     *  specified and it is reached
     */
    waitForGoogleConsent(timeout = null) {
        const work = new Promise((resolve, reject) => {
            if (typeof this._googleConsent === "boolean") {
                return resolve(this._googleConsent);
            }
            const { remove: removeOnGoogleConsent } = this.on("googleConsent", hasConsent => {
                removeOnGoogleConsent();
                removeOnNoGoogleConsent();
                resolve(hasConsent);
            });
            const { remove: removeOnNoGoogleConsent } = this.on("noGoogleConsent", () => {
                removeOnGoogleConsent();
                removeOnNoGoogleConsent();
                reject(new Error("No consent data available"));
            });
        });
        return timeout === null
            ? work
            : timeoutPromise(work, timeout, "Timed out waiting for consent");
    }

    /**
     * Wait for vendor consents (getVendorConsents)
     * @param {Number|null=} timeout Timeout, in milliseconds, for the fetching of
     *  vendor consents
     * @returns {Promise.<CMPVendorConsentsData>} Promise that resolves with vendor
     *  consents once available
     * @memberof ConsentStringFetcher
     * @throws {TimeoutError} Throws a timeout error if the timeout is
     *  specified and it is reached
     */
    waitForVendorConsents(timeout = null) {
        const work = new Promise(resolve => {
            if (this.vendorConsentsData) {
                return resolve(this.vendorConsentsData);
            }
            const { remove } = this.on("vendorConsentsData", data => {
                remove();
                resolve(data);
            });
        });
        return timeout === null
            ? work
            : timeoutPromise(work, timeout, "Timed out waiting for vendor consents");
    }

    /**
     * Fire a callback
     * @param {String} type The callback type
     * @param {*} data The data to provide to the callback
     * @memberof ConsentStringFetcher
     * @protected
     * @throws {Error} Throws if the callback type isn't recognised
     */
    _fireCallback(type, data) {
        if (!this._callbacks[type]) {
            throw new Error(`Failed firing callbacks: Unrecognised callback type: ${type}`);
        }
        [...this._callbacks[type]].forEach(cb => {
            try {
                cb(data);
            } catch (err) {
                console.error(err);
            }
        });
    }
}
