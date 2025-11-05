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
export declare class Mutex {
    private readonly _deferreds;
    private _currentDeferred;
    /**
     * Creates a new mutex instance.
     */
    constructor();
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
    lock(): Promise<void>;
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
    release(): void;
}
//# sourceMappingURL=mutex.d.ts.map