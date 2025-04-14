# Time

The `Time` class provides utility methods for working with timestamps and time comparisons in JavaScript/TypeScript. It implements a singleton pattern and offers static methods for checking if a timestamp is in the past or future.

## Features

- Timestamp validation
- Past/future time checking
- Singleton pattern implementation
- Type-safe interface

## Usage

```typescript
import { Time } from "n-util";

// Check if a timestamp is in the past
const pastTime = Date.now() - 1000; // 1 second ago
console.log(Time.isPast(pastTime)); // true

// Check if a timestamp is in the future
const futureTime = Date.now() + 1000; // 1 second from now
console.log(Time.isFuture(futureTime)); // true
```

## API Reference

### Static Methods

#### isPast
```typescript
static isPast(time: number): boolean
```
Checks if a given timestamp is in the past.

- Parameters:
  - `time`: A timestamp in milliseconds since the Unix epoch
- Returns: `true` if the timestamp is in the past, `false` otherwise
- Throws: Error if the input is not a valid number

Example:
```typescript
const timestamp = Date.now() - 1000; // 1 second ago
console.log(Time.isPast(timestamp)); // true
```

#### isFuture
```typescript
static isFuture(time: number): boolean
```
Checks if a given timestamp is in the future.

- Parameters:
  - `time`: A timestamp in milliseconds since the Unix epoch
- Returns: `true` if the timestamp is in the future, `false` otherwise
- Throws: Error if the input is not a valid number

Example:
```typescript
const timestamp = Date.now() + 1000; // 1 second from now
console.log(Time.isFuture(timestamp)); // true
```

## Best Practices

1. Use `Time.isPast()` to validate expiration times
2. Use `Time.isFuture()` to validate future events
3. Always pass timestamps in milliseconds
4. Handle potential errors when working with timestamps
5. Consider timezone implications when working with timestamps

## Examples

### Checking Expiration
```typescript
interface Token {
    value: string;
    expiresAt: number;
}

function isTokenValid(token: Token): boolean {
    return !Time.isPast(token.expiresAt);
}

const token: Token = {
    value: "abc123",
    expiresAt: Date.now() + 3600000 // expires in 1 hour
};

console.log(isTokenValid(token)); // true
```

### Scheduling Future Events
```typescript
interface ScheduledEvent {
    name: string;
    scheduledTime: number;
}

function canScheduleEvent(event: ScheduledEvent): boolean {
    return Time.isFuture(event.scheduledTime);
}

const event: ScheduledEvent = {
    name: "Meeting",
    scheduledTime: Date.now() + 86400000 // scheduled for tomorrow
};

console.log(canScheduleEvent(event)); // true
```

### Time-based Validation
```typescript
class Cache<T> {
    private data: T | null = null;
    private expirationTime: number | null = null;

    set(value: T, ttl: number): void {
        this.data = value;
        this.expirationTime = Date.now() + ttl;
    }

    get(): T | null {
        if (this.expirationTime === null || Time.isPast(this.expirationTime)) {
            this.data = null;
            this.expirationTime = null;
            return null;
        }
        return this.data;
    }
}

const cache = new Cache<string>();
cache.set("cached value", 5000); // cache for 5 seconds
console.log(cache.get()); // "cached value"
setTimeout(() => console.log(cache.get()), 6000); // null
``` 