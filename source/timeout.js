const DEFAULT_ERROR_MESSAGE = "Timed-out waiting for result";

/**
 * @typedef {Object} TimeoutTrigger
 */

/**
 * Create a new timeout trigger
 * - Used to pass to `timeoutPromise`
 * so timeout periods can be initiated
 * later
 * @returns {TimeoutTrigger}
 */
export function createTimeoutTrigger() {
    const trigger = {
        /**
         * Array of callbacks
         * @protected
         * @type {Function[]}
         * @memberof TimeoutTrigger
         */
        _cbs: [],
        /**
         * Whether or not the trigger is active
         * @memberof TimeoutTrigger
         * @type {Boolean}
         */
        active: false,
        /**
         * Function to activate the trigger
         * @memberof TimeoutTrigger
         * @type {Function}
         */
        activate: () => {
            if (trigger.active) {
                return;
            }
            trigger.active = true;
            trigger._cbs.forEach(cb => cb());
        }
    };
    return trigger;
}

/**
 * @typedef {Object} TimeoutPromiseOptions
 * @property {String=} errorMsg Error message for time-outs
 */

/**
 * Wrap a promise with a time-out that rejects the promise
 * chain if the desired time is reached
 * @param {Promise} promise The promise instance
 * @param {Number} timeout The timeout in milliseconds
 * @param {TimeoutPromiseOptions=} options Configuration
 *  options for the timeout
 * @returns {Promise} A wrapped promise instance
 * @throws {TimeoutError} Throws if the promise execution
 *  times out
 * @private
 * @static
 */
export function timeoutPromise(promise, timeout, options = {}) {
    const { errorMsg = DEFAULT_ERROR_MESSAGE, trigger = null } = options;
    let timer,
        live = true;
    return new Promise((resolve, reject) => {
        const initTimeout = () => {
            if (!live) {
                return;
            }
            timer = setTimeout(() => {
                const err = new Error(errorMsg);
                err.name = "TimeoutError";
                reject(err);
            }, timeout);
        };
        promise
            .then(result => {
                live = false;
                clearTimeout(timer);
                resolve(result);
            })
            .catch(err => {
                live = false;
                clearTimeout(timer);
                reject(err);
            });
        if (!trigger || trigger.active) {
            initTimeout();
        } else if (trigger) {
            trigger._cbs.push(initTimeout);
        }
    });
}
