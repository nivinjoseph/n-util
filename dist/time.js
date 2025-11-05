import { given } from "@nivinjoseph/n-defensive";
/**
 * Utility class for working with timestamps and time comparisons.
 * Implements a singleton pattern and provides static methods for checking if a timestamp is in the past or future.
 *
 * @example
 * ```typescript
 * // Check if a timestamp is in the past
 * const pastTime = Date.now() - 1000; // 1 second ago
 * console.log(Time.isPast(pastTime)); // true
 *
 * // Check if a timestamp is in the future
 * const futureTime = Date.now() + 1000; // 1 second from now
 * console.log(Time.isFuture(futureTime)); // true
 * ```
 */
export class Time {
    /**
     * Private constructor to prevent instantiation.
     * @private
     */
    constructor() { }
    /**
     * Checks if a given timestamp is in the past.
     *
     * @param time - A timestamp in milliseconds since the Unix epoch
     * @returns `true` if the timestamp is in the past, `false` otherwise
     * @throws Error if the input is not a valid number
     *
     * @example
     * ```typescript
     * const timestamp = Date.now() - 1000; // 1 second ago
     * console.log(Time.isPast(timestamp)); // true
     * ```
     */
    static isPast(time) {
        given(time, "time").ensureHasValue().ensureIsNumber();
        return time < Date.now();
    }
    /**
     * Checks if a given timestamp is in the future.
     *
     * @param time - A timestamp in milliseconds since the Unix epoch
     * @returns `true` if the timestamp is in the future, `false` otherwise
     * @throws Error if the input is not a valid number
     *
     * @example
     * ```typescript
     * const timestamp = Date.now() + 1000; // 1 second from now
     * console.log(Time.isFuture(timestamp)); // true
     * ```
     */
    static isFuture(time) {
        given(time, "time").ensureHasValue().ensureIsNumber();
        return time > Date.now();
    }
}
//# sourceMappingURL=time.js.map