import { given } from "@nivinjoseph/n-defensive";
import { DateTime as LuxonDateTime, Interval as LuxonInterval } from "luxon";
import { Serializable, serialize } from "./serializable.js";
import { Duration } from "./duration.js";
import { Schema } from "./utility-types.js";
import { TypeHelper } from "./type-helper.js";

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
@serialize("Nutil")
export class DateTime extends Serializable<DateTimeSchema>
{
    private static readonly _format = "yyyy-MM-dd HH:mm";

    private readonly _value: string;
    private readonly _zone: string;
    private readonly _dateTime: LuxonDateTime;
    private readonly _timestamp: number;
    private readonly _dateCode: string;
    private readonly _timeCode: string;
    private readonly _dateValue: string;
    private readonly _timeValue: string;


    /**
     * Gets the system's local timezone.
     * 
     * @returns The local timezone identifier.
     */
    public static get currentZone(): string { return LuxonDateTime.local().zoneName; }


    /**
     * Gets the formatted date and time string.
     */
    @serialize
    public get value(): string { return this._value; }

    /**
     * Gets the timezone identifier.
     */
    @serialize
    public get zone(): string { return this._zone; }

    /**
     * Gets the Unix timestamp in seconds.
     */
    public get timestamp(): number { return this._timestamp; }

    /**
     * Gets the date code in YYYYMMDD format.
     */
    public get dateCode(): string { return this._dateCode; }

    /**
     * Gets the time code in HHMM format.
     */
    public get timeCode(): string { return this._timeCode; }

    /**
     * Gets the date value in YYYY-MM-DD format.
     */
    public get dateValue(): string { return this._dateValue; }

    /**
     * Gets the time value in HH:mm format.
     */
    public get timeValue(): string { return this._timeValue; }

    /**
     * Gets whether this DateTime is in the past.
     */
    public get isPast(): boolean { return this.isBefore(DateTime.now()); }

    /**
     * Gets whether this DateTime is in the future.
     */
    public get isFuture(): boolean { return this.isAfter(DateTime.now()); }

    /**
     * Creates a new DateTime instance.
     * 
     * @param data - The DateTime data containing value and zone.
     * @throws Error if the value or zone is invalid.
     */
    public constructor(data: DateTimeSchema)
    {
        super(data);

        let { value, zone } = data;

        given(value, "value").ensureHasValue().ensureIsString();
        value = value.trim();

        given(zone, "zone").ensureHasValue().ensureIsString();
        zone = zone.trim();
        if (zone.toLowerCase() === "utc")
            zone = zone.toLowerCase();

        DateTime._validateZone(zone);

        const dateTime = LuxonDateTime.fromFormat(value, DateTime._format, { zone });
        given(data, "data").ensure(_ => dateTime.isValid, `value and zone is invalid (${dateTime.invalidReason}: ${dateTime.invalidExplanation})`);

        this._value = value;
        this._zone = zone;
        this._dateTime = dateTime;
        this._timestamp = this._dateTime.toUnixInteger();

        const [date, time] = this._value.split(" ");
        given(time, "time").ensure(t => t !== "24:00", "Time should not be 24:00");

        this._dateCode = date.split("-").join("");
        this._timeCode = time.split(":").join("");

        this._dateValue = date;
        this._timeValue = time;
    }


    /**
     * Creates a DateTime instance for the current time.
     * 
     * @param zone - The timezone identifier. If not specified, UTC is used.
     * @returns A new DateTime instance representing the current time.
     */
    public static now(zone?: string): DateTime
    {
        given(zone, "zone").ensureIsString();

        if (zone != null)
        {
            return new DateTime({
                value: LuxonDateTime.now().setZone(zone).toFormat(DateTime._format),
                zone
            });
        }
        else
        {
            return new DateTime({
                value: LuxonDateTime.utc().toFormat(DateTime._format),
                zone: "utc"
            });
        }
    }

