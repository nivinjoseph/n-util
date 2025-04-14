# Method Decorators

This module provides a set of decorators for controlling method execution patterns in TypeScript/JavaScript applications.

## Overview

The decorators in this module help manage method execution in various scenarios:
- Preventing rapid-fire calls (debounce)
- Ensuring single execution (dedupe)
- Synchronizing concurrent access (synchronize)
- Limiting execution frequency (throttle)

## Features

- Type-safe decorator implementations
- Support for async methods
- Configurable delay durations
- Automatic cleanup and state management
- Thread-safe implementations

## Usage

### Debounce

The `@debounce` decorator ensures a method is only called after a specified delay has passed since the last call.

```typescript
import { debounce, Duration } from "@nivinjoseph/n-util";

class Example {
    @debounce(Duration.fromSeconds(1))
    async handleInput(value: string): Promise<void> {
        // This will only execute after 1 second of no calls
        console.log(`Processing: ${value}`);
    }
}
```

### Dedupe

The `@dedupe` decorator ensures a method is only executed once at a time, with optional delay between executions.

```typescript
import { dedupe, Duration } from "@nivinjoseph/n-util";

class Example {
    @dedupe(Duration.fromSeconds(1))
    async processData(): Promise<void> {
        // This will only execute once at a time
        // Subsequent calls while processing will be ignored
    }
}
```

### Synchronize

The `@synchronize` decorator ensures only one instance of a method runs at a time, with optional delay between executions.

```typescript
import { synchronize, Duration } from "@nivinjoseph/n-util";

class Example {
    @synchronize(Duration.fromSeconds(1))
    async updateResource(): Promise<void> {
        // This will ensure only one update happens at a time
        // Other calls will wait for the current one to complete
    }
}
```

### Throttle

The `@throttle` decorator limits how often a method can be called, ensuring a minimum time between executions.

```typescript
import { throttle, Duration } from "@nivinjoseph/n-util";

class Example {
    @throttle(Duration.fromSeconds(1))
    async handleScroll(): Promise<void> {
        // This will execute at most once per second
        // Additional calls within the second will be ignored
    }
}
```

## API Reference

### Debounce Decorator

```typescript
function debounce<This, Args extends Array<any>, Return extends Promise<void> | void>(
    delay: Duration
): DebounceMethodDecorator<This, Args, Return>;
```

Parameters:
- `delay`: Duration to wait after the last call before executing

### Dedupe Decorator

```typescript
function dedupe<This, Args extends Array<any>, Return extends Promise<void> | void>(
    delay: Duration
): DedupeMethodDecorator<This, Args, Return>;
```

Parameters:
- `delay`: Optional delay between executions

### Synchronize Decorator

```typescript
function synchronize<This, Args extends Array<any>>(
    delay: Duration
): SynchronizeMethodDecorator<This, Args>;
```

Parameters:
- `delay`: Optional delay between executions

### Throttle Decorator

```typescript
function throttle<This, Args extends Array<any>, Return extends Promise<void> | void>(
    delay: Duration
): ThrottleMethodDecorator<This, Args, Return>;
```

Parameters:
- `delay`: Minimum time between executions

## Best Practices

1. **Choose the Right Decorator**
   - Use `@debounce` for handling rapid-fire events (e.g., search input)
   - Use `@dedupe` for preventing duplicate operations
   - Use `@synchronize` for critical sections that must be thread-safe
   - Use `@throttle` for limiting the frequency of expensive operations

2. **Delay Configuration**
   - Set appropriate delay values based on your use case
   - Consider user experience when choosing delay times
   - Test with different delay values to find the optimal balance

3. **Error Handling**
   - Be aware that some calls may be dropped or delayed
   - Implement appropriate error handling for timeouts
   - Consider adding logging for debugging purposes

4. **Performance Considerations**
   - These decorators add overhead to method calls
   - Use them judiciously, especially in performance-critical code
   - Monitor memory usage with long-running applications

## Examples

### Search Input with Debounce

```typescript
class SearchService {
    @debounce(Duration.fromMilliseconds(300))
    async search(query: string): Promise<SearchResults> {
        // This will only execute after 300ms of no typing
        return await this.api.search(query);
    }
}
```

### Resource Update with Synchronize

```typescript
class ResourceManager {
    @synchronize(Duration.fromSeconds(1))
    async updateResource(id: string, data: any): Promise<void> {
        // Only one update can happen at a time
        await this.database.update(id, data);
    }
}
```

### API Call with Throttle

```typescript
class ApiClient {
    @throttle(Duration.fromSeconds(1))
    async fetchData(): Promise<Data> {
        // This will execute at most once per second
        return await this.http.get('/data');
    }
}
```

### Critical Operation with Dedupe

```typescript
class PaymentProcessor {
    @dedupe()
    async processPayment(payment: Payment): Promise<void> {
        // This will ensure the same payment isn't processed twice
        await this.paymentGateway.charge(payment);
    }
}
``` 