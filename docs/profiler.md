# Profiler Documentation

## Overview
The `Profiler` class provides a simple way to track and measure execution time of operations in your code. It creates a timeline of events with timestamps and calculates the time difference between consecutive operations, making it useful for performance analysis and debugging.

## Features
- Timestamp tracking for operations
- Automatic time difference calculation
- Read-only access to trace history
- Unique identifier for each profiler instance
- Simple and lightweight implementation

## Usage Examples

### Basic Usage
```typescript
// Create a profiler with an identifier
const profiler = new Profiler("dataProcessing");

// Record operations with messages
profiler.trace("Starting data fetch");
await fetchData();
profiler.trace("Data fetch completed");

profiler.trace("Processing data");
await processData();
profiler.trace("Processing completed");

// Access trace history
console.log(profiler.traces);
```

### Performance Analysis
```typescript
const profiler = new Profiler("apiCall");

profiler.trace("Making API request");
const response = await makeApiCall();
profiler.trace("API response received");

profiler.trace("Processing response");
const result = processResponse(response);
profiler.trace("Response processed");

// Analyze timing
profiler.traces.forEach(trace => {
    console.log(`${trace.message}: ${trace.diffMs}ms`);
});
```

## API Reference

### ProfilerTrace Interface
```typescript
interface ProfilerTrace {
    readonly dateTime: number;  // Unix timestamp in milliseconds
    readonly message: string;   // Description of the operation
    readonly diffMs: number;    // Time difference from previous trace in milliseconds
}
```

### Profiler Class

#### Constructor
```typescript
constructor(id: string)
```
Creates a new profiler instance.
- `id`: Unique identifier for the profiler

#### Properties
- `id`: string - The unique identifier of the profiler
- `traces`: ReadonlyArray<ProfilerTrace> - The history of recorded traces

#### Methods

##### trace()
```typescript
trace(message: string): void
```
Records a new trace with the current timestamp.
- `message`: Description of the operation being recorded

## Best Practices

1. **Meaningful Messages**
   ```typescript
   // Good
   profiler.trace("Starting user authentication");
   
   // Bad
   profiler.trace("Step 1");
   ```

2. **Consistent Granularity**
   ```typescript
   // Good - consistent level of detail
   profiler.trace("Fetching user data");
   profiler.trace("Processing user preferences");
   
   // Bad - mixed levels of detail
   profiler.trace("Starting process");
   profiler.trace("Getting user ID from database and validating format");
   ```

3. **Error Handling**
   ```typescript
   try {
       profiler.trace("Starting risky operation");
       await riskyOperation();
       profiler.trace("Operation completed successfully");
   } catch (error) {
       profiler.trace("Operation failed");
       throw error;
   }
   ```

4. **Performance Analysis**
   ```typescript
   // Use diffMs to identify bottlenecks
   const slowTraces = profiler.traces.filter(trace => trace.diffMs > 1000);
   console.log("Slow operations:", slowTraces);
   ```

## Common Patterns

### API Call Profiling
```typescript
class ApiClient {
    private profiler: Profiler;

    constructor() {
        this.profiler = new Profiler("ApiClient");
    }

    async makeRequest(url: string) {
        this.profiler.trace(`Starting request to ${url}`);
        const response = await fetch(url);
        this.profiler.trace("Response received");

        this.profiler.trace("Processing response");
        const data = await response.json();
        this.profiler.trace("Response processed");

        return data;
    }

    getPerformanceReport() {
        return this.profiler.traces;
    }
}
```

### Batch Processing Profiling
```typescript
async function processBatch(items: Array<any>) {
    const profiler = new Profiler("batchProcessing");
    
    profiler.trace("Starting batch processing");
    for (const item of items) {
        profiler.trace(`Processing item ${item.id}`);
        await processItem(item);
        profiler.trace(`Item ${item.id} processed`);
    }
    profiler.trace("Batch processing completed");

    return profiler.traces;
}
```

## Notes
- Timestamps are in milliseconds since Unix epoch
- The first trace is automatically created when the profiler is instantiated
- Time differences are calculated between consecutive traces
- The trace history is read-only to prevent accidental modification
- Useful for both development debugging and production monitoring 