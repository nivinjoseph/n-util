# Background Processor

The `BackgroundProcessor` class provides a mechanism for processing actions in the background with configurable intervals and error handling. It implements the `Disposable` interface for proper resource cleanup.

## Features

- Asynchronous action processing
- Configurable processing intervals
- Custom error handling
- Queue management
- Disposable pattern implementation
- Optional queue killing on disposal

## Usage

```typescript
import { BackgroundProcessor } from "n-util";

// Create a processor with default error handling
const processor = new BackgroundProcessor(
    async (error) => console.error("Error:", error),
    1000, // break interval in milliseconds
    true  // break only when no work
);

// Process an action
processor.processAction(
    async () => {
        // Your async action here
        await someAsyncOperation();
    },
    async (error) => {
        // Optional custom error handling
        console.error("Custom error handling:", error);
    }
);

// Dispose when done
await processor.dispose();
```

## API Reference

### Constructor
```typescript
constructor(
    defaultErrorHandler: (e: Error) => Promise<void>,
    breakIntervalMilliseconds = 1000,
    breakOnlyWhenNoWork = true
)
```
Creates a new background processor instance.

- Parameters:
  - `defaultErrorHandler`: Function to handle errors during action execution
  - `breakIntervalMilliseconds`: Time between processing attempts (default: 1000ms)
  - `breakOnlyWhenNoWork`: Whether to break only when no work is available (default: true)

### Properties

#### queueLength
```typescript
get queueLength(): number
```
Gets the current number of actions waiting to be processed.

### Methods

#### processAction
```typescript
processAction(
    action: () => Promise<void>,
    errorHandler?: (e: Error) => Promise<void>
): void
```
Adds an action to the processing queue.

- Parameters:
  - `action`: The async function to execute
  - `errorHandler`: Optional custom error handler for this action

#### dispose
```typescript
dispose(killQueue = false): Promise<void>
```
Disposes of the processor and optionally kills the remaining queue.

- Parameters:
  - `killQueue`: Whether to kill the remaining queue (default: false)
- Returns: Promise that resolves when disposal is complete

## Examples

### Basic Usage
```typescript
const processor = new BackgroundProcessor(
    async (error) => console.error(error)
);

// Add actions to the queue
processor.processAction(async () => {
    await someAsyncOperation();
});

// Check queue length
console.log(`Queue length: ${processor.queueLength}`);

// Dispose when done
await processor.dispose();
```

### Custom Error Handling
```typescript
const processor = new BackgroundProcessor(
    async (error) => console.error("Default error:", error)
);

processor.processAction(
    async () => {
        throw new Error("Something went wrong");
    },
    async (error) => {
        console.error("Custom error handling:", error);
        // Additional error handling logic
    }
);
```

### Configuring Processing Intervals
```typescript
// Process every 500ms
const fastProcessor = new BackgroundProcessor(
    errorHandler,
    500,
    false
);

// Process only when no work is available
const efficientProcessor = new BackgroundProcessor(
    errorHandler,
    1000,
    true
);
```

## Notes

- The processor implements the `Disposable` interface
- Actions are processed in the order they are added (FIFO)
- Error handlers are called asynchronously
- The processor can be configured to break between actions or only when no work is available
- Disposal can be configured to either complete remaining work or kill the queue
- All actions are executed asynchronously
- Error handling is comprehensive and includes both sync and async error cases 