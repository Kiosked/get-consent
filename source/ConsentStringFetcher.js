import { startTimer, stopTimer } from "./timer.js";

const CALLBACKS = ["cmpDetected", "consentData", "consentString"];

/**
 * Timing values for checking if the __cmp() method is available
 * @private
 */
const CMP_CHECK_TIMINGS = [0, 50, 100, "2x200", "3x300", "10x500", "10x750", 1000];

/**
 * GDPR consent data
 * @typedef {Object} CMPConsentData
 * @property {String} consentData - GDPR consent string
 * @property {Boolean} gdprApplies - Whether GDPR applies in the current context
 * @property {Boolean} hasGlobalScope - "true if the vendor consent data is retrieved from the global cookie, false if from a publisher-specific (or publisher-group-specific) cookie"
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
                    return;
                }
                fetcher._lastSuccessfulData = Object.assign({}, consentPayload);
                fetcher._fireCallback("consentData", fetcher._lastSuccessfulData);
                fetcher._fireCallback("consentString", consentPayload.consentData);
            });
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
        this._lastSuccessfulData = null;
        this._cmpDetected = false;
        this._callbacks = CALLBACKS.reduce((out, cbName) => ({ ...out, [cbName]: [] }), {});
        this._alive = true;
        initFetcher(this);
    }

    /**
     * The last successfully fetched consent data object
     * @type {CMPConsentData|null}
     * @memberof ConsentStringFetcher
     * @readonly
     */
    get consentData() {
        return this._lastSuccessfulData ? Object.freeze(this._lastSuccessfulData) : null;
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
     * @returns {Promise} A promise that resolves once a CMP has been detected
     * @memberof ConsentStringFetcher
     */
    waitForCMP() {
        return new Promise(resolve => {
            if (this._cmpDetected) {
                return resolve();
            }
            const { remove } = this.on("cmpDetected", () => {
                remove();
                resolve();
            });
        });
    }

    /**
     * Wait for consent data
     * @returns {Promise.<CMPConsentData>} Promise that resolves with consent data
     *  from the CMP system. Be aware that the promise may never resolve if consent
     *  data is never received.
     * @memberof ConsentStringFetcher
     */
    waitForConsent() {
        return new Promise(resolve => {
            if (this.consentData) {
                return resolve(this.consentData);
            }
            const { remove } = this.on("consentData", data => {
                remove();
                resolve(data);
            });
        });
    }

    /**
     * Wait for a consent string
     * @returns {Promise.<String>} Promise that resolves with a consent string
     *  from the CMP system.
     * @see waitForConsent
     * @memberof ConsentStringFetcher
     */
    waitForConsentString() {
        return this.waitForConsent().then(data => data.consentData);
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
        this._callbacks[type].forEach(cb => {
            try {
                cb(data);
            } catch (err) {
                console.error(err);
            }
        });
    }
}