    /**
     * Creates a DateTime from a Unix timestamp.
     * 
     * @param timestamp - The number of seconds since the Unix epoch.
     * @param zone - The timezone identifier.
     * @returns A new DateTime instance.
     */
    public static createFromTimestamp(timestamp: number, zone: string): DateTime
    {
        given(timestamp, "timestamp").ensureHasValue().ensureIsNumber();
        given(zone, "zone").ensureHasValue().ensureIsString();

        const dateTimeString = LuxonDateTime.fromSeconds(timestamp).setZone(zone).toFormat(this._format);
        return new DateTime({
            value: dateTimeString,
            zone
        });
    }

    /**
     * Creates a DateTime from milliseconds since the Unix epoch.
     * 
     * @param milliseconds - The number of milliseconds since the Unix epoch.
     * @param zone - The timezone identifier.
     * @returns A new DateTime instance.
     */
    public static createFromMilliSecondsSinceEpoch(milliseconds: number, zone: string): DateTime
    {
        given(milliseconds, "milliseconds").ensureHasValue().ensureIsNumber();
        given(zone, "zone").ensureHasValue().ensureIsString();

        const dateTimeString = LuxonDateTime.fromMillis(milliseconds).setZone(zone).toFormat(this._format);
        return new DateTime({
            value: dateTimeString,
            zone
        });
    }

    /**
     * Creates a DateTime from date and time codes.
     * 
     * @param dateCode - The date code in YYYYMMDD format.
     * @param timeCode - The time code in HHMM format.
     * @param zone - The timezone identifier.
     * @returns A new DateTime instance.
     */
    public static createFromCodes(dateCode: string, timeCode: string, zone: string): DateTime
    {
        given(dateCode, "dateCode").ensureHasValue().ensureIsString()
            .ensure(t => t.matchesFormat("########"));

        given(timeCode, "timeCode").ensureHasValue().ensureIsString()
            .ensure(t => t.matchesFormat("####"));

        given(zone, "zone").ensureHasValue().ensureIsString();

        const dateCodeSplit = dateCode.split("");
        const timeCodeSplit = timeCode.split("");

        const year = dateCodeSplit.take(4).join("");
        const month = dateCodeSplit.skip(4).take(2).join("");
        const day = dateCodeSplit.skip(6).join("");

        const hour = timeCodeSplit.take(2).join("");
        const minute = timeCodeSplit.skip(2).join("");

        const dateTimeString = `${year}-${month}-${day} ${hour}:${minute}`;

        return new DateTime({
            value: dateTimeString,
            zone
        });
    }

    /**
     * Creates a DateTime from date and time values.
     * 
     * @param dateValue - The date in YYYY-MM-DD format.
     * @param timeValue - The time in HH:mm format.
     * @param zone - The timezone identifier.
     * @returns A new DateTime instance.
     */
    public static createFromValues(dateValue: string, timeValue: string, zone: string): DateTime
    {
        given(dateValue, "dateValue").ensureHasValue().ensureIsString()
            .ensure(t => t.matchesFormat("####-##-##"));

        given(timeValue, "timeValue").ensureHasValue().ensureIsString()
            .ensure(t => t.matchesFormat("##:##"));

        given(zone, "zone").ensureHasValue().ensureIsString();

        const dateTimeString = `${dateValue} ${timeValue}`;

        return new DateTime({
            value: dateTimeString,
            zone
        });
    }

    /**
     * Returns the earlier of two DateTime instances.
     * 
     * @param dateTime1 - The first DateTime instance.
     * @param dateTime2 - The second DateTime instance.
     * @returns The earlier DateTime instance.
     */
    public static min(dateTime1: DateTime, dateTime2: DateTime): DateTime
    {
        given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
        given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime);

        if (dateTime1.valueOf() < dateTime2.valueOf())
            return dateTime1;

