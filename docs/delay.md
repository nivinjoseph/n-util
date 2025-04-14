# Delay

The `Delay` class provides utility methods for creating time-based delays in asynchronous code. It supports different time units and includes cancellation capabilities.

## Features

- Multiple time unit support (hours, minutes, seconds, milliseconds)
- Cancellable delays
- Type-safe time values
- Input validation
- Promise-based implementation

## Usage

```typescript
import { Delay, DelayCanceller } from "n-util";

// Basic delay
await Delay.seconds(5);

// Delay with cancellation
const canceller: DelayCanceller = {};
const delayPromise = Delay.minutes(1, canceller);

// Cancel the delay
canceller.cancel?.();
```

## API Reference

### Static Methods

#### hours
```typescript
static async hours(value: number, canceller?: DelayCanceller): Promise<void>
```
Creates a delay for the specified number of hours.

- Parameters:
  - `value`: Number of hours to delay (must be >= 0)
  - `canceller`: Optional cancellation object
- Returns: Promise that resolves after the delay
- Throws: Error if value is negative

#### minutes
```typescript
static async minutes(value: number, canceller?: DelayCanceller): Promise<void>
```
Creates a delay for the specified number of minutes.

- Parameters:
  - `value`: Number of minutes to delay (must be >= 0)
  - `canceller`: Optional cancellation object
- Returns: Promise that resolves after the delay
- Throws: Error if value is negative

#### seconds
```typescript
static async seconds(value: number, canceller?: DelayCanceller): Promise<void>
```
Creates a delay for the specified number of seconds.

- Parameters:
  - `value`: Number of seconds to delay (must be >= 0)
  - `canceller`: Optional cancellation object
- Returns: Promise that resolves after the delay
- Throws: Error if value is negative

#### milliseconds
```typescript
static milliseconds(value: number, canceller?: DelayCanceller): Promise<void>
```
Creates a delay for the specified number of milliseconds.

- Parameters:
  - `value`: Number of milliseconds to delay (must be >= 0)
  - `canceller`: Optional cancellation object
- Returns: Promise that resolves after the delay
- Throws: Error if value is negative

### Types

#### DelayCanceller
```typescript
type DelayCanceller = { cancel?(): void; }
```
Type for the cancellation object that can be used to cancel a delay.

## Examples

### Basic Delay
```typescript
// Delay for 5 seconds
await Delay.seconds(5);
console.log("5 seconds have passed");

// Delay for 2 minutes
await Delay.minutes(2);
console.log("2 minutes have passed");
```

### Cancellable Delay
```typescript
const canceller: DelayCanceller = {};

// Start a 1-minute delay
const delayPromise = Delay.minutes(1, canceller);

// Cancel the delay after 30 seconds
setTimeout(() => {
    canceller.cancel?.();
}, 30000);

// The promise will resolve (not reject) when cancelled
await delayPromise;
console.log("Delay completed or was cancelled");
```

### Chained Delays
```typescript
// Chain multiple delays
await Delay.seconds(1);
console.log("1 second passed");
await Delay.seconds(2);
console.log("2 more seconds passed");
await Delay.seconds(3);
console.log("3 more seconds passed");
```

### Error Handling
```typescript
try {
    // This will throw an error
    await Delay.seconds(-1);
} catch (error) {
    console.error("Invalid delay value:", error);
}
```

## Notes

- All delay methods are static
- Time values must be non-negative
- Cancellation is optional and can be provided through the `DelayCanceller` type
- The class uses `setTimeout` internally for delays
- Cancellation immediately resolves the delay promise (does not throw an error)
- All methods return Promises that can be awaited
- The class is particularly useful for:
  - Rate limiting
  - Retry mechanisms
  - Timeout implementations
  - Scheduled operations
  - Testing async code 