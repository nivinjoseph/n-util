/**
 * A utility class for creating time-based delays in asynchronous code.
 * Provides methods for creating delays in different time units with optional cancellation.
 *
 * @remarks
 * All methods are static and return Promises that can be awaited.
 * The class supports delays in hours, minutes, seconds, and milliseconds.
 */
export declare abstract class Delay {
    /**
     * Creates a delay for the specified number of hours.
     *
     * @param value - Number of hours to delay (must be >= 0)
     * @param canceller - Optional cancellation object
     * @returns Promise that resolves after the delay
     * @throws Error if value is negative
     */
    static hours(value: number, canceller?: DelayCanceller): Promise<void>;
    /**
     * Creates a delay for the specified number of minutes.
     *
     * @param value - Number of minutes to delay (must be >= 0)
     * @param canceller - Optional cancellation object
     * @returns Promise that resolves after the delay
     * @throws Error if value is negative
     */
    static minutes(value: number, canceller?: DelayCanceller): Promise<void>;
    /**
     * Creates a delay for the specified number of seconds.
     *
     * @param value - Number of seconds to delay (must be >= 0)
     * @param canceller - Optional cancellation object
     * @returns Promise that resolves after the delay
     * @throws Error if value is negative
     */
    static seconds(value: number, canceller?: DelayCanceller): Promise<void>;
    /**
     * Creates a delay for the specified number of milliseconds.
     *
     * @param value - Number of milliseconds to delay (must be >= 0)
     * @param canceller - Optional cancellation object
     * @returns Promise that resolves after the delay
     * @throws Error if value is negative
     */
    static milliseconds(value: number, canceller?: DelayCanceller): Promise<void>;
}
/**
 * Type for the cancellation object that can be used to cancel a delay.
 *
 * @remarks
 * The cancel method is optional and can be called to cancel an ongoing delay.
 */
export type DelayCanceller = {
    cancel?(): void;
};
//# sourceMappingURL=delay.d.ts.map