        return dateTime2;
    }

    /**
     * Returns the later of two DateTime instances.
     * 
     * @param dateTime1 - The first DateTime instance.
     * @param dateTime2 - The second DateTime instance.
     * @returns The later DateTime instance.
     */
    public static max(dateTime1: DateTime, dateTime2: DateTime): DateTime
    {
        given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
        given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime);

        if (dateTime1.valueOf() > dateTime2.valueOf())
            return dateTime1;

        return dateTime2;
    }

    /**
     * Validates if a string matches the DateTime format "yyyy-MM-dd HH:mm".
     * 
     * @param value - The string to validate.
     * @returns True if the string matches the format, false otherwise.
     */
    public static validateDateTimeFormat(value: string): boolean
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (value == null || value.isEmptyOrWhiteSpace())
            return false;

        return LuxonDateTime.fromFormat(value, DateTime._format).isValid;
    }

    /**
     * Validates if a string matches the date format "yyyy-MM-dd".
     * 
     * @param value - The string to validate.
     * @returns True if the string matches the format, false otherwise.
     */
    public static validateDateFormat(value: string): boolean
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (value == null || value.isEmptyOrWhiteSpace())
            return false;

        return LuxonDateTime.fromFormat(value, "yyyy-MM-dd").isValid;
    }

    /**
     * Validates if a string matches the time format  "HH:mm".
     * 
     * @param value - The string to validate.
     * @returns True if the string matches the format, false otherwise.
     */
    public static validateTimeFormat(value: string): boolean
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (value == null || value.isEmptyOrWhiteSpace())
            return false;

        return LuxonDateTime.fromFormat(value, "HH:mm").isValid;
    }

    /**
     * Validates if a string is a valid timezone.
     * 
     * @param zone - The timezone string to validate.
     * @returns True if the timezone is valid, false otherwise.
     */
    public static validateTimeZone(zone: string): boolean
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (zone == null || zone.isEmptyOrWhiteSpace())
            return false;

        try
        {
            DateTime._validateZone(zone);
        }
        catch
        {
            return false;
        }

        return LuxonDateTime.now().setZone(zone).isValid;
    }


    /**
     * Validates a timezone string.
     * 
     * @param zone - The timezone string to validate.
     * @throws Error if the timezone is invalid.
     * @private
     */
    private static _validateZone(zone: string): void
    {
        zone = zone.trim();

        if (zone.toLowerCase() === "utc")
            return;

        given(zone, "zone")
            .ensureWhen(
                zone.toLowerCase() === "local",
                _ => false,
                "should not use local zone")
            .ensureWhen(
                zone.toLowerCase().startsWith("utc+"),
                t =>
                {
                    // range is +00:00 to +14:00 (https://en.wikipedia.org/wiki/List_of_UTC_offsets)
                    let offset = t.split("+").takeLast().trim();

                    if (!offset.contains(":"))
                        offset = `${offset}:00`;

                    const [hour, minute] = offset.split(":").map(t => TypeHelper.parseNumber(t));

                    if (hour == null || minute == null)
                        return false;

                    return (hour >= 0 && hour < 14 && minute >= 0 && minute < 60)
                        || (hour === 14 && minute === 0);
                },
                "Invalid UTC offset for zone")
            .ensureWhen(
                zone.toLowerCase().startsWith("utc-"),
                t =>
                {
                    // range is -00:00 to -12:00 (https://en.wikipedia.org/wiki/List_of_UTC_offsets)
                    let offset = t.split("-").takeLast();

                    if (!offset.contains(":"))
                        offset = `${offset}:00`;

                    const [hour, minute] = offset.split(":").map(t => TypeHelper.parseNumber(t));

                    if (hour == null || minute == null)
                        return false;

                    return hour >= 0 && hour < 12 && minute >= 0 && minute < 60
                        || (hour === 12 && minute === 0);
                },
                "Invalid UTC offset for zone");
    }


    /**
     * Gets the numeric value of this DateTime.
     * 
     * @returns The milliseconds since the Unix epoch.
     */
    public override valueOf(): number
    {
        return this._dateTime.valueOf();
    }

    /**
     * Compares this DateTime with another for equality.
     * 
     * @param value - The DateTime to compare with.
     * @returns True if the DateTime instances are equal, false otherwise.
     */
    public equals(value?: DateTime | null): boolean
    {
        given(value, "value").ensureIsType(DateTime);

        if (value == null)
            return false;

        if (value === this)
            return true;

        return value.value === this._value && value.zone === this._zone;
    }

    /**
     * Returns the string representation of this DateTime.
     * 
     * @returns The string representation in the format "YYYY-MM-DD HH:mm zone".
     */
    public override toString(): string
    {
        return `${this._value} ${this._zone}`;
    }

    /**
     * Returns the date and time string.
     * 
     * @returns The string in the format "YYYY-MM-DD HH:mm".
     */
    public toStringDateTime(): string
    {
        return this._value;
    }

    /**
     * Returns the ISO string representation.
     * 
     * @returns The ISO 8601 string representation.
     */
    public toStringISO(): string
    {
        return this._dateTime.toISO({ format: "extended", includeOffset: true })!;
    }

    /**
     * Checks if this DateTime represents the same instant as another.
     * 
     * @param value - The DateTime to compare with.
     * @returns True if the DateTime instances represent the same instant, false otherwise.
     */
    public isSame(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() === value.valueOf();
    }

    /**
     * Checks if this DateTime is before another.
     * 
     * @param value - The DateTime to compare with.
     * @returns True if this DateTime is before the other, false otherwise.
     */
    public isBefore(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() < value.valueOf();
    }

    /**
     * Checks if this DateTime is the same or before another.
     * 
     * @param value - The DateTime to compare with.
     * @returns True if this DateTime is the same or before the other, false otherwise.
     */
    public isSameOrBefore(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() <= value.valueOf();
    }

    /**
     * Checks if this DateTime is after another.
     * 
     * @param value - The DateTime to compare with.
     * @returns True if this DateTime is after the other, false otherwise.
     */
    public isAfter(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() > value.valueOf();
    }

    /**
     * Checks if this DateTime is the same or after another.
     * 
     * @param value - The DateTime to compare with.
     * @returns True if this DateTime is the same or after the other, false otherwise.
     */
    public isSameOrAfter(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() >= value.valueOf();
    }

    /**
     * Checks if this DateTime is between two others.
     * 
     * @param start - The start DateTime.
     * @param end - The end DateTime.
     * @returns True if this DateTime is between start and end, false otherwise.
     * @throws Error if end is before start.
     */
    public isBetween(start: DateTime, end: DateTime): boolean
    {
        given(start, "start").ensureHasValue().ensureIsType(DateTime);
        given(end, "end").ensureHasValue().ensureIsType(DateTime)
            .ensure(t => t.isSameOrAfter(start), "must be same or after start");

        return this.isSameOrAfter(start) && this.isSameOrBefore(end);
    }

    /**
     * Calculates the time difference between this DateTime and another.
     * 
     * @param value - The DateTime to compare with.
     * @returns A Duration representing the time difference.
     */
    public timeDiff(value: DateTime): Duration
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return Duration.fromMilliSeconds(Math.abs(this.valueOf() - value.valueOf()));
    }

    /**
     * Calculates the days difference between this DateTime and another.
     * 
     * @param value - The DateTime to compare with.
     * @returns The number of days difference.
     */
    public daysDiff(value: DateTime): number
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return Math.abs(Number.parseInt(this._dateTime.diff(value._dateTime, ["days"]).days.toString()));
    }

    /**
     * Checks if this DateTime is on the same day as another.
     * 
     * @param value - The DateTime to compare with.
     * @returns True if the DateTime instances are on the same day, false otherwise.
     */
    public isSameDay(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        const daysDiff = this._dateTime.diff(value._dateTime, ["days"]).days;

        return Math.abs(daysDiff) < 1;
    }

    /**
     * Adds a duration to this DateTime. this accounts for shift in DST
     * 
     * @param time - The duration to add.
     * @returns A new DateTime instance with the duration added.
     */
    public addTime(time: Duration): DateTime
    {
        given(time, "time").ensureHasValue().ensureIsObject().ensureIsInstanceOf(Duration);

        return new DateTime({
            value: this._dateTime.plus({ milliseconds: time.toMilliSeconds() }).toFormat(DateTime._format),
            zone: this._zone
        });
    }

    /**
     * Subtracts a duration from this DateTime. this accounts for shift in DST
     * 
     * @param time - The duration to subtract.
     * @returns A new DateTime instance with the duration subtracted.
     */
    public subtractTime(time: Duration): DateTime
    {
        given(time, "time").ensureHasValue().ensureIsObject().ensureIsInstanceOf(Duration);

        return new DateTime({
            value: this._dateTime.minus({ milliseconds: time.toMilliSeconds() }).toFormat(DateTime._format),
            zone: this._zone
        });
    }

    /**
     * Adds days to this DateTime. this doesn't change time based on DST
     * 
     * @param days - The number of days to add.
     * @returns A new DateTime instance with the days added.
     * @throws Error if days is not a positive integer.
     */
    public addDays(days: number): DateTime
    {
        given(days, "days").ensureHasValue().ensureIsNumber()
            .ensure(t => t >= 0 && Number.isInteger(t), "days should be positive integer");

        return new DateTime({
            value: this._dateTime.plus({ days }).toFormat(DateTime._format),
            zone: this._zone
        });
    }

    /**
     * Subtracts days from this DateTime. this doesn't change time based on DST
     * 
     * @param days - The number of days to subtract.
     * @returns A new DateTime instance with the days subtracted.
     * @throws Error if days is not a positive integer.
     */
    public subtractDays(days: number): DateTime
    {
        given(days, "days").ensureHasValue().ensureIsNumber()
            .ensure(t => t >= 0 && Number.isInteger(t), "days should be positive integer");

        return new DateTime({
            value: this._dateTime.minus({ days }).toFormat(DateTime._format),
            zone: this._zone
        });
    }

    /**
     * Gets an array of DateTime instances for each day of the month.
     * 
     * @returns An array of DateTime instances, where:
     * - First element is the start of the month (e.g., "2023-06-01 00:00")
     * - Last element is the end of the month (e.g., "2023-06-30 23:59")
     * - Elements in between represent the start of each day (e.g., "2023-06-11 00:00")
     */
    public getDaysOfMonth(): Array<DateTime>
    {
        const startOfMonth = this._dateTime.startOf("month");
        const endOfMonth = this._dateTime.endOf("month");

        const luxonDays = LuxonInterval.fromDateTimes(startOfMonth, endOfMonth).splitBy({ days: 1 })
            .map((t) => t.start!);

        luxonDays[0] = startOfMonth;
        luxonDays[luxonDays.length - 1] = endOfMonth;

        return luxonDays.map(t => new DateTime({
            value: t.toFormat(DateTime._format),
            zone: this._zone
        }));
    }

    /**
     * Converts this DateTime to a different timezone.
     * 
     * @param zone - The target timezone.
     * @returns A new DateTime instance in the specified timezone.
     * @throws Error if the timezone is invalid.
     */
    public convertToZone(zone: string): DateTime
    {
        given(zone, "zone").ensureHasValue().ensureIsString()
            .ensure(t => DateTime.validateTimeZone(t));

        if (zone === this.zone)
            return this;

        const newDateTime = this._dateTime.setZone(zone).toFormat(DateTime._format);

        return new DateTime({
            value: newDateTime,
            zone
        });
    }

    /**
     * Checks if this DateTime is within a time range.
     * 
     * @param startTimeCode - The start time code in HHMM format.
     * @param endTimeCode - The end time code in HHMM format.
     * @returns True if this DateTime is within the time range, false otherwise.
     * @throws Error if the time codes are invalid or if endTimeCode is before startTimeCode.
     */
    public isWithinTimeRange(startTimeCode: string, endTimeCode: string): boolean
    {
        given(startTimeCode, "startTimeCode").ensureHasValue().ensureIsString()
            .ensure(t => t.matchesFormat("####"))
            .ensure(t => Number.parseInt(t) >= 0 && Number.parseInt(t) <= 2359);

        given(endTimeCode, "endTimeCode").ensureHasValue().ensureIsString()
            .ensure(t => t.matchesFormat("####"))
            .ensure(t => Number.parseInt(t) >= 0 && Number.parseInt(t) <= 2359)
            .ensure(t => Number.parseInt(t) >= Number.parseInt(startTimeCode),
                "must be >= startTimeCode");

        const startDateTime = DateTime.createFromCodes(
            this.dateCode,
            startTimeCode,
            this.zone
        );

        const endDateTime = DateTime.createFromCodes(
            this.dateCode,
            endTimeCode,
            this.zone
        );

        return this.isBetween(startDateTime, endDateTime);
    }
}

/**
 * Schema type for DateTime serialization.
 */
export type DateTimeSchema = Schema<DateTime, "value" | "zone">;