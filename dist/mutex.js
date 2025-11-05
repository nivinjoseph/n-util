import { Deferred } from "./deferred.js";
/**
 * A simple implementation of a mutual exclusion lock for coordinating access to shared resources
 * in asynchronous code. Ensures that only one piece of code can access a protected resource
 * at a time, preventing race conditions in concurrent operations.
 *
 * @example
 * ```typescript
 * const mutex = new Mutex();
 *
 * async function protectedOperation() {
 *     await mutex.lock();
 *     try {
 *         // Critical section
 *         await doSomething();
 *     } finally {
 *         mutex.release();
 *     }
 * }
 * ```
 */
export class Mutex {
    _deferreds;
    _currentDeferred;
    /**
     * Creates a new mutex instance.
     */
    constructor() {
        this._deferreds = new Array();
        this._currentDeferred = null;
    }
    /**
     * Acquires the mutex lock. Returns a promise that resolves when the lock is acquired.
     * If the mutex is available, the promise resolves immediately. If the mutex is locked,
     * the promise resolves when the lock becomes available. Multiple calls to lock() will
     * be queued in FIFO order.
     *
     * @returns A promise that resolves when the lock is acquired
     *
     * @example
     * ```typescript
     * await mutex.lock();
     * try {
     *     // Critical section
     * } finally {
     *     mutex.release();
     * }
     * ```
     */
    lock() {
        const deferred = new Deferred();
        this._deferreds.push(deferred);
        if (this._deferreds.length === 1) {
            this._currentDeferred = deferred;
            this._currentDeferred.resolve();
        }
        return deferred.promise;
    }
    /**
     * Releases the mutex lock. If there are waiting operations, the next one in the queue
     * will acquire the lock. If no operations are waiting, the mutex becomes available.
     * This method should be called in a finally block to ensure the lock is always released.
     *
     * @example
     * ```typescript
     * await mutex.lock();
     * try {
     *     // Critical section
     * } finally {
     *     mutex.release();
     * }
     * ```
     */
    release() {
        if (this._currentDeferred == null)
            return;
        this._deferreds.remove(this._currentDeferred);
        this._currentDeferred = this._deferreds[0] || null;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._currentDeferred != null)
            this._currentDeferred.resolve();
    }
}
//# sourceMappingURL=mutex.js.map