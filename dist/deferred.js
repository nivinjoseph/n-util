/**
 * A class that provides external control over a Promise.
 * Allows resolving or rejecting a Promise from outside its constructor.
 *
 * @remarks
 * This is particularly useful when you need to control a Promise's
 * resolution or rejection from a different scope than where it was created.
 *
 * @typeParam T - The type of the value that the Promise will resolve with
 */
export class Deferred {
    _promise;
    _resolve;
    _reject;
    /**
     * Gets the underlying Promise that can be awaited.
     */
    get promise() { return this._promise; }
    /**
     * Creates a new Deferred instance.
     * The underlying Promise is created immediately.
     */
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    /**
     * Resolves the underlying Promise with the given value.
     *
     * @param value - The value to resolve the Promise with
     */
    resolve(value) {
        this._resolve(value);
    }
    /**
     * Rejects the underlying Promise with the given reason.
     *
     * @param reason - The reason for rejection (optional)
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    reject(reason) {
        this._reject(reason);
    }
}
//# sourceMappingURL=deferred.js.map