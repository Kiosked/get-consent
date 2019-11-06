/**
 * @typedef {Array} Mem Memoized function collection
 */

/**
 * Create a new memoization instance
 * @returns {Mem}
 */
export function createMem() {
    return [];
}

/**
 * Fetch a memoized value from a mem collection
 * @param {Mem} memInst The mem instance
 * @param {Function} meth The memoized method
 * @param {Array.<*>} cacheKeys Array of keys used to distinguish
 *  cached items
 * @returns {null|*} Returns null if no value found, or the value
 *  of the memoized method if it exists
 * @private
 */
function getMem(memInst, meth, cacheKeys) {
    for (let i = 0; i < memInst.length; i += 1) {
        if (memInst[i].m === meth && keysMatch(cacheKeys, memInst[i].k)) {
            return memInst[i].c;
        }
    }
    return null;
}

/**
 * Compare two cache-keys sets for equivalency
 * @param {Array.<*>} set1 A set of cache keys
 * @param {Array.<*>} set2 A set of cache keys
 * @returns {Boolean} True if sets match, false otherwise. Values
 *  are compared with strict equivalence (===).
 * @private
 */
function keysMatch(set1, set2) {
    return set1.length === set2.length && set1.every((item, ind) => set2[ind] === item);
}

/**
 * Execute a memoization action, returning a cached value if one
 * is available or calling the method if one is not
 * @param {Mem} memInst The mem instance
 * @param {Function} meth The function to memoize
 * @param {Array.<*>} args Array of function arguments
 * @param {Array.<*>} cacheKeys Array of keys used to distinguish
 *  cached items
 * @returns {*} Returns a cached result
 */
export function mem(memInst, meth, args, cacheKeys) {
    const cachedResult = getMem(memInst, meth, cacheKeys);
    if (cachedResult) {
        return cachedResult;
    }
    const newResult = meth.apply(null, args);
    memInst.push({
        m: meth,
        a: args,
        k: cacheKeys,
        c: newResult
    });
    return newResult;
}
