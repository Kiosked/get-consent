function timeoutPromise(promise, timeout, errorMsg) {
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

module.exports = {
    timeoutPromise
};
