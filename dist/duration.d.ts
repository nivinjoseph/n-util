/**
 * A class for handling time durations in various units.
 * Provides methods for creating durations in different units (milliseconds, seconds, minutes, hours, days, weeks)
 * and converting between them with optional rounding.
 *
 * @example
 * ```typescript
 * const duration = Duration.fromHours(2.5);
 * const minutes = duration.toMinutes(); // 150
 * const roundedMinutes = duration.toMinutes(true); // 150
 * ```
 */
export declare class Duration {
    private readonly _ms;
    /**
     * Creates a new Duration instance.
     *
     * @param ms - The duration in milliseconds.
     * @throws Error if ms is negative.
     * @private
     */
    private constructor();
    /**
     * Creates a Duration from milliseconds.
     *
     * @param milliSeconds - The duration in milliseconds.
     * @returns A new Duration instance.
     * @throws Error if milliSeconds is negative.
     */
    static fromMilliSeconds(milliSeconds: number): Duration;
    /**
     * Creates a Duration from seconds.
     *
     * @param seconds - The duration in seconds.
     * @returns A new Duration instance.
     * @throws Error if seconds is negative.
     */
    static fromSeconds(seconds: number): Duration;
    /**
     * Creates a Duration from minutes.
     *
     * @param minutes - The duration in minutes.
     * @returns A new Duration instance.
     * @throws Error if minutes is negative.
     */
    static fromMinutes(minutes: number): Duration;
    /**
     * Creates a Duration from hours.
     *
     * @param hours - The duration in hours.
     * @returns A new Duration instance.
     * @throws Error if hours is negative.
     */
    static fromHours(hours: number): Duration;
    /**
     * Creates a Duration from days.
     *
     * @param days - The duration in days.
     * @returns A new Duration instance.
     * @throws Error if days is negative.
     */
    static fromDays(days: number): Duration;
    /**
     * Creates a Duration from weeks.
     *
     * @param weeks - The duration in weeks.
     * @returns A new Duration instance.
     * @throws Error if weeks is negative.
     */
    static fromWeeks(weeks: number): Duration;
    /**
     * Converts the duration to milliseconds.
     *
     * @param round - Whether to round the result to the nearest integer.
     * @returns The duration in milliseconds.
     */
    toMilliSeconds(round?: boolean): number;
    /**
     * Converts the duration to seconds.
     *
     * @param round - Whether to round the result to the nearest integer.
     * @returns The duration in seconds.
     */
    toSeconds(round?: boolean): number;
    /**
     * Converts the duration to minutes.
     *
     * @param round - Whether to round the result to the nearest integer.
     * @returns The duration in minutes.
     */
    toMinutes(round?: boolean): number;
    /**
     * Converts the duration to hours.
     *
     * @param round - Whether to round the result to the nearest integer.
     * @returns The duration in hours.
     */
    toHours(round?: boolean): number;
    /**
     * Converts the duration to days.
     *
     * @param round - Whether to round the result to the nearest integer.
     * @returns The duration in days.
     */
    toDays(round?: boolean): number;
    /**
     * Converts the duration to weeks.
     *
     * @param round - Whether to round the result to the nearest integer.
     * @returns The duration in weeks.
     */
    toWeeks(round?: boolean): number;
}
//# sourceMappingURL=duration.d.ts.map