# n-util

A comprehensive collection of utility functions and decorators for TypeScript/JavaScript applications. This package provides a robust set of utilities for handling asynchronous operations, type conversions, method decorators, and more.

## Features

### Core Utilities
- [Make](docs/make.md) - Collection of essential utility functions
  - Retry logic with configurable attempts
  - Async/sync operation conversion
  - Error handling utilities
  - Random value generation

### Type System
- [TypeHelper](docs/type-helper.md) - Type conversion and validation
  - Boolean parsing with strict validation
  - Number parsing with type safety
  - Enum type conversion to tuples
  - Type safety assertions
- [Utility Types](docs/utility-types.md) - Common TypeScript utility types
  - Type transformations
  - Conditional types
  - Type guards

### Date and Time
- [DateTime](docs/date-time.md) - Date and time manipulation
  - Date parsing and formatting
  - Time zone handling
  - Date arithmetic
- [Duration](docs/duration.md) - Time duration handling
  - Duration creation and conversion
  - Time unit manipulation
  - Duration arithmetic
- [Time](docs/time.md) - Time-specific utilities
  - Time parsing and formatting
  - Time zone conversions
  - Time comparisons

### Method Decorators
- [Method Decorators](docs/method-decorators.md) - Collection of method decorators
  - @debounce - Prevents rapid-fire method calls
  - @dedupe - Ensures single execution within time window
  - @synchronize - Prevents concurrent execution
  - @throttle - Limits execution frequency

### Concurrency and Synchronization
- [Mutex](docs/mutex.md) - Mutual exclusion locking
  - Resource locking
  - Deadlock prevention
  - Lock timeouts
- [Background Processor](docs/background-processor.md) - Background task processing
  - Queue management
  - Task prioritization
  - Error handling

### Asynchronous Operations
- [Deferred](docs/deferred.md) - Deferred promise pattern
  - Promise creation and control
  - Resolution handling
  - Error propagation
- [Delay](docs/delay.md) - Delay and timeout utilities
  - Timeout creation
  - Delay execution
  - Cancellation support

### Data Handling
- [Serializable](docs/serializable.md) - Class serialization system
  - Property-level control
  - Metadata support
  - Nested object handling
- [DtoFactory](docs/dto-factory.md) - Data Transfer Object creation
  - Automatic DTO generation
  - Property mapping
  - Transform functions

### UI and Content
- [HtmlSanitizer](docs/html-sanitizer.md) - HTML content processing
  - XSS prevention
  - Safe attribute handling
  - Content security
- [Templator](docs/templator.md) - Template processing
  - Template parsing
  - Variable substitution
  - Conditional rendering
- [ImageHelper](docs/image-helper.md) - Image processing utilities
  - Image validation
  - Format conversion
  - Size manipulation

### System and Monitoring
- [Profiler](docs/profiler.md) - Performance profiling
  - Execution timing
  - Memory usage tracking
  - Performance metrics
- [Observer](docs/observer.md) - Observer pattern implementation
  - Event subscription
  - State monitoring
  - Change notification

### Resource Management
- [Disposable](docs/disposable.md) - Resource cleanup
  - Resource disposal
  - Cleanup scheduling
  - Memory management

### Identification and Versioning
- [UUID](docs/uuid.md) - Unique identifier generation
  - UUID v4 generation
  - ID validation
  - ID comparison
- [Version](docs/version.md) - Version number handling
  - Version parsing
  - Version comparison
  - Semantic versioning

## Documentation

Each feature has its own detailed documentation in the [docs](docs) directory. The documentation includes:
- Usage examples
- API reference
- Best practices
- Common patterns

## Installation

```bash
npm install @nivinjoseph/n-util

# or

yarn add @nivinjoseph/n-util
```

## Quick Start

```typescript
import { Duration } from '@nivinjoseph/n-util';

// Create durations in different units
const fiveMinutes = Duration.fromMinutes(5);
const twoHours = Duration.fromHours(2);
const thirtySeconds = Duration.fromSeconds(30);

// Convert between units
console.log(fiveMinutes.toSeconds()); // 300
console.log(twoHours.toMinutes()); // 120
console.log(thirtySeconds.toMilliSeconds()); // 30000

```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
