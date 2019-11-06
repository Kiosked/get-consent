/**
 * Expand timing expressions to an array of timing values
 * @param {Array.<String|Number>} timings Timings array
 * @returns {Number[]} Array of timing values
 * @private
 */
export function expandTimings(timings) {
    if (typeof timings === "number") {
        return timings;
    } else if (!Array.isArray) {
        throw new Error(`Failed expanding timings: Value not a number or array: ${timings}`);
    }
    const computedTimings = [];
    timings.forEach(raw => {
        if (typeof raw === "number") {
            computedTimings.push(raw);
            return;
        }
        const [count, delay] = raw.split(/x/i);
        if (!count || count <= 0 || !/^\d+$/.test(delay)) {
            throw new Error(
                `Failed expanding timings: Expected (count)x(delay), got: ${count}x${delay}`
            );
        }
        for (let i = 0; i < parseInt(count, 10); i += 1) {
            computedTimings.push(parseInt(delay, 10));
        }
    });
    return computedTimings;
}

/**
 * Start a dynamic timer
 * @param {Function} cb Method to call for timer events
 * @param {Array.<String|Number>} timings Timings array
 * @returns {Object} Timer instance
 * @private
 */
export function startTimer(cb, timings) {
    const timer = {
        enabled: true,
        jsTimer: null
    };
    const timingArr = expandTimings(timings);
    const run = () => {
        if (!timer.enabled) {
            return;
        }
        const nextTime = timingArr.length > 1 ? timingArr.shift() : timingArr[0];
        timer.jsTimer = setTimeout(() => {
            try {
                cb();
            } catch (err) {
                console.error(err);
            }
            run();
        }, nextTime);
    };
    run();
    return timer;
}

/**
 * Stop a timer instance
 * @param {Object} timer Timer instance
 * @private
 */
export function stopTimer(timer) {
    timer.enabled = false;
    clearTimeout(timer.jsTimer);
}
