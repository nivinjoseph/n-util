# UUID

The `Uuid` class provides a simple interface for generating UUID (Universally Unique Identifier) values using the `uuid` package. It follows the singleton pattern and provides a static method for creating version 4 UUIDs.

## Features

- Simple UUID generation
- Version 4 UUID support (random)
- Singleton pattern implementation
- Type-safe interface

## Usage

```typescript
import { Uuid } from "n-util";

// Generate a new UUID
const id = Uuid.create();
console.log(id); // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

## API Reference

### Static Methods

#### create
```typescript
static create(): string
```
Generates a new version 4 UUID.

- Returns: A string containing the generated UUID in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

## Best Practices

1. Use `Uuid.create()` for generating unique identifiers
2. Store UUIDs as strings in your database
3. Use UUIDs when you need globally unique identifiers
4. Consider using UUIDs for distributed systems where coordination is difficult
5. Be aware that UUIDs are not sequential and may impact database performance

## Examples

### Basic Usage
```typescript
import { Uuid } from "n-util";

// Generate a new UUID
const id = Uuid.create();
console.log(id); // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

### Using UUIDs in Objects
```typescript
interface User {
    id: string;
    name: string;
}

function createUser(name: string): User {
    return {
        id: Uuid.create(),
        name: name
    };
}

const user = createUser("John Doe");
console.log(user); // { id: "550e8400-e29b-41d4-a716-446655440000", name: "John Doe" }
```

### Using UUIDs in Arrays
```typescript
interface Item {
    id: string;
    name: string;
}

const items: Item[] = [
    { id: Uuid.create(), name: "Item 1" },
    { id: Uuid.create(), name: "Item 2" },
    { id: Uuid.create(), name: "Item 3" }
];

console.log(items);
// [
//   { id: "550e8400-e29b-41d4-a716-446655440000", name: "Item 1" },
//   { id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", name: "Item 2" },
//   { id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8", name: "Item 3" }
// ]
```

## Notes

- The `Uuid` class uses the `uuid` package internally
- Version 4 UUIDs are randomly generated and have a very low probability of collision
- The class follows the singleton pattern to prevent instantiation
- UUIDs are 128-bit numbers represented as 32 hexadecimal digits, displayed in five groups separated by hyphens 