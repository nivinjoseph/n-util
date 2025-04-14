# Deferred

The `Deferred` class provides a way to create and control Promises externally. It's particularly useful when you need to resolve or reject a Promise from outside the Promise constructor.

## Features

- External Promise control
- Type-safe resolution and rejection
- Simple and clean API
- Generic type support

## Usage

```typescript
import { Deferred } from "n-util";

// Create a deferred promise
const deferred = new Deferred<string>();

// The promise can be awaited
const promise = deferred.promise;

// Resolve the promise from outside
deferred.resolve("Success!");

// Or reject it
deferred.reject(new Error("Something went wrong"));
```

## API Reference

### Constructor
```typescript
constructor()
```
Creates a new Deferred instance.

### Properties

#### promise
```typescript
get promise(): Promise<T>
```
Gets the underlying Promise that can be awaited.

### Methods

#### resolve
```typescript
resolve(value: T): void
```
Resolves the underlying Promise with the given value.

- Parameters:
  - `value`: The value to resolve the Promise with

#### reject
```typescript
reject(reason?: any): void
```
Rejects the underlying Promise with the given reason.

- Parameters:
  - `reason`: The reason for rejection (optional)

## Examples

### Basic Usage
```typescript
const deferred = new Deferred<number>();

// Set up the promise handling
deferred.promise
    .then(value => console.log(`Resolved with: ${value}`))
    .catch(error => console.error(`Rejected with: ${error}`));

// Resolve the promise
deferred.resolve(42);
```

### Async/Await Usage
```typescript
async function example() {
    const deferred = new Deferred<string>();
    
    // Simulate some async operation
    setTimeout(() => {
        deferred.resolve("Operation completed");
    }, 1000);
    
    // Wait for the result
    const result = await deferred.promise;
    console.log(result); // "Operation completed"
}
```

### Error Handling
```typescript
const deferred = new Deferred<void>();

deferred.promise
    .then(() => console.log("Success"))
    .catch(error => console.error(`Error: ${error.message}`));

// Reject the promise
deferred.reject(new Error("Operation failed"));
```

### Generic Type Usage
```typescript
interface UserData {
    id: string;
    name: string;
}

const deferred = new Deferred<UserData>();

deferred.promise
    .then(user => console.log(`User: ${user.name}`))
    .catch(error => console.error(error));

// Resolve with typed data
deferred.resolve({ id: "123", name: "John Doe" });
```

## Notes

- The Deferred pattern is useful when you need to control a Promise from outside its constructor
- The class is generic, allowing type-safe resolution values
- The underlying Promise is created immediately when the Deferred is instantiated
- Both resolution and rejection can be called from anywhere
- The Promise can only be resolved or rejected once
- Subsequent calls to resolve or reject after the first will have no effect
- The class is particularly useful in scenarios where you need to:
  - Convert callback-based APIs to Promises
  - Control async operations from multiple places
  - Create Promises that can be resolved/rejected from outside their scope 