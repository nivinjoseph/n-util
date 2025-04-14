# TypeHelper

The `TypeHelper` class provides utility methods for type conversion and validation in TypeScript. It offers safe parsing of values to common types and helper methods for working with enums.

## Features

- Safe parsing of values to boolean and number
- Enum type conversion utilities
- Type safety enforcement
- Null-safe operations

## Usage

```typescript
import { TypeHelper } from "n-util";

// Parse boolean values
const bool1 = TypeHelper.parseBoolean("true"); // true
const bool2 = TypeHelper.parseBoolean("false"); // false
const bool3 = TypeHelper.parseBoolean("invalid"); // null

// Parse number values
const num1 = TypeHelper.parseNumber("42"); // 42
const num2 = TypeHelper.parseNumber("3.14"); // 3.14
const num3 = TypeHelper.parseNumber("invalid"); // null

// Work with enums
enum Status {
    Active = "ACTIVE",
    Inactive = "INACTIVE"
}

const tuples = TypeHelper.enumTypeToTuples(Status);
// [["Active", "ACTIVE"], ["Inactive", "INACTIVE"]]

// Type safety enforcement
function handleStatus(status: Status): void {
    switch (status) {
        case Status.Active:
            // Handle active
            break;
        case Status.Inactive:
            // Handle inactive
            break;
        default:
            TypeHelper.impossible(status, "Invalid status value");
    }
}
```

## API Reference

### Static Methods

#### parseBoolean
```typescript
static parseBoolean(value: unknown): boolean | null
```
Parses a value to a boolean.

- Returns `true` for "true" (case-insensitive)
- Returns `false` for "false" (case-insensitive)
- Returns `null` for invalid values
- Returns the original value if it's already a boolean

#### parseNumber
```typescript
static parseNumber(value: unknown): number | null
```
Parses a value to a number.

- Returns the parsed number for valid numeric strings
- Returns the original value if it's already a number
- Returns `null` for invalid values or non-finite numbers

#### enumTypeToTuples
```typescript
static enumTypeToTuples<T extends string | number>(enumClass: object): Array<[string, T]>
```
Converts an enum type to an array of tuples.

- Each tuple contains [key, value] pairs
- Supports both string and numeric enums
- Returns an empty array for empty enums

#### impossible
```typescript
static impossible(_value: never, message?: string): never
```
Enforces type safety in switch statements.

- Throws an ApplicationException with the provided message
- Used to ensure exhaustive switch statements
- The `_value` parameter should be of type `never`

## Best Practices

1. Use `parseBoolean` and `parseNumber` for safe type conversion
2. Always handle the `null` case when using parse methods
3. Use `enumTypeToTuples` when you need to work with enum key-value pairs
4. Use `impossible` in switch statements to ensure type safety
5. Consider using TypeScript's type guards in combination with these utilities

## Examples

### Safe Type Conversion

```typescript
// Parse user input
const userInput = "true";
const isEnabled = TypeHelper.parseBoolean(userInput) ?? false;

// Parse numeric configuration
const configValue = "42";
const timeout = TypeHelper.parseNumber(configValue) ?? 30;
```

### Working with Enums

```typescript
enum Direction {
    North = "NORTH",
    South = "SOUTH",
    East = "EAST",
    West = "WEST"
}

// Get enum entries
const directions = TypeHelper.enumTypeToTuples(Direction);
// [["North", "NORTH"], ["South", "SOUTH"], ["East", "EAST"], ["West", "WEST"]]

// Type-safe handling
function handleDirection(direction: Direction): void {
    switch (direction) {
        case Direction.North:
            // Handle north
            break;
        case Direction.South:
            // Handle south
            break;
        case Direction.East:
            // Handle east
            break;
        case Direction.West:
            // Handle west
            break;
        default:
            TypeHelper.impossible(direction);
    }
}
```

### Type Safety Enforcement

```typescript
type Status = "active" | "inactive" | "pending";

function handleStatus(status: Status): void {
    switch (status) {
        case "active":
            // Handle active
            break;
        case "inactive":
            // Handle inactive
            break;
        case "pending":
            // Handle pending
            break;
        default:
            // TypeScript will error if a new status is added but not handled
            TypeHelper.impossible(status, "Unhandled status value");
    }
}
``` 