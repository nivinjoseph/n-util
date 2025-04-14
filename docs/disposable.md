# Disposable

The `Disposable` interface and `DisposableWrapper` class provide a standardized way to handle resource cleanup in TypeScript applications. They implement the Dispose pattern for proper resource management.

## Features

- Standardized resource cleanup
- Async disposal support
- Promise-based implementation
- Reusable wrapper for disposal functions

## Usage

### Using the Disposable Interface
```typescript
import { Disposable } from "n-util";

class Resource implements Disposable {
    private _isDisposed = false;
    
    public async dispose(): Promise<void> {
        if (!this._isDisposed) {
            this._isDisposed = true;
            // Cleanup logic here
        }
    }
}
```

### Using the DisposableWrapper
```typescript
import { DisposableWrapper } from "n-util";

class ResourceManager extends DisposableWrapper {
    private _resource: any;
    
    public constructor() {
        // Call super with the disposal function
        super(async () => {
            await this._cleanupResource();
        });
        
        this._resource = this._initializeResource();
    }
    
    private _initializeResource(): any {
        // Initialize your resource here
        return { /* resource data */ };
    }
    
    private async _cleanupResource(): Promise<void> {
        // Cleanup logic here
        console.log("Cleaning up resource...");
        // Close connections, release handles, etc.
    }
    
    public async useResource(): Promise<void> {
        if (this._isDisposed)
            throw new Error("Resource has been disposed");
            
        // Use the resource
        console.log("Using resource...");
    }
}

// Usage
const manager = new ResourceManager();
try {
    await manager.useResource();
} finally {
    // Clean up when done
    await manager.dispose();
}
```

## API Reference

### Disposable Interface
```typescript
interface Disposable {
    dispose(): Promise<void>;
}
```
Interface that defines the contract for disposable resources.

- Methods:
  - `dispose()`: Asynchronously disposes of the resource

### DisposableWrapper Class
```typescript
class DisposableWrapper implements Disposable
```
A wrapper class that implements the Disposable interface for a given disposal function.

#### Constructor
```typescript
constructor(disposeFunc: () => Promise<void>)
```
Creates a new DisposableWrapper instance.

- Parameters:
  - `disposeFunc`: The async function to call during disposal

#### Methods

##### dispose
```typescript
dispose(): Promise<void>
```
Disposes of the resource by calling the provided disposal function.

- Returns: Promise that resolves when disposal is complete
- Note: The disposal function is only called once, even if dispose is called multiple times

## Examples

### Basic Resource Implementation
```typescript
class DatabaseConnection implements Disposable {
    private _isDisposed = false;
    
    public async dispose(): Promise<void> {
        if (!this._isDisposed) {
            this._isDisposed = true;
            await this.closeConnection();
        }
    }
    
    private async closeConnection(): Promise<void> {
        // Close database connection
    }
}
```

### Using DisposableWrapper
```typescript
// Create a resource that needs cleanup
const resource = createResource();

// Wrap it with a DisposableWrapper
const disposable = new DisposableWrapper(async () => {
    await resource.cleanup();
});

// Use the resource
await resource.use();

// Clean up when done
await disposable.dispose();
```

### Multiple Disposals
```typescript
class CacheManager extends DisposableWrapper {
    private _cache: Map<string, any>;
    
    public constructor() {
        super(async () => {
            console.log("Clearing cache...");
            this._cache.clear();
        });
        
        this._cache = new Map();
    }
    
    // First call executes the disposal function
    public async testDisposal(): Promise<void> {
        await this.dispose(); // Logs: "Clearing cache..."
        
        // Subsequent calls are safe and return the same promise
        await this.dispose(); // No additional logging
    }
}
```

## Notes

- The Disposable interface is the standard contract for resource cleanup
- DisposableWrapper provides a convenient way to implement Disposable for existing cleanup functions
- Disposal is idempotent - calling dispose multiple times is safe
- The wrapper caches the disposal promise for subsequent calls
- Both the interface and wrapper support asynchronous cleanup operations
- The pattern is particularly useful for:
  - Database connections
  - File handles
  - Network connections
  - Memory management
  - Resource pooling
  - Any resource that needs explicit cleanup 