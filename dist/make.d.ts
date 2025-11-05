/**
 * Utility class providing various helper methods for common programming patterns
 * including retry logic, async/sync conversion, error handling, and random value generation.
 *
 * @example
 * ```typescript
 * // Retry example
 * const retryFetch = Make.retry(fetchData, 3);
 * const data = await retryFetch("https://api.example.com/data");
 *
 * // Random generation example
 * const code = Make.randomCode(8);
 * ```
 */
export declare abstract class Make {
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    private constructor();
    /**
     * Creates a retry wrapper for an async function that will retry the operation
     * a specified number of times if it fails.
     *
     * @template T - The return type of the function
     * @param func - The async function to retry
     * @param numberOfRetries - Number of retry attempts
     * @param errorPredicate - Optional function to determine if an error should trigger a retry
     * @returns A new function that wraps the original with retry logic
     *
     * @example
     * ```typescript
     * const retryFetch = Make.retry(fetchData, 3);
     * const data = await retryFetch("https://api.example.com/data");
     * ```
     */
    static retry<T>(func: (...params: Array<any>) => Promise<T>, numberOfRetries: number, errorPredicate?: (error: any) => boolean): (...params: Array<any>) => Promise<T>;
    /**
     * Creates a retry wrapper with a fixed delay between attempts.
     *
     * @template T - The return type of the function
     * @param func - The async function to retry
     * @param numberOfRetries - Number of retry attempts
     * @param delayMS - Delay in milliseconds between attempts
     * @param errorPredicate - Optional function to determine if an error should trigger a retry
     * @returns A new function that wraps the original with retry and delay logic
     *
     * @example
     * ```typescript
     * const retryWithDelay = Make.retryWithDelay(fetchData, 3, 1000);
     * const data = await retryWithDelay("https://api.example.com/data");
     * ```
     */
    static retryWithDelay<T>(func: (...params: Array<any>) => Promise<T>, numberOfRetries: number, delayMS: number, errorPredicate?: (error: any) => boolean): (...params: Array<any>) => Promise<T>;
    /**
     * Creates a retry wrapper with exponential backoff between attempts.
     *
     * @template T - The return type of the function
     * @param func - The async function to retry
     * @param numberOfRetries - Number of retry attempts
     * @param errorPredicate - Optional function to determine if an error should trigger a retry
     * @returns A new function that wraps the original with exponential backoff retry logic
     *
     * @example
     * ```typescript
     * const retryWithBackoff = Make.retryWithExponentialBackoff(fetchData, 3);
     * const data = await retryWithBackoff("https://api.example.com/data");
     * ```
     */
    static retryWithExponentialBackoff<T>(func: (...params: Array<any>) => Promise<T>, numberOfRetries: number, errorPredicate?: (error: any) => boolean): (...params: Array<any>) => Promise<T>;
    /**
     * Converts a synchronous function to an async function.
     *
     * @template T - The return type of the function
     * @param func - The synchronous function to convert
     * @returns An async version of the function
     *
     * @example
     * ```typescript
     * const syncFunc = (x) => x * 2;
     * const asyncFunc = Make.syncToAsync(syncFunc);
     * const result = await asyncFunc(5); // 10
     * ```
     */
    static syncToAsync<T>(func: (...params: Array<any>) => T): (...params: Array<any>) => Promise<T>;
    /**
     * Converts a callback-style function to a promise-based function.
     *
     * @template T - The return type of the promise
     * @param func - The callback-style function to convert
     * @returns A promise-based version of the function
     *
     * @example
     * ```typescript
     * const callbackFunc = (x, callback) => callback(null, x * 2);
     * const promiseFunc = Make.callbackToPromise(callbackFunc);
     * const result = await promiseFunc(5); // 10
     * ```
     */
    static callbackToPromise<T>(func: (...params: Array<any>) => void): (...params: Array<any>) => Promise<T>;
    /**
     * Executes a function a specified number of times.
     *
     * @param func - The function to execute
     * @param numberOfTimes - Number of times to execute the function
     *
     * @example
     * ```typescript
     * Make.loop((index) => console.log(index), 5);
     * ```
     */
    static loop(func: (index: number) => void, numberOfTimes: number): void;
    /**
     * Executes an async function multiple times with optional parallelism.
     *
     * @param asyncFunc - The async function to execute
     * @param numberOfTimes - Number of times to execute the function
     * @param degreesOfParallelism - Optional number of concurrent executions
     *
     * @example
     * ```typescript
     * await Make.loopAsync(async (index) => {
     *     await processItem(index);
     * }, 10, 3); // Process 10 items with max 3 concurrent
     * ```
     */
    static loopAsync(asyncFunc: (index: number) => Promise<void>, numberOfTimes: number, degreesOfParallelism?: number): Promise<void>;
    /**
     * Creates an error-suppressed version of a function that returns a default value on error.
     *
     * @template T - The function type
     * @template U - The return type
     * @param func - The function to wrap
     * @param defaultValue - Optional default value to return on error
     * @returns An error-suppressed version of the function
     *
     * @example
     * ```typescript
     * const safeFunc = Make.errorSuppressed(riskyFunc, "default");
     * const result = safeFunc(); // Returns "default" if error occurs
     * ```
     */
    static errorSuppressed<T extends (...params: Array<any>) => U, U>(func: T, defaultValue?: U | null): T;
    /**
     * Creates an error-suppressed version of an async function that returns a default value on error.
     *
     * @template T - The function type
     * @template U - The return type
     * @param asyncFunc - The async function to wrap
     * @param defaultValue - Optional default value to return on error
     * @returns An error-suppressed version of the async function
     *
     * @example
     * ```typescript
     * const safeAsyncFunc = Make.errorSuppressedAsync(riskyAsyncFunc, "default");
     * const result = await safeAsyncFunc(); // Returns "default" if error occurs
     * ```
     */
    static errorSuppressedAsync<T extends (...params: Array<any>) => Promise<U>, U>(asyncFunc: T, defaultValue?: U | null): T;
    /**
     * Generates a random integer between min (inclusive) and max (exclusive).
     *
     * @param min - Minimum value (inclusive)
     * @param max - Maximum value (exclusive)
     * @returns A random integer
     *
     * @example
     * ```typescript
     * const random = Make.randomInt(1, 100); // 1 to 99
     * ```
     */
    static randomInt(min: number, max: number): number;
    /**
     * Generates a random alphanumeric code of specified length.
     *
     * @param numChars - Number of characters in the code
     * @returns A random alphanumeric string
     *
     * @example
     * ```typescript
     * const code = Make.randomCode(8); // 8-character code
     * ```
     */
    static randomCode(numChars: number): string;
    /**
     * Generates a random text code of specified length.
     *
     * @param numChars - Number of characters in the code
     * @param caseInsensitive - Whether to use only lowercase letters
     * @returns A random text string
     *
     * @example
     * ```typescript
     * const code = Make.randomTextCode(6); // 6-letter code
     * const lowercaseCode = Make.randomTextCode(6, true); // Lowercase only
     * ```
     */
    static randomTextCode(numChars: number, caseInsensitive?: boolean): string;
    /**
     * Generates a random numeric code of specified length.
     *
     * @param numChars - Number of digits in the code
     * @returns A random numeric string
     *
     * @example
     * ```typescript
     * const code = Make.randomNumericCode(4); // 4-digit code
     * ```
     */
    static randomNumericCode(numChars: number): string;
}
//# sourceMappingURL=make.d.ts.map