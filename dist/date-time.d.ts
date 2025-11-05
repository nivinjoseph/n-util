import { Serializable } from "./serializable.js";
import { Duration } from "./duration.js";
import { Schema } from "./utility-types.js";
/**
 * A robust date and time handling system with timezone support.
 * This class provides comprehensive functionality for date/time manipulation, comparison, and formatting.
 *
 * @example
 * ```typescript
 * const now = DateTime.now("UTC");
 * const future = now.addTime(Duration.fromHours(2));
 * const isAfter = future.isAfter(now);
 * ```
 */
export declare class DateTime extends Serializable<DateTimeSchema> {
    private static readonly _format;
    private readonly _value;
    private readonly _zone;
    private readonly _dateTime;
    private readonly _timestamp;
    private readonly _dateCode;
    private readonly _timeCode;
    private readonly _dateValue;
    private readonly _timeValue;
    /**
     * Gets the system's local timezone.
     *
     * @returns The local timezone identifier.
     */
    static get currentZone(): string;
    /**
     * Gets the formatted date and time string.
     */
    get value(): string;
    /**
     * Gets the timezone identifier.
     */
    get zone(): string;
    /**
     * Gets the Unix timestamp in seconds.
     */
    get timestamp(): number;
    /**
     * Gets the date code in YYYYMMDD format.
     */
    get dateCode(): string;
    /**
     * Gets the time code in HHMM format.
     */
    get timeCode(): string;
    /**
     * Gets the date value in YYYY-MM-DD format.
     */
    get dateValue(): string;
    /**
     * Gets the time value in HH:mm format.
     */
    get timeValue(): string;
    /**
     * Gets whether this DateTime is in the past.
     */
    get isPast(): boolean;
    /**
     * Gets whether this DateTime is in the future.
     */
    get isFuture(): boolean;
    /**
     * Creates a new DateTime instance.
     *
     * @param data - The DateTime data containing value and zone.
     * @throws Error if the value or zone is invalid.
     */
    constructor(data: DateTimeSchema);
    /**
     * Creates a DateTime instance for the current time.
     *
     * @param zone - The timezone identifier. If not specified, UTC is used.
     * @returns A new DateTime instance representing the current time.
     */
    static now(zone?: string): DateTime;
    /**
     * Creates a DateTime from a Unix timestamp.
     *
     * @param timestamp - The number of seconds since the Unix epoch.
     * @param zone - The timezone identifier.
     * @returns A new DateTime instance.
     */
    static createFromTimestamp(timestamp: number, zone: string): DateTime;
    /**
     * Creates a DateTime from milliseconds since the Unix epoch.
     *
     * @param milliseconds - The number of milliseconds since the Unix epoch.
     * @param zone - The timezone identifier.
     * @returns A new DateTime instance.
     */
    static createFromMilliSecondsSinceEpoch(milliseconds: number, zone: string): DateTime;
    /**
     * Creates a DateTime from date and time codes.
     *
     * @param dateCode - The date code in YYYYMMDD format.
     * @param timeCode - The time code in HHMM format.
     * @param zone - The timezone identifier.
     * @returns A new DateTime instance.
     */
    static createFromCodes(dateCode: string, timeCode: string, zone: string): DateTime;
    /**
     * Creates a DateTime from date and time values.
     *
     * @param dateValue - The date in YYYY-MM-DD format.
     * @param timeValue - The time in HH:mm format.
     * @param zone - The timezone identifier.
     * @returns A new DateTime instance.
     */
    static createFromValues(dateValue: string, timeValue: string, zone: string): DateTime;
    /**
     * Returns the earlier of two DateTime instances.
     *
     * @param dateTime1 - The first DateTime instance.
     * @param dateTime2 - The second DateTime instance.
     * @returns The earlier DateTime instance.
     */
    static min(dateTime1: DateTime, dateTime2: DateTime): DateTime;
    /**
     * Returns the later of two DateTime instances.
     *
     * @param dateTime1 - The first DateTime instance.
     * @param dateTime2 - The second DateTime instance.
     * @returns The later DateTime instance.
     */
    static max(dateTime1: DateTime, dateTime2: DateTime): DateTime;
    /**
     * Validates if a string matches the DateTime format "yyyy-MM-dd HH:mm".
     *
     * @param value - The string to validate.
     * @returns True if the string matches the format, false otherwise.
     */
    static validateDateTimeFormat(value: string): boolean;
    /**
     * Validates if a string matches the date format "yyyy-MM-dd".
     *
     * @param value - The string to validate.
     * @returns True if the string matches the format, false otherwise.
     */
    static validateDateFormat(value: string): boolean;
    /**
     * Validates if a string matches the time format  "HH:mm".
     *
     * @param value - The string to validate.
     * @returns True if the string matches the format, false otherwise.
     */
    static validateTimeFormat(value: string): boolean;
    /**
     * Validates if a string is a valid timezone.
     *
     * @param zone - The timezone string to validate.
     * @returns True if the timezone is valid, false otherwise.
     */
    static validateTimeZone(zone: string): boolean;
    /**
     * Validates a timezone string.
     *
     * @param zone - The timezone string to validate.
     * @throws Error if the timezone is invalid.
     * @private
     */
    private static _validateZone;
    /**
     * Gets the numeric value of this DateTime.
     *
     * @returns The milliseconds since the Unix epoch.
     */
    valueOf(): number;
    /**
     * Compares this DateTime with another for equality.
     *
     * @param value - The DateTime to compare with.
     * @returns True if the DateTime instances are equal, false otherwise.
     */
    equals(value?: DateTime | null): boolean;
    /**
     * Returns the string representation of this DateTime.
     *
     * @returns The string representation in the format "YYYY-MM-DD HH:mm zone".
     */
    toString(): string;
    /**
     * Returns the date and time string.
     *
     * @returns The string in the format "YYYY-MM-DD HH:mm".
     */
    toStringDateTime(): string;
    /**
     * Returns the ISO string representation.
     *
     * @returns The ISO 8601 string representation.
     */
    toStringISO(): string;
    /**
     * Checks if this DateTime represents the same instant as another.
     *
     * @param value - The DateTime to compare with.
     * @returns True if the DateTime instances represent the same instant, false otherwise.
     */
    isSame(value: DateTime): boolean;
    /**
     * Checks if this DateTime is before another.
     *
     * @param value - The DateTime to compare with.
     * @returns True if this DateTime is before the other, false otherwise.
     */
    isBefore(value: DateTime): boolean;
    /**
     * Checks if this DateTime is the same or before another.
     *
     * @param value - The DateTime to compare with.
     * @returns True if this DateTime is the same or before the other, false otherwise.
     */
    isSameOrBefore(value: DateTime): boolean;
    /**
     * Checks if this DateTime is after another.
     *
     * @param value - The DateTime to compare with.
     * @returns True if this DateTime is after the other, false otherwise.
     */
    isAfter(value: DateTime): boolean;
    /**
     * Checks if this DateTime is the same or after another.
     *
     * @param value - The DateTime to compare with.
     * @returns True if this DateTime is the same or after the other, false otherwise.
     */
    isSameOrAfter(value: DateTime): boolean;
    /**
     * Checks if this DateTime is between two others.
     *
     * @param start - The start DateTime.
     * @param end - The end DateTime.
     * @returns True if this DateTime is between start and end, false otherwise.
     * @throws Error if end is before start.
     */
    isBetween(start: DateTime, end: DateTime): boolean;
    /**
     * Calculates the time difference between this DateTime and another.
     *
     * @param value - The DateTime to compare with.
     * @returns A Duration representing the time difference.
     */
    timeDiff(value: DateTime): Duration;
    /**
     * Calculates the days difference between this DateTime and another.
     *
     * @param value - The DateTime to compare with.
     * @returns The number of days difference.
     */
    daysDiff(value: DateTime): number;
    /**
     * Checks if this DateTime is on the same day as another.
     *
     * @param value - The DateTime to compare with.
     * @returns True if the DateTime instances are on the same day, false otherwise.
     */
    isSameDay(value: DateTime): boolean;
    /**
     * Adds a duration to this DateTime. this accounts for shift in DST
     *
     * @param time - The duration to add.
     * @returns A new DateTime instance with the duration added.
     */
    addTime(time: Duration): DateTime;
    /**
     * Subtracts a duration from this DateTime. this accounts for shift in DST
     *
     * @param time - The duration to subtract.
     * @returns A new DateTime instance with the duration subtracted.
     */
    subtractTime(time: Duration): DateTime;
    /**
     * Adds days to this DateTime. this doesn't change time based on DST
     *
     * @param days - The number of days to add.
     * @returns A new DateTime instance with the days added.
     * @throws Error if days is not a positive integer.
     */
    addDays(days: number): DateTime;
    /**
     * Subtracts days from this DateTime. this doesn't change time based on DST
     *
     * @param days - The number of days to subtract.
     * @returns A new DateTime instance with the days subtracted.
     * @throws Error if days is not a positive integer.
     */
    subtractDays(days: number): DateTime;
    /**
     * Gets an array of DateTime instances for each day of the month.
     *
     * @returns An array of DateTime instances, where:
     * - First element is the start of the month (e.g., "2023-06-01 00:00")
     * - Last element is the end of the month (e.g., "2023-06-30 23:59")
     * - Elements in between represent the start of each day (e.g., "2023-06-11 00:00")
     */
    getDaysOfMonth(): Array<DateTime>;
    /**
     * Converts this DateTime to a different timezone.
     *
     * @param zone - The target timezone.
     * @returns A new DateTime instance in the specified timezone.
     * @throws Error if the timezone is invalid.
     */
    convertToZone(zone: string): DateTime;
    /**
     * Checks if this DateTime is within a time range.
     *
     * @param startTimeCode - The start time code in HHMM format.
     * @param endTimeCode - The end time code in HHMM format.
     * @returns True if this DateTime is within the time range, false otherwise.
     * @throws Error if the time codes are invalid or if endTimeCode is before startTimeCode.
     */
    isWithinTimeRange(startTimeCode: string, endTimeCode: string): boolean;
}
/**
 * Schema type for DateTime serialization.
 */
export type DateTimeSchema = Schema<DateTime, "value" | "zone">;
//# sourceMappingURL=date-time.d.ts.map