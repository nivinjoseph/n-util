import { given } from "@nivinjoseph/n-defensive";
import { DateTime as LuxonDateTime, Interval as LuxonInterval } from "luxon";
import { Serializable, serialize } from "./serializable.js";
import { Duration } from "./duration.js";
import { Schema } from "./utility-types.js";
import { TypeHelper } from "./type-helper.js";

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
     * @returns system's local timezone
     */
    public static get currentZone(): string { return LuxonDateTime.local().zoneName; }


    @serialize
    public get value(): string { return this._value; }

    @serialize
    public get zone(): string { return this._zone; }

    public get timestamp(): number { return this._timestamp; }

    public get dateCode(): string { return this._dateCode; }
    public get timeCode(): string { return this._timeCode; }

    public get dateValue(): string { return this._dateValue; }
    public get timeValue(): string { return this._timeValue; }

    public get isPast(): boolean { return this.isBefore(DateTime.now()); }
    public get isFuture(): boolean { return this.isAfter(DateTime.now()); }


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
     * @param zone :  a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the string 'utc'.
     * If none specified, will use UTC
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
    * Create a DateTime from the number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC).
    *
    * @param timestamp - number of seconds since 1970 UTC
    * @param zone - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the string 'utc'.
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
    * Create a DateTime from the milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC).
    *
    * @param milliseconds -  number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC)
    * @param zone - a zone identifier. As a string, that can be any IANA zone supported by the host environment,
    *  or a fixed-offset name of the form 'UTC+3', or the string 'utc'.
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
    * Create a DateTime from dateCode and timeCode.
    *
    * @param dateCode - dateCode as 8 digit number first four represent year, next two the month and last two day
    * @param timeCode - timeCode as 4 digit number first two represent hour and last two minute
    * @param zone - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the string 'utc'.
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
    * Create a DateTime from date and time.
    *
    * @param dateValue - date in the format YYYY-MM-DD
    * @param timeCode - time in the format hh:mm
    * @param zone - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the string 'utc'.
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

    public static min(dateTime1: DateTime, dateTime2: DateTime): DateTime
    {
        given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
        given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime);

        if (dateTime1.valueOf() < dateTime2.valueOf())
            return dateTime1;

        return dateTime2;
    }

    public static max(dateTime1: DateTime, dateTime2: DateTime): DateTime
    {
        given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
        given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime);

        if (dateTime1.valueOf() > dateTime2.valueOf())
            return dateTime1;

        return dateTime2;
    }

    public static validateDateTimeFormat(value: string): boolean
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (value == null || value.isEmptyOrWhiteSpace())
            return false;

        return LuxonDateTime.fromFormat(value, DateTime._format).isValid;
    }

    public static validateDateFormat(value: string): boolean
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (value == null || value.isEmptyOrWhiteSpace())
            return false;

        return LuxonDateTime.fromFormat(value, "yyyy-MM-dd").isValid;
    }

    public static validateTimeFormat(value: string): boolean
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (value == null || value.isEmptyOrWhiteSpace())
            return false;

        return LuxonDateTime.fromFormat(value, "HH:mm").isValid;
    }

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


    public override valueOf(): number
    {
        return this._dateTime.valueOf();
    }

    public equals(value?: DateTime | null): boolean
    {
        given(value, "value").ensureIsType(DateTime);

        if (value == null)
            return false;

        if (value === this)
            return true;

        return value.value === this._value && value.zone === this._zone;
    }

    public override toString(): string
    {
        return `${this._value} ${this._zone}`;
    }

    public toStringDateTime(): string
    {
        return this._value;
    }

    public toStringISO(): string
    {
        return this._dateTime.toISO({ format: "extended", includeOffset: true })!;
    }

    /**
     * @param value
     * @returns true if this is the same instant in time as value, otherwise false
     */
    public isSame(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() === value.valueOf();
    }

    /**
     * @param value
     * @returns true if this occurs before value, otherwise false
     */
    public isBefore(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() < value.valueOf();
    }

    /**
     * @param value
     * @returns true if this is the same instant in time as value or occurs before, otherwise false
     */
    public isSameOrBefore(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() <= value.valueOf();
    }

    /**
     * @param value
     * @returns true if this occurs after value, otherwise false
     */
    public isAfter(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() > value.valueOf();
    }

    /**
     * @param value
     * @returns true if this is the same instant in time as value or occurs after, otherwise false
     */
    public isSameOrAfter(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return this.valueOf() >= value.valueOf();
    }

    public isBetween(start: DateTime, end: DateTime): boolean
    {
        given(start, "start").ensureHasValue().ensureIsType(DateTime);
        given(end, "end").ensureHasValue().ensureIsType(DateTime)
            .ensure(t => t.isSameOrAfter(start), "must be same or after start");

        return this.isSameOrAfter(start) && this.isSameOrBefore(end);
    }

    /**
     *
     * @returns the difference in instant seconds
     */
    public timeDiff(value: DateTime): Duration
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return Duration.fromMilliSeconds(Math.abs(this.valueOf() - value.valueOf()));
    }

    /**
     *
     * @returns the difference in calendar days
     */
    public daysDiff(value: DateTime): number
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        return Math.abs(Number.parseInt(this._dateTime.diff(value._dateTime, ["days"]).days.toString()));
    }

    public isSameDay(value: DateTime): boolean
    {
        given(value, "value").ensureHasValue().ensureIsType(DateTime);

        const daysDiff = this._dateTime.diff(value._dateTime, ["days"]).days;

        return Math.abs(daysDiff) < 1;
    }

    /**
    * Adds duration in milliseconds and increases the timestamp by the right number of milliseconds.
    * this accounts for shift in DST
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
     * Subtracts duration in milliseconds and decreases the timestamp by the right number of milliseconds.
     * this accounts for shift in DST
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
     * Adds number of days in calendar days, this doesn't change time based on DST
     * @param days number of calendar days to add
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
    * Subtracts number of days in calendar days, this doesn't change time based on DST
    * @param days number of calendar days to subtract
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
    *
    * @returns array of DateTime objects.
    * First element is the start of the month (Eg: 2023-06-01 00:00)
    * Last element is the end of the month (Eg: 2023-06-30 23:59)
    * Element in between represent the start of the day of the month (Eg: 2023-06-11 00:00)
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
     * @description Converts the current date time to a different time zone
     * @param zone  a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the string 'utc'.
     * @returns a new DateTime object with the new zone
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
     *
     * @param startTimeCode inclusive
     * @param endTimeCode inclusive
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


export type DateTimeSchema = Schema<DateTime, "value" | "zone">;