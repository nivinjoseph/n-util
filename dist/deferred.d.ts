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
export declare class Deferred<T> {
    private readonly _promise;
    private _resolve;
    private _reject;
    /**
     * Gets the underlying Promise that can be awaited.
     */
    get promise(): Promise<T>;
    /**
     * Creates a new Deferred instance.
     * The underlying Promise is created immediately.
     */
    constructor();
    /**
     * Resolves the underlying Promise with the given value.
     *
     * @param value - The value to resolve the Promise with
     */
    resolve(value: T): void;
    /**
     * Rejects the underlying Promise with the given reason.
     *
     * @param reason - The reason for rejection (optional)
     */
    reject(reason?: any): void;
}
//# sourceMappingURL=deferred.d.ts.map