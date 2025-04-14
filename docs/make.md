# Make Utility

The `Make` class provides a collection of utility methods for common programming patterns and operations, including retry logic, async/sync conversion, error handling, and random value generation.

## Features

- Retry operations with configurable attempts and delays
- Exponential backoff retry strategy
- Sync to async conversion
- Callback to promise conversion
- Loop operations (sync and async)
- Error suppression
- Random value generation (integers, codes, text)

## Usage

### Retry Operations

#### Basic Retry
```typescript
import { Make } from "n-util";

// Example of a function that might fail
async function fetchData(url: string): Promise<any> {
    // Implementation that might throw errors
}

// Create a retry wrapper
const retryFetch = Make.retry(fetchData, 3);

// Use the retry wrapper
try {
    const data = await retryFetch("https://api.example.com/data");
    console.log(data);
} catch (error) {
    console.error("All retry attempts failed:", error);
}
```

#### Retry with Delay
```typescript
// Retry with delay between attempts
const retryWithDelay = Make.retryWithDelay(fetchData, 3, 1000); // 1 second delay

// Use with error predicate
const retryWithPredicate = Make.retryWithDelay(
    fetchData,
    3,
    1000,
    (error) => error.statusCode === 429 // Only retry on rate limit
);
```

#### Exponential Backoff
```typescript
// Retry with exponential backoff
const retryWithBackoff = Make.retryWithExponentialBackoff(fetchData, 3);

// Use with custom error handling
const retryWithCustomBackoff = Make.retryWithExponentialBackoff(
    fetchData,
    3,
    (error) => error.isRetryable
);
```

### Async/Sync Conversion

#### Sync to Async
```typescript
// Convert synchronous function to async
function processData(data: any): string {
    // Synchronous processing
    return JSON.stringify(data);
}

const asyncProcess = Make.syncToAsync(processData);

// Now can be used with await
const result = await asyncProcess({ key: "value" });
```

#### Callback to Promise
```typescript
// Convert callback-style function to promise
function readFile(path: string, callback: (error: Error | null, data?: string) => void): void {
    // Implementation with callback
}

const readFilePromise = Make.callbackToPromise<string>(readFile);

// Now can be used with async/await
try {
    const content = await readFilePromise("/path/to/file");
    console.log(content);
} catch (error) {
    console.error("Error reading file:", error);
}
```

### Loop Operations

#### Synchronous Loop
```typescript
// Execute a function multiple times
Make.loop((index) => {
    console.log(`Processing item ${index}`);
}, 5);
```

#### Asynchronous Loop
```typescript
// Execute async function multiple times with parallelism
async function processItem(index: number): Promise<void> {
    // Async processing
}

// Process 10 items with max 3 concurrent operations
await Make.loopAsync(processItem, 10, 3);
```

### Error Suppression

#### Sync Error Suppression
```typescript
// Wrap a function to suppress errors
function riskyOperation(): string {
    // Might throw errors
}

const safeOperation = Make.errorSuppressed(riskyOperation, "default");
const result = safeOperation(); // Returns "default" if error occurs
```

#### Async Error Suppression
```typescript
// Wrap an async function to suppress errors
async function riskyAsyncOperation(): Promise<string> {
    // Might throw errors
}

const safeAsyncOperation = Make.errorSuppressedAsync(riskyAsyncOperation, "default");
const result = await safeAsyncOperation(); // Returns "default" if error occurs
```

### Random Value Generation

#### Random Integer
```typescript
// Generate random integer between min (inclusive) and max (exclusive)
const randomNumber = Make.randomInt(1, 100); // 1 to 99
```

#### Random Code
```typescript
// Generate random alphanumeric code
const code = Make.randomCode(8); // 8-character code
```

#### Random Text Code
```typescript
// Generate random text code (letters only)
const textCode = Make.randomTextCode(6); // 6-letter code
const caseInsensitiveCode = Make.randomTextCode(6, true); // Lowercase only
```

#### Random Numeric Code
```typescript
// Generate random numeric code
const numericCode = Make.randomNumericCode(4); // 4-digit code
```

## API Reference

### Make Class
```typescript
class Make
```
A utility class providing various helper methods.

#### Methods

##### retry
```typescript
static retry<T>(
    func: (...params: Array<any>) => Promise<T>,
    numberOfRetries: number,
    errorPredicate?: (error: any) => boolean
): (...params: Array<any>) => Promise<T>
```
Creates a retry wrapper for an async function.

