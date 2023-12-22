import * as Assert from "assert";
import { DateTime } from "../../src/date-time";
import { DateTime as LuxonDateTime } from "luxon";
import { ArgumentException } from "@nivinjoseph/n-exception";


suite("DateTime Utility", () =>
{
    suite("Current zone", () =>
    {
        test(`Given current system zone from DateTime
        when it's validated that it's a proper zone
        then it should return true`,
            () =>
            {
                Assert.ok(DateTime.validateTimeZone(DateTime.currentZone));
            }
        );

        test(`Given current system zone from DateTime
        when it's compared to luxon current system zone
        then it should be same as Luxon local zone`,
            () =>
            {
                Assert.strictEqual(LuxonDateTime.now().zoneName, DateTime.currentZone);
            }
        );
    });

    suite("Value of", () =>
    {
        const value = "2024-01-01 10:00";
        const zone = "utc";
        const dateTime = new DateTime({ value: value, zone: zone });

        test(`Given a DateTime with value "2024-01-01 10:00" and zone utc
        when it's compared to luxon dateTime representing the same 
        then it's valueOf() should be same as Luxon DateTime`,
            () =>
            {
                Assert.strictEqual(dateTime.valueOf(), 1704103200000);
            }
        );

        test(`Given a DateTime with value "2024-01-01 10:00" and zone utc
        when it's valueOf() is validated with luxon
        then it should return true`,
            () =>
            {
                Assert.ok(LuxonDateTime.fromMillis(dateTime.valueOf()).isValid);
            }
        );

        test(`Given the value epoch start ("1970-01-01 00:00") in utc
        when DateTime is created from that
        then it should have valueOf() 0`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value: "1970-01-01 00:00", zone: "utc" }).valueOf(), 0);
            }
        );

        test(`Given a value before epoch start ("1969-12-31 23:59") in utc
        when DateTime is created from that
        then it should have valueOf() negative (-60000)`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value: "1969-12-31 23:59", zone: "utc" }).valueOf(), -60000);
            }
        );

        test(`Given a value epoch start ("1970-01-01 00:01") in utc
        when DateTime is created from that
        then it should have valueOf() positive (60000)`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value: "1970-01-01 00:01", zone: "utc" }).valueOf(), 60000);
            }
        );
    });


    suite("to string", () =>
    {
        const value = "2024-01-01 10:00";

        test(`Given a valid value (${value}) and zone (utc)
        when a DateTime is created from that value and zone
        then toString() on that dateTime should return a string with value and zone`,
            () =>
            {
                const zone = "utc";
                const dateTime = new DateTime({ value: value, zone: zone });
                Assert.strictEqual(dateTime.toString(), `${value} ${zone}`);
            }
        );

        test(`Given a valid value (${value}) and zone (UTC+5:30)
        when a DateTime is created from that value and zone
        then toString() on that dateTime should return a string with value and zone`,
            () =>
            {
                const zone = "UTC+5:30";
                const dateTime = new DateTime({ value: value, zone: zone });
                Assert.strictEqual(dateTime.toString(), `${value} ${zone}`);
            }
        );

        test(`Given a valid value (${value}) and zone (America/Los_Angeles)
        when a DateTime is created from that value and zone
        then toString() on that dateTime should return a string with value and zone`,
            () =>
            {
                const zone = "America/Los_Angeles";
                const dateTime = new DateTime({ value: value, zone: zone });
                Assert.strictEqual(dateTime.toString(), `${value} ${zone}`);
            }
        );
    });

    suite("to string date time", () =>
    {
        const value = "2024-01-01 10:00";

        test(`Given a valid value (${value}) and zone (utc)
        when a DateTime is created from that value and zone
        then toStringDateTime() on that dateTime should return the passed in value`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value, zone: "utc" }).toStringDateTime(), value);
            }
        );

        const value1 = "2024-02-29 18:30";
        test(`Given a valid value (${value1}) and zone (utc)
        when a DateTime is created from that value and zone
        then toStringDateTime() on that dateTime should return the passed in value`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value: value1, zone: "utc" }).toStringDateTime(), value1);
            }
        );

        const value2 = "1986-08-17 15:57";
        test(`Given a valid value (${value2}) and zone (utc)
        when a DateTime is created from that value and zone
        then toStringDateTime() on that dateTime should return the passed in value`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value: value2, zone: "utc" }).toStringDateTime(), value2);
            }
        );

        test(`Given a valid value (${value}) in different zone
        when a DateTime is created from that value and zone
        then toStringDateTime() should return the same value for both dateTime`,
            () =>
            {
                const dateTime1 = new DateTime({ value, zone: "UTC+5:30" });
                const dateTime2 = new DateTime({ value, zone: "America/Los_Angeles" });
                Assert.strictEqual(dateTime1.toStringDateTime(), dateTime2.toStringDateTime());
            }
        );
    });

    suite("to string ISO", () =>
    {
        const value = "2024-01-01 10:00";

        test(`Given a valid value (${value}) and zone (utc)
        when a DateTime is created from that value and zone
        then toStringISO() should return a valid ISO string`,
            () =>
            {
                Assert.ok(LuxonDateTime.fromISO(new DateTime({ value, zone: "utc" }).toStringISO()).isValid);
            }
        );

        test(`Given a valid value (${value}) and zone (UTC+5:30)
        when a DateTime is created from that value and zone
        then toStringISO() should return a valid ISO string`,
            () =>
            {
                Assert.ok(LuxonDateTime.fromISO(new DateTime({ value, zone: "UTC+5:30" }).toStringISO()).isValid);
            }
        );

        test(`Given a valid value (${value}) and zone (America/Los_Angeles)
        when a DateTime is created from that value and zone
        then toStringISO() should return a valid ISO string`,
            () =>
            {
                Assert.ok(LuxonDateTime.fromISO(new DateTime({ value, zone: "America/Los_Angeles" }).toStringISO()).isValid);
            }
        );

        test(`Given a valid value (${value}) and zone (utc)
        when a DateTime is created from that value and zone
        then toStringISO() on that dateTime should return "2024-01-01T10:00:00.000Z"`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value, zone: "utc" }).toStringISO(), "2024-01-01T10:00:00.000Z");
            }
        );

        const value1 = "2024-02-29 18:30";
        test(`Given a valid value (${value1}) and zone (utc)
        when a DateTime is created from that value and zone
        then toStringISO() on that dateTime should return "2024-02-29T18:30:00.000Z"`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value: value1, zone: "utc" }).toStringISO(), "2024-02-29T18:30:00.000Z");
            }
        );

        const value2 = "1986-08-17 15:57";
        test(`Given a valid value (${value2}) and zone (utc)
        when a DateTime is created from that value and zone
        then toStringISO() on that dateTime should return "1986-08-17T15:57:00.000Z"`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value: value2, zone: "utc" }).toStringISO(), "1986-08-17T15:57:00.000Z");
            }
        );

        test(`Given a valid value (${value}) and zone (UTC+5:30)
        when a DateTime is created from that value and zone
        then toStringISO() on that dateTime should return "2024-01-01T10:00:00.000+05:30"`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value, zone: "UTC+5:30" }).toStringISO(), "2024-01-01T10:00:00.000+05:30");
            }
        );

        test(`Given a valid value (${value}) and zone (America/Los_Angeles)
        when a DateTime is created from that value and zone
        then toStringISO() on that dateTime should return "2024-01-01T10:00:00.000-08:00"`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value, zone: "America/Los_Angeles" }).toStringISO(), `2024-01-01T10:00:00.000-08:00`);
            }
        );

        test(`Given a valid value (2024-06-01 10:00) and zone (America/Los_Angeles)
        when a DateTime is created from that value and zone
        then toStringISO() on that dateTime should return "2024-06-01T10:00:00.000-07:00"`,
            () =>
            {
                Assert.strictEqual(new DateTime({ value: "2024-06-01 10:00", zone: "America/Los_Angeles" }).toStringISO(), `2024-06-01T10:00:00.000-07:00`);
            }
        );
    });

    suite("Get Days of Month", () =>
    {
        suite("For 2024 jan",
            () =>
            {
                const daysOfMonth = new DateTime({ value: "2024-01-01 10:00", zone: "utc" }).getDaysOfMonth();

                test(`Given a DateTime object with value in January "2024-01-01 10:00"
                when daysOfMonth is calculated for that DateTime
                then it should return an array of 31 days`,
                    () =>
                    {
                        Assert.strictEqual(daysOfMonth.length, 31);
                    }
                );

                test(`Given a DateTime object with value in January "2024-01-01 10:00"
                when daysOfMonth is calculated for that DateTime
                then first element of the array should represent first day of month`,
                    () =>
                    {
                        Assert.strictEqual(daysOfMonth.takeFirst().value, "2024-01-01 00:00");
                        Assert.strictEqual(daysOfMonth.takeFirst().dateValue, "2024-01-01");
                    }
                );

                test(`Given a DateTime object with value in January "2024-01-01 10:00"
                when daysOfMonth is calculated for that DateTime
                then last element of the array should represent last day of month`,
                    () =>
                    {
                        Assert.strictEqual(daysOfMonth.takeLast().value, "2024-01-31 23:59");
                        Assert.strictEqual(daysOfMonth.takeLast().dateValue, "2024-01-31");
                    }
                );
            });

        suite("For 2024 feb (leap year)", () =>
        {
            const daysOfMonth = new DateTime({ value: "2024-02-01 10:00", zone: "utc" }).getDaysOfMonth();

            test(`Given a DateTime object with value in leap year February "2024-02-01 10:00"
            when daysOfMonth is calculated for that DateTime
            then it should return an array of 29 days`,
                () =>
                {
                    Assert.strictEqual(daysOfMonth.length, 29);
                }
            );

            test(`Given a DateTime object with value in leap year February "2024-02-01 10:00"
            when daysOfMonth is calculated for that DateTime
            then first element of the array should represent first day of month`,
                () =>
                {
                    Assert.strictEqual(daysOfMonth.takeFirst().value, "2024-02-01 00:00");
                    Assert.strictEqual(daysOfMonth.takeFirst().dateValue, "2024-02-01");
                }
            );

            test(`Given a DateTime object with value in leap year February "2024-02-01 10:00"
            when daysOfMonth is calculated for that DateTime
            then last element of the array should represent last day of month`,
                () =>
                {
                    Assert.strictEqual(daysOfMonth.takeLast().value, "2024-02-29 23:59");
                    Assert.strictEqual(daysOfMonth.takeLast().dateValue, "2024-02-29");
                }
            );
        });

        suite("for 2023 feb (non leap year)", () =>
        {
            const daysOfMonth = new DateTime({ value: "2023-02-01 10:00", zone: "utc" }).getDaysOfMonth();

            test(`Given a DateTime object with value in non leap year February "2023-02-01 10:00"
            when daysOfMonth is calculated for that DateTime
            then it should return an array of 28 days`,
                () =>
                {
                    Assert.strictEqual(daysOfMonth.length, 28);
                }
            );

            test(`Given a DateTime object with value in non leap year February "2024-02-01 10:00"
            when daysOfMonth is calculated for that DateTime
            then first element of the array should represent first day of month`,
                () =>
                {
                    Assert.strictEqual(daysOfMonth.takeFirst().value, "2023-02-01 00:00");
                    Assert.strictEqual(daysOfMonth.takeFirst().dateValue, "2023-02-01");
                }
            );

            test(`Given a DateTime object with value in non leap year February "2024-02-01 10:00"
            when daysOfMonth is calculated for that DateTime
            then last element of the array should represent last day of month`,
                () =>
                {
                    Assert.strictEqual(daysOfMonth.takeLast().value, "2023-02-28 23:59");
                    Assert.strictEqual(daysOfMonth.takeLast().dateValue, "2023-02-28");
                }
            );
        });
    });

    suite("Convert to zone", () =>
    {
        const value = "2024-01-01 10:00";

        const dateTime = new DateTime({ value, zone: "utc" });

        test(`Given a DateTime object with value (${value}) and zone (utc)
        when a DateTime is converted to another zone
        then DateTime returned should have zone set to the new zone`,
            () =>
            {
                Assert.strictEqual(dateTime.convertToZone("utc").zone, "utc");
                Assert.strictEqual(dateTime.convertToZone("UTC+5:30").zone, "UTC+5:30");
                Assert.strictEqual(dateTime.convertToZone("America/Los_Angeles").zone, "America/Los_Angeles");
            }
        );

        test(`Given a DateTime object with value (${value}) and zone (utc)
        when a DateTime is converted to another zone
        then DateTime returned should have value changed with a difference of offset between the zones`,
            () =>
            {
                Assert.strictEqual(dateTime.convertToZone("utc").value, value);
                Assert.strictEqual(dateTime.convertToZone("UTC+5:30").value, "2024-01-01 15:30");
            }
        );

        test(`Given a DateTime object with value ("2024-01-01 10:00") outside DST and zone (utc)
        when a DateTime is converted to America/Los_Angeles (PST - Pacific Standard Time)
        then DateTime returned should have value changed with -8 hours`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });
                Assert.strictEqual(dateTime.convertToZone("America/Los_Angeles").value, "2024-01-01 02:00");
            }
        );

        test(`Given a DateTime object with value ("2024-06-01 10:00") within DST and zone (utc)
        when a DateTime is converted to America/Los_Angeles (PDT — Pacific Daylight Time)
        then DateTime returned should have value changed with -7 hours`,
            () =>
            {
                const dateTime = new DateTime({ value: "2024-06-01 10:00", zone: "utc" });
                Assert.strictEqual(dateTime.convertToZone("America/Los_Angeles").value, "2024-06-01 03:00");
            }
        );

        suite("Check Invalid param for zone", () =>
        {
            const dateTime = new DateTime({ value: "2024-01-01 10:00", zone: "utc" });

            function checkIsInvalidParam(zone: string, reason: string): void
            {
                test(`Given a DateTime (${dateTime.toString()}), and a zone to convert it to (${zone})
                when ${reason}
                then it should throw a validation error`,
                    () =>
                    {
                        Assert.throws(() => dateTime.convertToZone(zone), ArgumentException);
                    }
                );
            }

            checkIsInvalidParam("", "zone is an empty string");
            checkIsInvalidParam("aksfljn", "zone is a random string");
            checkIsInvalidParam("local", "zone is local");
            checkIsInvalidParam("America/LosAngeles", "zone is misspelled"); // correct is America/Los_Angeles
            checkIsInvalidParam("UTC+14:01", "zone is invalid");
            checkIsInvalidParam("UTC-12:01", "zone is invalid");
            checkIsInvalidParam("UTC+15", "zone is invalid");
            checkIsInvalidParam("UTC-13", "zone is invalid");
        });
    });
});

