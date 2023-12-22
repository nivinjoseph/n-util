import * as Assert from "assert";
import { DateTime } from "../../src/date-time";
import { Duration } from "../../src";
import { given } from "@nivinjoseph/n-defensive";
import { ArgumentException } from "@nivinjoseph/n-exception";


suite("DateTime Comparison", () =>
{

    function testDifferentSetOfValues(compareFunction: (minValue: string, maxValue: string, diff: string,
        timeDiff: Duration, daysDiff: number) => void): void
    {
        // Compare different minutes in same zone
        compareFunction(
            "2024-01-01 10:00",
            "2024-01-01 10:01",
            "1 minute",
            Duration.fromMinutes(1),
            0
        );

        // Compare different hours in same zone
        compareFunction(
            "2024-01-01 10:00",
            "2024-01-01 11:00",
            "1 hour",
            Duration.fromHours(1),
            0
        );

        // Compare different days in same zone
        compareFunction(
            "2024-01-01 10:00",
            "2024-01-02 10:00",
            "1 day",
            Duration.fromDays(1),
            1
        );

        // Compare different months in same zone
        compareFunction(
            "2024-01-01 10:00",
            "2024-02-01 10:00",
            "1 month",
            Duration.fromDays(31),
            31
        );

        // Compare different years in same zone
        compareFunction(
            "2023-01-01 10:00",
            "2024-01-01 10:00",
            "1 year",
            Duration.fromDays(365),
            365
        );

        // Compare different years (leap year) in same zone
        compareFunction(
            "2024-01-01 10:00",
            "2025-01-01 10:00",
            "1 year",
            Duration.fromDays(366),
            366
        );
    }


    function testDifferentZones(compareFunction: (value: string, behindZone: string, aheadZone: string, diff: string,
        timeDiff: Duration, daysDiff: number) => void): void
    {
        // Compare same value but different zones utc and IST (UTC+5:30)
        compareFunction(
            "2024-01-01 10:00",
            "utc",
            "UTC+5:30",
            "5 hour 30 minute",
            Duration.fromHours(5.5),
            0
        );

        // Compare same value but different zones America/Los_Angeles and utc
        // could be 7 or 8 based on Daylight savings8
        compareFunction(
            "2024-01-01 10:00",
            "America/Los_Angeles",
            "utc",
            `8 hours`,
            Duration.fromHours(8),
            0
        );

        compareFunction(
            "2024-06-01 10:00",
            "America/Los_Angeles",
            "utc",
            `7 hours`,
            Duration.fromHours(7),
            0
        );

        // Compare same value but different zones America/Los_Angeles and IST(UTC+5:30)
        // could be 12.5 or 13.5 based on Daylight savings
        compareFunction(
            "2024-01-01 10:00",
            "America/Los_Angeles",
            "UTC+5:30",
            `13 hours 30 minutes`,
            Duration.fromHours(13.5),
            0
        );

        compareFunction(
            "2024-06-01 10:00",
            "America/Los_Angeles",
            "UTC+5:30",
            `12 hours 30 minutes`,
            Duration.fromHours(12.5),
            0
        );
    }


    function testSameTimestampDifferentValueAndZone(compareFunction: (dateTime1: DateTime, dateTime2: DateTime) => void): void
    {
        const utcDateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

        // Compare different value and zones utc and IST but represent same time
        compareFunction(
            utcDateTime,
            utcDateTime.convertToZone("UTC+5:30")
        );

        // Compare different value and zones America/Los_Angeles and utc but represent same time
        compareFunction(
            utcDateTime,
            utcDateTime.convertToZone("America/Los_Angeles")
        );

        // Compare different value and zones America/Los_Angeles and utc but represent same time
        compareFunction(
            utcDateTime.convertToZone("UTC+5:30"),
            utcDateTime.convertToZone("America/Los_Angeles")
        );
    }

    suite("DateTime.min", () =>
    {
        test(`Given the same DateTime object
        when it's compared with DateTime.min 
        then it should return the min DateTime object`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.strictEqual(DateTime.min(dateTime, dateTime), dateTime); // return second arg when same
            }
        );

        test(`Given two DateTime object with same value and zone
        when it's compared with DateTime.min 
        then it should return the second dateTime that's passed in`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.strictEqual(DateTime.min(dateTime1, dateTime2), dateTime2); // return second arg when same
                Assert.strictEqual(DateTime.min(dateTime2, dateTime1), dateTime1); // return second arg when same
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's compared with DateTime.min 
            then it should return the one with value ${minValue}`,
                () =>
                {
                    Assert.strictEqual(DateTime.min(min, max), min);
                    Assert.strictEqual(DateTime.min(max, min), min);
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
            when it's compared with DateTime.min 
            then it should return the one with zone ${aheadZone}`,
                () =>
                {
                    Assert.strictEqual(DateTime.min(min, max), min);
                    Assert.strictEqual(DateTime.min(max, min), min);
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
            when it's compared with DateTime.min 
            then it should return the second dateTime that's passed in`,
                () =>
                {
                    Assert.strictEqual(DateTime.min(dateTime1, dateTime2), dateTime2); // return second arg when same
                    Assert.strictEqual(DateTime.min(dateTime2, dateTime1), dateTime1); // return second arg when same
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime.max", () =>
    {
        test(`Given the same DateTime object
        when it's compared with DateTime.max 
        then it should return the max DateTime object`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.strictEqual(DateTime.max(dateTime, dateTime), dateTime); // return second arg when same
            }
        );

        test(`Given two DateTime object with same value and zone
        when it's compared with DateTime.max 
        then it should return the second dateTime that's passed in`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.strictEqual(DateTime.max(dateTime1, dateTime2), dateTime2); // return second arg when same
                Assert.strictEqual(DateTime.max(dateTime2, dateTime1), dateTime1); // return second arg when same
            }
        );


        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's compared with DateTime.max 
            then it should return the one with value ${maxValue}`,
                () =>
                {
                    Assert.strictEqual(DateTime.max(min, max), max);
                    Assert.strictEqual(DateTime.max(max, min), max);
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
            when it's compared with DateTime.max 
            then it should return the one with zone ${aheadZone}`,
                () =>
                {
                    Assert.strictEqual(DateTime.max(min, max), max);
                    Assert.strictEqual(DateTime.max(max, min), max);
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
            when it's compared with DateTime.max 
            then it should return the second dateTime that's passed in`,
                () =>
                {
                    Assert.strictEqual(DateTime.max(dateTime1, dateTime2), dateTime2); // return second arg when same
                    Assert.strictEqual(DateTime.max(dateTime2, dateTime1), dateTime1); // return second arg when same
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime Is Same", () =>
    {
        test(`Given the same DateTime object
        when it's checked one is same as the other
        then it should return true`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.ok(dateTime.isSame(dateTime));
            }
        );

        test(`Given two DateTime object with same value and zone
        when it's checked one is same as the other
        then it should return true`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.ok(dateTime1.isSame(dateTime2));
                Assert.ok(dateTime2.isSame(dateTime1));
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked one is same as the other
            then it should return false`,
                () =>
                {
                    Assert.ok(!min.isSame(max));
                    Assert.ok(!max.isSame(min));
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
            when it's checked one is same as the other
            then it should return false`,
                () =>
                {
                    Assert.ok(!min.isSame(max));
                    Assert.ok(!max.isSame(min));
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
            when it's checked one is same as the other
            then it should return true`,
                () =>
                {
                    Assert.ok(dateTime1.isSame(dateTime2));
                    Assert.ok(dateTime2.isSame(dateTime1));
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime Is Same Day", () =>
    {
        test(`Given the same DateTime object
        when checking if they are on the same day
        then it should return true`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.ok(dateTime.isSameDay(dateTime));
            }
        );

        test(`Given two DateTime object with same value and zone
        when checking if they are on the same day
        then it should return true`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.ok(dateTime1.isSameDay(dateTime2));
                Assert.ok(dateTime2.isSameDay(dateTime1));
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string,
            _: Duration, daysDiff: number): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();
            given(daysDiff, "daysDiff").ensureHasValue().ensureIsNumber().ensure(t => t >= 0);

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when checking if they are on the same day
            then it should return ${daysDiff > 0}`,
                () =>
                {
                    Assert.ok(daysDiff > 0 ? !min.isSameDay(max) : min.isSameDay(max));
                    Assert.ok(daysDiff > 0 ? !max.isSameDay(min) : max.isSameDay(min));
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string,
            _: Duration, daysDiff: number): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);


            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when checking if they are on the same day
                then it should return ${daysDiff > 0}`,
                () =>
                {
                    Assert.ok(daysDiff > 0 ? !min.isSameDay(max) : min.isSameDay(max));
                    Assert.ok(daysDiff > 0 ? !max.isSameDay(min) : max.isSameDay(min));
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
                when checking if they are on the same day
                then it should return true`,
                () =>
                {
                    Assert.ok(dateTime1.isSameDay(dateTime2));
                    Assert.ok(dateTime2.isSameDay(dateTime1));
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime Is Equals", () =>
    {
        test(`Given the same DateTime object
        when it's checked one equals the other
        then it should return true`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.ok(dateTime.equals(dateTime));
            }
        );

        test(`Given two DateTime object with same value and zone
        when it's checked one equals the other
        then it should return true`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.ok(dateTime1.equals(dateTime2));
                Assert.ok(dateTime2.equals(dateTime1));
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked one equals the other
            then it should return false`,
                () =>
                {
                    Assert.ok(!min.equals(max));
                    Assert.ok(!max.equals(min));
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when it's checked one equals the other
                then it should return false`,
                () =>
                {
                    Assert.ok(!min.equals(max));
                    Assert.ok(!max.equals(min));
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
                when it's checked one equals the other
                then it should return false`,
                () =>
                {
                    Assert.ok(!dateTime1.equals(dateTime2));
                    Assert.ok(!dateTime2.equals(dateTime1));
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime Is Before", () =>
    {
        test(`Given the same DateTime object
        when it's checked one is before the other
        then it should return false`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.ok(!dateTime.isBefore(dateTime));
            }
        );

        test(`Given two DateTime object with same value and zone
        when it's checked one is before the other
        then it should return false`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.ok(!dateTime1.isBefore(dateTime2));
                Assert.ok(!dateTime2.isBefore(dateTime1));
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked dateTime with value ${minValue} is before the dateTime with value ${maxValue}
            then it should return true`,
                () =>
                {
                    Assert.ok(min.isBefore(max));
                }
            );

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked dateTime with value ${maxValue} is before the dateTime with value ${minValue}
            then it should return false`,
                () =>
                {
                    Assert.ok(!max.isBefore(min));
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when it's checked dateTime with zone ${aheadZone} is before the dateTime with zone ${behindZone}
                then it should return true`,
                () =>
                {
                    Assert.ok(min.isBefore(max));
                }
            );

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
            when it's checked dateTime with zone ${behindZone} is before the dateTime with zone ${aheadZone}
            then it should return false`,
                () =>
                {
                    Assert.ok(!max.isBefore(min));
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
                when it's checked one is before the other
                then it should return false`,
                () =>
                {
                    Assert.ok(!dateTime1.isBefore(dateTime2));
                    Assert.ok(!dateTime2.isBefore(dateTime1));
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime Is Same or Before", () =>
    {
        test(`Given the same DateTime object
        when it's checked one is same or before the other
        then it should return true`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.ok(dateTime.isSameOrBefore(dateTime));
            }
        );

        test(`Given two DateTime object with same value and zone
        when it's checked one is same or before the other
        then it should return true`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.ok(dateTime1.isSameOrBefore(dateTime2));
                Assert.ok(dateTime2.isSameOrBefore(dateTime1));
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked dateTime with value ${minValue} is same or before the dateTime with value ${maxValue}
            then it should return true`,
                () =>
                {
                    Assert.ok(min.isSameOrBefore(max));
                }
            );

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked dateTime with value ${maxValue} is same or before the dateTime with value ${minValue}
            then it should return false`,
                () =>
                {
                    Assert.ok(!max.isSameOrBefore(min));
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when it's checked dateTime with zone ${aheadZone} is same or before the dateTime with zone ${behindZone}
                then it should return true`,
                () =>
                {
                    Assert.ok(min.isSameOrBefore(max));
                }
            );

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when it's checked dateTime with zone ${behindZone} is same or before the dateTime with zone ${aheadZone}
                then it should return false`,
                () =>
                {
                    Assert.ok(!max.isSameOrBefore(min));
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
                when it's checked one is same or before the other
                then it should return true`,
                () =>
                {
                    Assert.ok(dateTime1.isSameOrBefore(dateTime2));
                    Assert.ok(dateTime2.isSameOrBefore(dateTime1));
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime Is After", () =>
    {
        test(`Given the same DateTime object
        when it's checked one is after the other
        then it should return false`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.ok(!dateTime.isAfter(dateTime));
            }
        );

        test(`Given two DateTime object with same value and zone
        when it's checked one is after the other
        then it should return false`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.ok(!dateTime1.isAfter(dateTime2));
                Assert.ok(!dateTime2.isAfter(dateTime1));
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked dateTime with value ${minValue} is after the dateTime with value ${maxValue}
            then it should return false`,
                () =>
                {
                    Assert.ok(!min.isAfter(max));
                }
            );

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked dateTime with value ${maxValue} is after the dateTime with value ${minValue}
            then it should return true`,
                () =>
                {
                    Assert.ok(max.isAfter(min));
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when it's checked dateTime with zone ${aheadZone} is after the dateTime with zone ${behindZone}
                then it should return false`,
                () =>
                {
                    Assert.ok(!min.isAfter(max));
                }
            );

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when it's checked dateTime with zone ${behindZone} is after the dateTime with zone ${aheadZone}
                then it should return true`,
                () =>
                {
                    Assert.ok(max.isAfter(min));
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
                when it's checked one is after the other
                then it should return false`,
                () =>
                {
                    Assert.ok(!dateTime1.isAfter(dateTime2));
                    Assert.ok(!dateTime2.isAfter(dateTime1));
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime Is Same or After", () =>
    {
        test(`Given the same DateTime object
        when it's checked one is same or after the other
        then it should return true`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.ok(dateTime.isSameOrAfter(dateTime));
            }
        );

        test(`Given two DateTime object with same value and zone
        when it's checked one is same or after the other
        then it should return true`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.ok(dateTime1.isSameOrAfter(dateTime2));
                Assert.ok(dateTime2.isSameOrAfter(dateTime1));
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked dateTime with value ${minValue} is same or after the dateTime with value ${maxValue}
            then it should return false`,
                () =>
                {
                    Assert.ok(!min.isAfter(max));
                    Assert.ok(!min.isSameOrAfter(max));
                }
            );

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when it's checked dateTime with value ${maxValue} is same or after the dateTime with value ${minValue}
            then it should return true`,
                () =>
                {
                    Assert.ok(max.isSameOrAfter(min));
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when it's checked dateTime with zone ${aheadZone} is same or after the dateTime with zone ${behindZone}
                then it should return false`,
                () =>
                {
                    Assert.ok(!min.isSameOrAfter(max));
                }
            );

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when it's checked dateTime with zone ${behindZone} is same or after the dateTime with zone ${aheadZone}
                then it should return true`,
                () =>
                {
                    Assert.ok(max.isSameOrAfter(min));
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
                when it's checked one is same or after the other
                then it should return true`,
                () =>
                {
                    Assert.ok(dateTime1.isSameOrAfter(dateTime2));
                    Assert.ok(dateTime2.isSameOrAfter(dateTime1));
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime Time Difference", () =>
    {
        test(`Given the same DateTime object
        when checking the time difference between them
        then it should return Duration of 0 milliseconds`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.strictEqual(dateTime.timeDiff(dateTime).toMilliSeconds(), 0);
            }
        );

        test(`Given two DateTime object with same value and zone
        when checking the time difference between them
        then it should return Duration of 0 milliseconds`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.strictEqual(dateTime1.timeDiff(dateTime2).toMilliSeconds(), 0);
                Assert.strictEqual(dateTime2.timeDiff(dateTime1).toMilliSeconds(), 0);
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string, timeDiff: Duration): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();
            given(timeDiff, "timeDiff").ensureHasValue().ensureIsInstanceOf(Duration);

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when checking the time difference between them
            then it should return Duration of ${diff}`,
                () =>
                {
                    Assert.strictEqual(min.timeDiff(max).toMilliSeconds(), timeDiff.toMilliSeconds());
                    Assert.strictEqual(max.timeDiff(min).toMilliSeconds(), timeDiff.toMilliSeconds());
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string, timeDiff: Duration): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();
            given(timeDiff, "timeDiff").ensureHasValue().ensureIsInstanceOf(Duration);

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when checking the time difference between them
                then it should return Duration of ${diff}`,
                () =>
                {
                    Assert.strictEqual(min.timeDiff(max).toMilliSeconds(), timeDiff.toMilliSeconds());
                    Assert.strictEqual(max.timeDiff(min).toMilliSeconds(), timeDiff.toMilliSeconds());
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
                when checking the time difference between them
                then it should return Duration of 0 milliseconds`,
                () =>
                {
                    Assert.strictEqual(dateTime1.timeDiff(dateTime2).toMilliSeconds(), 0);
                    Assert.strictEqual(dateTime2.timeDiff(dateTime1).toMilliSeconds(), 0);
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("DateTime Days Difference", () =>
    {
        test(`Given the same DateTime object
        when checking the difference between them in calendar days
        then it should return 0`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.strictEqual(dateTime.daysDiff(dateTime), 0);
            }
        );

        test(`Given two DateTime object with same value and zone
        when checking the difference between them in calendar days
        then it should return 0`,
            () =>
            {
                const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.strictEqual(dateTime1.daysDiff(dateTime2), 0);
                Assert.strictEqual(dateTime2.daysDiff(dateTime1), 0);
            }
        );

        function compareDateTimeWithDifferentValues(minValue: string, maxValue: string, diff: string,
            _: Duration, daysDiff: number): void
        {
            given(minValue, "minValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(maxValue, "maxValue").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(diff, "diff").ensureHasValue().ensureIsString();
            given(daysDiff, "daysDiff").ensureHasValue().ensureIsNumber().ensure(t => t >= 0);

            const min = new DateTime({ value: minValue, zone: "utc" });
            const max = new DateTime({ value: maxValue, zone: "utc" });

            test(`Given two DateTime objects ${minValue} and ${maxValue}, ${diff} apart in the same zone
            when checking the difference between them in calendar days
            then it should return ${daysDiff}`,
                () =>
                {
                    Assert.strictEqual(min.daysDiff(max), daysDiff);
                    Assert.strictEqual(max.daysDiff(min), daysDiff);
                }
            );
        }

        testDifferentSetOfValues(compareDateTimeWithDifferentValues);

        function compareDateTimeWithDifferentZones(value: string, behindZone: string, aheadZone: string, diff: string,
            _: Duration, daysDiff: number): void
        {
            given(value, "value").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateDateTimeFormat(t));
            given(behindZone, "behindZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(aheadZone, "aheadZone").ensureHasValue().ensureIsString()
                .ensure(t => DateTime.validateTimeZone(t));
            given(diff, "diff").ensureHasValue().ensureIsString();
            given(daysDiff, "daysDiff").ensureHasValue().ensureIsNumber().ensure(t => t >= 0);

            const min = new DateTime({ value, zone: aheadZone });
            const max = new DateTime({ value, zone: behindZone });

            given(min, "min").ensure(t => t.timestamp < max.timestamp,
                `zone ${aheadZone} is not ahead of ${behindZone}`);

            test(`Given two DateTime object with same value and zones ${behindZone} and ${aheadZone} with difference ${diff}
                when checking the difference between them in calendar days
                then it should return ${daysDiff}`,
                () =>
                {
                    Assert.strictEqual(min.daysDiff(max), daysDiff);
                    Assert.strictEqual(max.daysDiff(min), daysDiff);
                }
            );
        }

        testDifferentZones(compareDateTimeWithDifferentZones);

        function compareDateTimeWithSameTimestamp(dateTime1: DateTime, dateTime2: DateTime): void
        {
            given(dateTime1, "dateTime1").ensureHasValue().ensureIsType(DateTime);
            given(dateTime2, "dateTime2").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.timestamp === dateTime1.timestamp, "Timestamps are different");

            test(`Given two DateTime object with different value and zones (${dateTime1.toString()} and ${dateTime2.toString()}) but represents same time
                when checking the difference between them in calendar days
                then it should return 0`,
                () =>
                {
                    Assert.strictEqual(dateTime1.daysDiff(dateTime2), 0);
                    Assert.strictEqual(dateTime2.daysDiff(dateTime1), 0);
                }
            );
        }

        testSameTimestampDifferentValueAndZone(compareDateTimeWithSameTimestamp);
    });

    suite("Compare three date time Is Between", () =>
    {
        function checkIsInvalidParams(dateTime: DateTime, start: DateTime, end: DateTime): void
        {
            test(`Given a DateTime (${dateTime.toString()}), and a start (${start.toString()}) and end (${end.toString()}) DateTime
            when start DateTime timeStamp is after end DateTime timeStamp
            then it should throw a validation error`,
                () =>
                {
                    Assert.throws(() => dateTime.isBetween(start, end), ArgumentException);
                }
            );
        }

        function checkIsCorrect(dateTime: DateTime, start: DateTime, end: DateTime): void
        {
            given(dateTime, "dateTime").ensureHasValue().ensureIsType(DateTime);
            given(start, "start").ensureHasValue().ensureIsType(DateTime);
            given(end, "end").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.isSameOrAfter(start), "must be same or after start");

            test(`Given a DateTime (${dateTime.toString()}), and a start (${start.toString()}) and end (${end.toString()}) DateTime
            when dateTime is in between start and end
            then it should return true`,
                () =>
                {
                    Assert.ok(dateTime.isBetween(start, end));
                }
            );
        }

        function checkIsFalse(dateTime: DateTime, start: DateTime, end: DateTime): void
        {
            given(dateTime, "dateTime").ensureHasValue().ensureIsType(DateTime);
            given(start, "start").ensureHasValue().ensureIsType(DateTime);
            given(end, "end").ensureHasValue().ensureIsType(DateTime)
                .ensure(t => t.isSameOrAfter(start), "must be same or after start");

            test(`Given a DateTime (${dateTime.toString()}), and a start (${start.toString()}) and end (${end.toString()}) DateTime
            when dateTime is not in between start and end
            then it should return false`,
                () =>
                {
                    Assert.ok(!dateTime.isBetween(start, end));
                }
            );
        }

        test(`Given dateTime start and end as the same DateTime object
        when it's checked it's between the same DateTime
        then it should return true`, () =>
        {
            const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

            Assert.ok(dateTime.isBetween(dateTime, dateTime));
        });

        test(`Given dateTime start and end with same value and zone
        when it's compared isBetween
        then it should return true`, () =>
        {
            const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime3 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

            Assert.ok(dateTime1.isBetween(dateTime2, dateTime3));
            Assert.ok(dateTime2.isBetween(dateTime1, dateTime3));
            Assert.ok(dateTime3.isBetween(dateTime1, dateTime2));
        });

        suite("Compare different minutes", () =>
        {
            const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime2 = new DateTime({ value: "2024-01-01 10:01", zone: "utc" });
            const dateTime3 = new DateTime({ value: "2024-01-01 10:02", zone: "utc" });

            checkIsFalse(dateTime1, dateTime2, dateTime3);
            checkIsInvalidParams(dateTime1, dateTime3, dateTime2);

            checkIsCorrect(dateTime2, dateTime1, dateTime3);
            checkIsInvalidParams(dateTime2, dateTime3, dateTime1);

            checkIsFalse(dateTime3, dateTime1, dateTime2);
            checkIsInvalidParams(dateTime3, dateTime2, dateTime1);
        });

        suite("Compare different hours", () =>
        {
            const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime2 = new DateTime({ value: "2024-01-01 11:00", zone: "utc" });
            const dateTime3 = new DateTime({ value: "2024-01-01 12:00", zone: "utc" });

            checkIsFalse(dateTime1, dateTime2, dateTime3);
            checkIsInvalidParams(dateTime1, dateTime3, dateTime2);

            checkIsCorrect(dateTime2, dateTime1, dateTime3);
            checkIsInvalidParams(dateTime2, dateTime3, dateTime1);

            checkIsFalse(dateTime3, dateTime1, dateTime2);
            checkIsInvalidParams(dateTime3, dateTime2, dateTime1);
        });

        suite("Compare different days", () =>
        {
            const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime2 = new DateTime({ value: "2024-01-02 10:00", zone: "utc" });
            const dateTime3 = new DateTime({ value: "2024-01-03 10:00", zone: "utc" });

            checkIsFalse(dateTime1, dateTime2, dateTime3);
            checkIsInvalidParams(dateTime1, dateTime3, dateTime2);

            checkIsCorrect(dateTime2, dateTime1, dateTime3);
            checkIsInvalidParams(dateTime2, dateTime3, dateTime1);

            checkIsFalse(dateTime3, dateTime1, dateTime2);
            checkIsInvalidParams(dateTime3, dateTime2, dateTime1);
        });

        suite("Compare different months", () =>
        {
            const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime2 = new DateTime({ value: "2024-02-01 10:00", zone: "utc" });
            const dateTime3 = new DateTime({ value: "2024-03-01 10:00", zone: "utc" });

            checkIsFalse(dateTime1, dateTime2, dateTime3);
            checkIsInvalidParams(dateTime1, dateTime3, dateTime2);

            checkIsCorrect(dateTime2, dateTime1, dateTime3);
            checkIsInvalidParams(dateTime2, dateTime3, dateTime1);

            checkIsFalse(dateTime3, dateTime1, dateTime2);
            checkIsInvalidParams(dateTime3, dateTime2, dateTime1);
        });

        suite("Compare different years", () =>
        {
            const dateTime1 = new DateTime({ value: "2023-01-01 10:00", zone: "utc" });
            const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime3 = new DateTime({ value: "2025-01-01 10:00", zone: "utc" });

            checkIsFalse(dateTime1, dateTime2, dateTime3);
            checkIsInvalidParams(dateTime1, dateTime3, dateTime2);

            checkIsCorrect(dateTime2, dateTime1, dateTime3);
            checkIsInvalidParams(dateTime2, dateTime3, dateTime1);

            checkIsFalse(dateTime3, dateTime1, dateTime2);
            checkIsInvalidParams(dateTime3, dateTime2, dateTime1);
        });

        suite("Compare different zones", () =>
        {
            const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "UTC+5:30" });
            const dateTime2 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime3 = new DateTime({ value: "2024-01-01 10:00", zone: "America/Los_Angeles" });

            checkIsFalse(dateTime1, dateTime2, dateTime3);
            checkIsInvalidParams(dateTime1, dateTime3, dateTime2);

            checkIsCorrect(dateTime2, dateTime1, dateTime3);
            checkIsInvalidParams(dateTime2, dateTime3, dateTime1);

            checkIsFalse(dateTime3, dateTime1, dateTime2);
            checkIsInvalidParams(dateTime3, dateTime2, dateTime1);
        });
    });

    suite("Compare DateTime is within time range", () =>
    {
        function checkIsInvalidParams(dateTime: DateTime, startTimeCode: string, endTimeCode: string, reason: string): void
        {
            test(`Given a DateTime (${dateTime.toString()}), and a startTimeCode (${startTimeCode}) and endTimeCode (${endTimeCode})
            when ${reason}
            then it should throw a validation error`,
                () =>
                {
                    Assert.throws(() => dateTime.isWithinTimeRange(startTimeCode, endTimeCode), ArgumentException);
                }
            );
        }

        function checkIsCorrect(dateTime: DateTime, startTimeCode: string, endTimeCode: string): void
        {
            given(dateTime, "dateTime").ensureHasValue().ensureIsType(DateTime);
            given(startTimeCode, "startTimeCode").ensureHasValue().ensureIsString();
            given(endTimeCode, "startTimeCode").ensureHasValue().ensureIsString();

            test(`Given a DateTime (${dateTime.toString()}), and a startTimeCode (${startTimeCode}) and endTimeCode (${endTimeCode})
                when dateTime is within start and end time
                then it should return true`,
                () =>
                {
                    Assert.ok(dateTime.isWithinTimeRange(startTimeCode, endTimeCode));
                }
            );
        }

        function checkIsFalse(dateTime: DateTime, startTimeCode: string, endTimeCode: string): void
        {
            given(dateTime, "dateTime").ensureHasValue().ensureIsType(DateTime);
            given(startTimeCode, "startTimeCode").ensureHasValue().ensureIsString();
            given(endTimeCode, "startTimeCode").ensureHasValue().ensureIsString();

            test(`Given a DateTime (${dateTime.toString()}), and a startTimeCode (${startTimeCode}) and endTimeCode (${endTimeCode}) 
                when dateTime is not within start and end time
                then it should return false`,
                () =>
                {
                    Assert.ok(!dateTime.isWithinTimeRange(startTimeCode, endTimeCode));
                }
            );
        }

        test(`Given a DateTime, start and end time same as that dateTime
            when dateTime is checked to be within start and end time
            then it should return true`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

                Assert.ok(dateTime.isWithinTimeRange(dateTime.timeCode, dateTime.timeCode));
            });

        suite("Compare to Invalid start time code", () =>
        {
            const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

            checkIsInvalidParams(dateTime, "", "1000", "start time code is invalid");
            checkIsInvalidParams(dateTime, "11", "1000", "start time code is invalid");
            checkIsInvalidParams(dateTime, "10:00", "1000", "start time code is invalid");
            checkIsInvalidParams(dateTime, "2400", "1000", "start time code is invalid");
            checkIsInvalidParams(dateTime, "10000", "1000", "start time code is invalid");
        });

        suite("Compare to Invalid end time code", () =>
        {
            const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

            checkIsInvalidParams(dateTime, "1000", "", "end time code is invalid");
            checkIsInvalidParams(dateTime, "1000", "11", "end time code is invalid");
            checkIsInvalidParams(dateTime, "1000", "10:00", "end time code is invalid");
            checkIsInvalidParams(dateTime, "1000", "2400", "end time code is invalid");
            checkIsInvalidParams(dateTime, "1000", "10000", "end time code is invalid");
        });

        suite("Compare different minutes", () =>
        {
            const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime2 = new DateTime({ value: "2024-01-01 10:01", zone: "utc" });
            const dateTime3 = new DateTime({ value: "2024-01-01 10:02", zone: "utc" });

            checkIsFalse(dateTime1, dateTime2.timeCode, dateTime3.timeCode);
            checkIsInvalidParams(dateTime1, dateTime3.timeCode, dateTime2.timeCode,
                "start time is greater than end time");

            checkIsCorrect(dateTime2, dateTime1.timeCode, dateTime3.timeCode);
            checkIsInvalidParams(dateTime2, dateTime3.timeCode, dateTime1.timeCode,
                "start time is greater than end time");

            checkIsFalse(dateTime3, dateTime1.timeCode, dateTime2.timeCode);
            checkIsInvalidParams(dateTime3, dateTime2.timeCode, dateTime1.timeCode,
                "start time is greater than end time");
        });

        suite("Compare different hours", () =>
        {
            const dateTime1 = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
            const dateTime2 = new DateTime({ value: "2024-01-01 11:00", zone: "utc" });
            const dateTime3 = new DateTime({ value: "2024-01-01 12:00", zone: "utc" });

            checkIsFalse(dateTime1, dateTime2.timeCode, dateTime3.timeCode);
            checkIsInvalidParams(dateTime1, dateTime3.timeCode, dateTime2.timeCode,
                "start time is greater than end time");

            checkIsCorrect(dateTime2, dateTime1.timeCode, dateTime3.timeCode);
            checkIsInvalidParams(dateTime2, dateTime3.timeCode, dateTime1.timeCode,
                "start time is greater than end time");

            checkIsFalse(dateTime3, dateTime1.timeCode, dateTime2.timeCode);
            checkIsInvalidParams(dateTime3, dateTime2.timeCode, dateTime1.timeCode,
                "start time is greater than end time");
        });
    });
});