##### retryWithDelay
```typescript
static retryWithDelay<T>(
    func: (...params: Array<any>) => Promise<T>,
    numberOfRetries: number,
    delayMS: number,
    errorPredicate?: (error: any) => boolean
): (...params: Array<any>) => Promise<T>
```
Creates a retry wrapper with delay between attempts.

##### retryWithExponentialBackoff
```typescript
static retryWithExponentialBackoff<T>(
    func: (...params: Array<any>) => Promise<T>,
    numberOfRetries: number,
    errorPredicate?: (error: any) => boolean
): (...params: Array<any>) => Promise<T>
```
Creates a retry wrapper with exponential backoff.

##### syncToAsync
```typescript
static syncToAsync<T>(
    func: (...params: Array<any>) => T
): (...params: Array<any>) => Promise<T>
```
Converts a synchronous function to async.

##### callbackToPromise
```typescript
static callbackToPromise<T>(
    func: (...params: Array<any>) => void
): (...params: Array<any>) => Promise<T>
```
Converts a callback-style function to promise.

##### loop
```typescript
static loop(
    func: (index: number) => void,
    numberOfTimes: number
): void
```
Executes a function multiple times.

##### loopAsync
```typescript
static loopAsync(
    asyncFunc: (index: number) => Promise<void>,
    numberOfTimes: number,
    degreesOfParallelism?: number
): Promise<void>
```
Executes an async function multiple times with optional parallelism.

##### errorSuppressed
```typescript
static errorSuppressed<T extends (...params: Array<any>) => U, U>(
    func: T,
    defaultValue: U | null = null
): T
```
Creates an error-suppressed version of a function.

##### errorSuppressedAsync
```typescript
static errorSuppressedAsync<T extends (...params: Array<any>) => Promise<U>, U>(
    asyncFunc: T,
    defaultValue: U | null = null
): T
```
Creates an error-suppressed version of an async function.

##### randomInt
```typescript
static randomInt(min: number, max: number): number
```
Generates a random integer between min (inclusive) and max (exclusive).

##### randomCode
```typescript
static randomCode(numChars: number): string
```
Generates a random alphanumeric code.

##### randomTextCode
```typescript
static randomTextCode(numChars: number, caseInsensitive?: boolean): string
```
Generates a random text code.

##### randomNumericCode
```typescript
static randomNumericCode(numChars: number): string
```
Generates a random numeric code.

## Best Practices

1. **Retry Operations**:
   - Use appropriate retry strategies based on error types
   - Implement error predicates for selective retries
   - Consider rate limiting and backoff strategies

2. **Async Operations**:
   - Use proper error handling
   - Consider timeout scenarios
   - Handle cancellation when possible

3. **Random Generation**:
   - Use appropriate methods for different use cases
   - Consider security implications
   - Validate generated values when needed

4. **Error Suppression**:
   - Use judiciously and document suppressed errors
   - Provide meaningful default values
   - Log suppressed errors for debugging

## Examples

### Complex Retry Scenario
```typescript
// Example of complex retry logic with multiple conditions
async function complexOperation(): Promise<any> {
    // Implementation
}

const retryOperation = Make.retryWithExponentialBackoff(
    complexOperation,
    5,
    (error) => {
        // Only retry on specific error types
        return error.isRetryable || 
               error.statusCode === 429 || 
               error.statusCode === 503;
    }
);

try {
    const result = await retryOperation();
    console.log("Operation successful:", result);
} catch (error) {
    console.error("Operation failed after all retries:", error);
}
```

### Parallel Processing
```typescript
// Example of parallel processing with error handling
async function processBatch(items: any[]): Promise<void> {
    const processItem = Make.errorSuppressedAsync(
        async (item) => {
            // Process individual item
            await processSingleItem(item);
        },
        null
    );

    await Make.loopAsync(
        async (index) => {
            await processItem(items[index]);
        },
        items.length,
        3 // Process 3 items concurrently
    );
}
```

### Secure Code Generation
```typescript
// Example of secure code generation for authentication
class AuthenticationService {
    private generateVerificationCode(): string {
        return Make.randomNumericCode(6); // 6-digit verification code
    }

    private generateApiKey(): string {
        return Make.randomCode(32); // 32-character API key
    }

    private generatePasswordResetToken(): string {
        return Make.randomTextCode(16, true); // 16-character lowercase token
    }
}
``` 