import { __esDecorate, __runInitializers } from "tslib";
import { given } from "@nivinjoseph/n-defensive";
import { DateTime as LuxonDateTime, Interval as LuxonInterval } from "luxon";
import { Serializable, serialize } from "./serializable.js";
import { Duration } from "./duration.js";
import { TypeHelper } from "./type-helper.js";
let DateTime = (() => {
    let _classDecorators = [serialize("Nutil")];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Serializable;
    let _instanceExtraInitializers = [];
    let _get_value_decorators;
    let _get_zone_decorators;
    var DateTime = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _get_value_decorators = [serialize];
            _get_zone_decorators = [serialize];
            __esDecorate(this, null, _get_value_decorators, { kind: "getter", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_zone_decorators, { kind: "getter", name: "zone", static: false, private: false, access: { has: obj => "zone" in obj, get: obj => obj.zone }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DateTime = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static _format = "yyyy-MM-dd HH:mm";
        _value = (__runInitializers(this, _instanceExtraInitializers), void 0);
        _zone;
        _dateTime;
        _timestamp;
        _dateCode;
        _timeCode;
        _dateValue;
        _timeValue;
        /**
         * @returns system's local timezone
         */
        static get currentZone() { return LuxonDateTime.local().zoneName; }
        get value() { return this._value; }
        get zone() { return this._zone; }
        get timestamp() { return this._timestamp; }
        get dateCode() { return this._dateCode; }
        get timeCode() { return this._timeCode; }
        get dateValue() { return this._dateValue; }
        get timeValue() { return this._timeValue; }
        get isPast() { return this.isBefore(DateTime.now()); }
        get isFuture() { return this.isAfter(DateTime.now()); }
        constructor(data) {
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
        static now(zone) {
            given(zone, "zone").ensureIsString();
            if (zone != null) {
                return new DateTime({
                    value: LuxonDateTime.now().setZone(zone).toFormat(DateTime._format),
                    zone
                });
            }
            else {
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
        static createFromTimestamp(timestamp, zone) {
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
        static createFromMilliSecondsSinceEpoch(milliseconds, zone) {
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
        static createFromCodes(dateCode, timeCode, zone) {
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
        static createFromValues(dateValue, timeValue, zone) {
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
        static min(dateTime1, dateTime2) {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime);
            if (dateTime1.valueOf() < dateTime2.valueOf())
                return dateTime1;
            return dateTime2;
        }
        static max(dateTime1, dateTime2) {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime);
            if (dateTime1.valueOf() > dateTime2.valueOf())
                return dateTime1;
            return dateTime2;
        }
        static validateDateTimeFormat(value) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (value == null || value.isEmptyOrWhiteSpace())
                return false;
            return LuxonDateTime.fromFormat(value, DateTime._format).isValid;
        }
        static validateDateFormat(value) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (value == null || value.isEmptyOrWhiteSpace())
                return false;
            return LuxonDateTime.fromFormat(value, "yyyy-MM-dd").isValid;
        }
        static validateTimeFormat(value) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (value == null || value.isEmptyOrWhiteSpace())
                return false;
            return LuxonDateTime.fromFormat(value, "HH:mm").isValid;
        }
        static validateTimeZone(zone) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (zone == null || zone.isEmptyOrWhiteSpace())
                return false;
            try {
                DateTime._validateZone(zone);
            }
            catch {
                return false;
            }
            return LuxonDateTime.now().setZone(zone).isValid;
        }
        static _validateZone(zone) {
            zone = zone.trim();
            if (zone.toLowerCase() === "utc")
                return;
            given(zone, "zone")
                .ensureWhen(zone.toLowerCase() === "local", _ => false, "should not use local zone")
                .ensureWhen(zone.toLowerCase().startsWith("utc+"), t => {
                // range is +00:00 to +14:00 (https://en.wikipedia.org/wiki/List_of_UTC_offsets)
                let offset = t.split("+").takeLast().trim();
                if (!offset.contains(":"))
                    offset = `${offset}:00`;
                const [hour, minute] = offset.split(":").map(t => TypeHelper.parseNumber(t));
                if (hour == null || minute == null)
                    return false;
                return (hour >= 0 && hour < 14 && minute >= 0 && minute < 60)
                    || (hour === 14 && minute === 0);
            }, "Invalid UTC offset for zone")
                .ensureWhen(zone.toLowerCase().startsWith("utc-"), t => {
                // range is -00:00 to -12:00 (https://en.wikipedia.org/wiki/List_of_UTC_offsets)
                let offset = t.split("-").takeLast();
                if (!offset.contains(":"))
                    offset = `${offset}:00`;
                const [hour, minute] = offset.split(":").map(t => TypeHelper.parseNumber(t));
                if (hour == null || minute == null)
                    return false;
                return hour >= 0 && hour < 12 && minute >= 0 && minute < 60
                    || (hour === 12 && minute === 0);
            }, "Invalid UTC offset for zone");
        }
        valueOf() {
            return this._dateTime.valueOf();
        }
        equals(value) {
            given(value, "value").ensureIsType(DateTime);
            if (value == null)
                return false;
            if (value === this)
                return true;
            return value.value === this._value && value.zone === this._zone;
        }
        toString() {
            return `${this._value} ${this._zone}`;
        }
        toStringDateTime() {
            return this._value;
        }
        toStringISO() {
            return this._dateTime.toISO({ format: "extended", includeOffset: true });
        }
        /**
         * @param value
         * @returns true if this is the same instant in time as value, otherwise false
         */
        isSame(value) {
            given(value, "value").ensureHasValue().ensureIsType(DateTime);
            return this.valueOf() === value.valueOf();
        }
        /**
         * @param value
         * @returns true if this occurs before value, otherwise false
         */
        isBefore(value) {
            given(value, "value").ensureHasValue().ensureIsType(DateTime);
            return this.valueOf() < value.valueOf();
        }
        /**
         * @param value
         * @returns true if this is the same instant in time as value or occurs before, otherwise false
         */
        isSameOrBefore(value) {
            given(value, "value").ensureHasValue().ensureIsType(DateTime);
            return this.valueOf() <= value.valueOf();
        }
        /**
         * @param value
         * @returns true if this occurs after value, otherwise false
         */
        isAfter(value) {
            given(value, "value").ensureHasValue().ensureIsType(DateTime);
            return this.valueOf() > value.valueOf();
        }
        /**
         * @param value
         * @returns true if this is the same instant in time as value or occurs after, otherwise false
         */
        isSameOrAfter(value) {
            given(value, "value").ensureHasValue().ensureIsType(DateTime);
            return this.valueOf() >= value.valueOf();
        }
        isBetween(start, end) {
            given(start, "start").ensureHasValue().ensureIsType(DateTime);
            given(end, "end").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.isSameOrAfter(start), "must be same or after start");
            return this.isSameOrAfter(start) && this.isSameOrBefore(end);
        }
        /**
         *
         * @returns the difference in instant seconds
         */
        timeDiff(value) {
            given(value, "value").ensureHasValue().ensureIsType(DateTime);
            return Duration.fromMilliSeconds(Math.abs(this.valueOf() - value.valueOf()));
        }
        /**
         *
         * @returns the difference in calendar days
         */
        daysDiff(value) {
            given(value, "value").ensureHasValue().ensureIsType(DateTime);
            return Math.abs(Number.parseInt(this._dateTime.diff(value._dateTime, ["days"]).days.toString()));
        }
        isSameDay(value) {
            given(value, "value").ensureHasValue().ensureIsType(DateTime);
            const daysDiff = this._dateTime.diff(value._dateTime, ["days"]).days;
            return Math.abs(daysDiff) < 1;
        }
        /**
        * Adds duration in milliseconds and increases the timestamp by the right number of milliseconds.
        * this accounts for shift in DST
        */
        addTime(time) {
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
        subtractTime(time) {
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
        addDays(days) {
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
        subtractDays(days) {
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
        getDaysOfMonth() {
            const startOfMonth = this._dateTime.startOf("month");
            const endOfMonth = this._dateTime.endOf("month");
            const luxonDays = LuxonInterval.fromDateTimes(startOfMonth, endOfMonth).splitBy({ days: 1 })
                .map((t) => t.start);
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
        convertToZone(zone) {
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
        isWithinTimeRange(startTimeCode, endTimeCode) {
            given(startTimeCode, "startTimeCode").ensureHasValue().ensureIsString()
                .ensure(t => t.matchesFormat("####"))
                .ensure(t => Number.parseInt(t) >= 0 && Number.parseInt(t) <= 2359);
            given(endTimeCode, "endTimeCode").ensureHasValue().ensureIsString()
                .ensure(t => t.matchesFormat("####"))
                .ensure(t => Number.parseInt(t) >= 0 && Number.parseInt(t) <= 2359)
                .ensure(t => Number.parseInt(t) >= Number.parseInt(startTimeCode), "must be >= startTimeCode");
            const startDateTime = DateTime.createFromCodes(this.dateCode, startTimeCode, this.zone);
            const endDateTime = DateTime.createFromCodes(this.dateCode, endTimeCode, this.zone);
            return this.isBetween(startDateTime, endDateTime);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return DateTime = _classThis;
})();
export { DateTime };
//# sourceMappingURL=date-time.js.map