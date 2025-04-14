# Duration

The `Duration` class provides a robust way to handle time durations in various units (milliseconds, seconds, minutes, hours, days, and weeks). It offers conversion between different time units and supports rounding operations.

## Features

- Multiple unit creation methods (milliseconds, seconds, minutes, hours, days, weeks)
- Conversion between different time units
- Rounding support for all conversions
- Immutable design
- Type-safe operations

## Usage

```typescript
import { Duration } from "n-util";

// Create durations in different units
const ms = Duration.fromMilliSeconds(1500);
const secs = Duration.fromSeconds(90);
const mins = Duration.fromMinutes(2.5);
const hours = Duration.fromHours(1.5);
const days = Duration.fromDays(3);
const weeks = Duration.fromWeeks(2);

// Convert between units
const seconds = ms.toSeconds(); // 1.5
const minutes = secs.toMinutes(); // 1.5
const hours = mins.toHours(); // 0.041666666666666664
const days = hours.toDays(); // 0.0625
const weeks = days.toWeeks(); // 0.008928571428571428

// Convert with rounding
const roundedSeconds = ms.toSeconds(true); // 2
const roundedMinutes = secs.toMinutes(true); // 2
const roundedHours = mins.toHours(true); // 0
const roundedDays = hours.toDays(true); // 0
const roundedWeeks = days.toWeeks(true); // 0
```

## API Reference

### Static Methods

#### fromMilliSeconds
```typescript
static fromMilliSeconds(milliSeconds: number): Duration
```
Creates a Duration from milliseconds.

#### fromSeconds
```typescript
static fromSeconds(seconds: number): Duration
```
Creates a Duration from seconds.

#### fromMinutes
```typescript
static fromMinutes(minutes: number): Duration
```
Creates a Duration from minutes.

#### fromHours
```typescript
static fromHours(hours: number): Duration
```
Creates a Duration from hours.

#### fromDays
```typescript
static fromDays(days: number): Duration
```
Creates a Duration from days.

#### fromWeeks
```typescript
static fromWeeks(weeks: number): Duration
```
Creates a Duration from weeks.

### Instance Methods

#### toMilliSeconds
```typescript
toMilliSeconds(round = false): number
```
Converts the duration to milliseconds.

#### toSeconds
```typescript
toSeconds(round = false): number
```
Converts the duration to seconds.

#### toMinutes
```typescript
toMinutes(round = false): number
```
Converts the duration to minutes.

#### toHours
```typescript
toHours(round = false): number
```
Converts the duration to hours.

#### toDays
```typescript
toDays(round = false): number
```
Converts the duration to days.

#### toWeeks
```typescript
toWeeks(round = false): number
```
Converts the duration to weeks.

## Best Practices

1. Use the most appropriate unit for your use case when creating durations
2. Consider using rounding when displaying durations to users
3. Store durations in the smallest unit (milliseconds) when persisting
4. Use the class for all time-based calculations to ensure consistency
5. Take advantage of the immutable design for safer operations

## Examples

### Creating Durations

```typescript
// Create a 2.5 hour duration
const duration = Duration.fromHours(2.5);

// Create a 90 second duration
const duration = Duration.fromSeconds(90);

// Create a 1 week duration
const duration = Duration.fromWeeks(1);
```

### Converting Durations

```typescript
// Convert 2.5 hours to minutes
const hours = Duration.fromHours(2.5);
const minutes = hours.toMinutes(); // 150

// Convert 90 seconds to minutes with rounding
const seconds = Duration.fromSeconds(90);
const roundedMinutes = seconds.toMinutes(true); // 2
```

### Using with DateTime

```typescript
import { DateTime, Duration } from "n-util";

const now = DateTime.now("UTC");
const twoHoursLater = now.addTime(Duration.fromHours(2));
const threeDaysAgo = now.subtractTime(Duration.fromDays(3));
``` 