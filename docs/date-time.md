# DateTime

The `DateTime` class provides a robust date and time handling system with timezone support, built on top of Luxon. It offers a wide range of functionality for date/time manipulation, comparison, and formatting.

## Features

- Timezone-aware date and time handling
- Multiple creation methods (timestamp, codes, values)
- Date and time comparison operations
- Timezone conversion
- Duration calculations
- Calendar operations
- ISO string formatting
- Validation utilities

## Usage

```typescript
import { DateTime } from "n-util";

// Create a DateTime instance for the current time
const now = DateTime.now("UTC");

// Create from timestamp
const fromTimestamp = DateTime.createFromTimestamp(1678901234, "UTC");

// Create from date and time codes
const fromCodes = DateTime.createFromCodes("20240315", "1430", "UTC");

// Create from date and time values
const fromValues = DateTime.createFromValues("2024-03-15", "14:30", "UTC");

// Convert to different timezone
const inNewYork = fromValues.convertToZone("America/New_York");

// Compare dates
const isAfter = fromValues.isAfter(now);
const isBefore = fromValues.isBefore(now);
const isSame = fromValues.isSame(now);

// Calculate differences
const timeDiff = fromValues.timeDiff(now);
const daysDiff = fromValues.daysDiff(now);

// Add/subtract time
const future = fromValues.addTime(Duration.fromHours(2));
const past = fromValues.subtractTime(Duration.fromDays(1));

// Get days of month
const monthDays = fromValues.getDaysOfMonth();
```

## API Reference

### Static Properties

#### currentZone
```typescript
static get currentZone(): string
```
Returns the system's local timezone.

### Static Methods

#### now
```typescript
static now(zone?: string): DateTime
```
Creates a DateTime instance for the current time in the specified timezone.

#### createFromTimestamp
```typescript
static createFromTimestamp(timestamp: number, zone: string): DateTime
```
Creates a DateTime from Unix timestamp (seconds since epoch).

#### createFromMilliSecondsSinceEpoch
```typescript
static createFromMilliSecondsSinceEpoch(milliseconds: number, zone: string): DateTime
```
Creates a DateTime from milliseconds since epoch.

#### createFromCodes
```typescript
static createFromCodes(dateCode: string, timeCode: string, zone: string): DateTime
```
Creates a DateTime from date and time codes.

#### createFromValues
```typescript
static createFromValues(dateValue: string, timeValue: string, zone: string): DateTime
```
Creates a DateTime from date and time values.

#### min
```typescript
static min(dateTime1: DateTime, dateTime2: DateTime): DateTime
```
Returns the earlier of two DateTime instances.

#### max
```typescript
static max(dateTime1: DateTime, dateTime2: DateTime): DateTime
```
Returns the later of two DateTime instances.

#### validateDateTimeFormat
```typescript
static validateDateTimeFormat(value: string): boolean
```
Validates if a string matches the DateTime format.

#### validateDateFormat
```typescript
static validateDateFormat(value: string): boolean
```
Validates if a string matches the date format.

#### validateTimeFormat
```typescript
static validateTimeFormat(value: string): boolean
```
Validates if a string matches the time format.

#### validateTimeZone
```typescript
static validateTimeZone(zone: string): boolean
```
Validates if a string is a valid timezone.

### Instance Properties

#### value
```typescript
get value(): string
```
The formatted date and time string.

#### zone
```typescript
get zone(): string
```
The timezone identifier.

#### timestamp
```typescript
get timestamp(): number
```
The Unix timestamp in seconds.

#### dateCode
```typescript
get dateCode(): string
```
The date code in YYYYMMDD format.

#### timeCode
```typescript
get timeCode(): string
```
The time code in HHMM format.

#### dateValue
```typescript
get dateValue(): string
```
The date value in YYYY-MM-DD format.

#### timeValue
```typescript
get timeValue(): string
```
The time value in HH:mm format.

#### isPast
```typescript
get isPast(): boolean
```
Whether the DateTime is in the past.

#### isFuture
```typescript
get isFuture(): boolean
```
Whether the DateTime is in the future.

### Instance Methods

#### equals
```typescript
equals(value?: DateTime | null): boolean
```
Compares two DateTime instances for equality.

#### toString
```typescript
toString(): string
```
Returns the string representation of the DateTime.

#### toStringDateTime
```typescript
toStringDateTime(): string
```
Returns the date and time string.

#### toStringISO
```typescript
toStringISO(): string
```
Returns the ISO string representation.

#### isSame
```typescript
isSame(value: DateTime): boolean
```
Checks if two DateTime instances represent the same instant.

#### isBefore
```typescript
isBefore(value: DateTime): boolean
```
Checks if this DateTime is before another.

#### isSameOrBefore
```typescript
isSameOrBefore(value: DateTime): boolean
```
Checks if this DateTime is the same or before another.

#### isAfter
```typescript
isAfter(value: DateTime): boolean
```
Checks if this DateTime is after another.

#### isSameOrAfter
```typescript
isSameOrAfter(value: DateTime): boolean
```
Checks if this DateTime is the same or after another.

#### isBetween
```typescript
isBetween(start: DateTime, end: DateTime): boolean
```
Checks if this DateTime is between two others.

#### timeDiff
```typescript
timeDiff(value: DateTime): Duration
```
Calculates the time difference between two DateTime instances.

#### daysDiff
```typescript
daysDiff(value: DateTime): number
```
Calculates the days difference between two DateTime instances.

#### isSameDay
```typescript
isSameDay(value: DateTime): boolean
```
Checks if two DateTime instances are on the same day.

#### addTime
```typescript
addTime(time: Duration): DateTime
```
Adds a duration to the DateTime.

#### subtractTime
```typescript
subtractTime(time: Duration): DateTime
```
Subtracts a duration from the DateTime.

#### addDays
```typescript
addDays(days: number): DateTime
```
Adds days to the DateTime.

#### subtractDays
```typescript
subtractDays(days: number): DateTime
```
Subtracts days from the DateTime.

#### getDaysOfMonth
```typescript
getDaysOfMonth(): Array<DateTime>
```
Returns an array of DateTime instances for each day of the month.

#### convertToZone
```typescript
convertToZone(zone: string): DateTime
```
Converts the DateTime to a different timezone.

#### isWithinTimeRange
```typescript
isWithinTimeRange(startTimeCode: string, endTimeCode: string): boolean
```
Checks if the DateTime is within a time range.

## Timezone Support

The DateTime class supports:
- IANA timezone names (e.g., "America/New_York")
- UTC offsets (e.g., "UTC+3", "UTC-5")
- The special "UTC" timezone

## Format Specifications

- Date format: YYYY-MM-DD
- Time format: HH:mm
- DateTime format: YYYY-MM-DD HH:mm
- Date code format: YYYYMMDD
- Time code format: HHMM

## Best Practices

1. Always specify a timezone when creating DateTime instances
2. Use UTC for storage and convert to local timezone for display
3. Use the validation methods before parsing user input
4. Prefer using the provided comparison methods over direct timestamp comparison
5. Use Duration for time-based calculations
6. Consider timezone changes (DST) when working with dates 