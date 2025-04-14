# Mutex Documentation

## Overview
The `Mutex` class provides a simple implementation of a mutual exclusion lock for coordinating access to shared resources in asynchronous code. It ensures that only one piece of code can access a protected resource at a time, preventing race conditions in concurrent operations.

## Features
- Simple and lightweight mutex implementation
- Asynchronous lock acquisition
- FIFO (First-In-First-Out) queue for waiting operations
- Promise-based API for easy integration with async/await code

## Usage Examples

### Basic Usage
```typescript
const mutex = new Mutex();

async function protectedOperation() {
    await mutex.lock();
    try {
        // Critical section - only one operation can execute this at a time
        await doSomething();
    } finally {
        mutex.release();
    }
}
```

### Multiple Operations
```typescript
const mutex = new Mutex();

async function operation1() {
    await mutex.lock();
    try {
        await processData();
    } finally {
        mutex.release();
    }
}

async function operation2() {
    await mutex.lock();
    try {
        await updateData();
    } finally {
        mutex.release();
    }
}

// These operations will be executed sequentially
await Promise.all([operation1(), operation2()]);
```

## API Reference

### Mutex Class

#### Constructor
```typescript
constructor()
```
Creates a new mutex instance.

#### Methods

##### lock()
```typescript
lock(): Promise<void>
```
Acquires the mutex lock. Returns a promise that resolves when the lock is acquired.
- If the mutex is available, the promise resolves immediately
- If the mutex is locked, the promise resolves when the lock becomes available
- Multiple calls to lock() will be queued in FIFO order

##### release()
```typescript
release(): void
```
Releases the mutex lock.
- If there are waiting operations, the next one in the queue will acquire the lock
- If no operations are waiting, the mutex becomes available
- Should be called in a finally block to ensure the lock is always released

## Best Practices

1. **Always Use try/finally**
   ```typescript
   await mutex.lock();
   try {
       // Critical section
   } finally {
       mutex.release();
   }
   ```

2. **Keep Critical Sections Short**
   - Minimize the time spent in locked sections
   - Move non-critical operations outside the lock

3. **Avoid Nested Locks**
   - Don't acquire the same mutex multiple times
   - Use separate mutexes for different resources

4. **Error Handling**
   - Ensure locks are released even if errors occur
   - Use try/finally blocks consistently

## Common Patterns

### Resource Protection
```typescript
class ProtectedResource {
    private mutex = new Mutex();
    private data: any;

    async update(value: any) {
        await this.mutex.lock();
        try {
            this.data = value;
        } finally {
            this.mutex.release();
        }
    }

    async read() {
        await this.mutex.lock();
        try {
            return this.data;
        } finally {
            this.mutex.release();
        }
    }
}
```

### Batch Processing
```typescript
class BatchProcessor {
    private mutex = new Mutex();
    private queue: Array<any> = [];

    async add(item: any) {
        await this.mutex.lock();
        try {
            this.queue.push(item);
        } finally {
            this.mutex.release();
        }
    }

    async process() {
        await this.mutex.lock();
        try {
            const items = [...this.queue];
            this.queue = [];
            // Process items
        } finally {
            this.mutex.release();
        }
    }
}
```

## Notes
- The mutex implementation uses a queue to ensure fairness
- Operations are processed in the order they request the lock
- The mutex is not reentrant (a single operation cannot acquire the lock multiple times)
- Always release the lock in a finally block to prevent deadlocks 