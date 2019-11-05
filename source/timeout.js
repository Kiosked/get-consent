const DEFAULT_ERROR_MESSAGE = "Timed-out waiting for result";

/**
 * Wrap a promise with a time-out that rejects the promise
 * chain if the desired time is reached
 * @param {Promise} promise The promise instance
 * @param {Number} timeout The timeout in milliseconds
 * @param {String=} errorMsg Error message for time-outs
 * @returns {Promise} A wrapped promise instance
 * @throws {TimeoutError} Throws if the promise execution
 *  times out
 * @private
 * @static
 */
export function timeoutPromise(promise, timeout, errorMsg = DEFAULT_ERROR_MESSAGE) {
    return new Promise((resolve, reject) => {
        promise
            .then(result => {
                clearTimeout(timer);
                resolve(result);
            })
            .catch(err => {
                clearTimeout(timer);
                reject(err);
            });
        const timer = setTimeout(() => {
            const err = new Error(errorMsg);
            err.name = "TimeoutError";
            reject(err);
        }, timeout);
    });
}
