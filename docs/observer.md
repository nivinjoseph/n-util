# Observer Documentation

## Overview
The Observer pattern implementation provides a way to create event-based communication between objects. It allows objects (observers) to subscribe to events and be notified when those events occur, enabling loose coupling between components.

## Features
- Event-based communication
- Type-safe event data
- Asynchronous event notification
- Automatic cleanup of subscriptions
- Unique subscription tracking
- Platform-agnostic (works in both Node.js and browser environments)

## Usage Examples

### Basic Usage
```typescript
// Create an observer for a specific event type
const observer = new Observer<number>("valueChanged");

// Subscribe to the event
const subscription = observer.subscribe((value) => {
    console.log(`Value changed to: ${value}`);
});

// Notify subscribers
observer.notify(42);

// Unsubscribe when done
subscription.unsubscribe();
```

### Multiple Subscribers
```typescript
const observer = new Observer<string>("messageReceived");

// First subscriber
const sub1 = observer.subscribe((msg) => {
    console.log(`Subscriber 1 received: ${msg}`);
});

// Second subscriber
const sub2 = observer.subscribe((msg) => {
    console.log(`Subscriber 2 received: ${msg}`);
});

// Notify all subscribers
observer.notify("Hello World!");

// Clean up
sub1.unsubscribe();
sub2.unsubscribe();
```

## API Reference

### Interfaces

#### Observable<T>
```typescript
interface Observable<T> {
    subscribe(callback: (eventData: T) => void): Subscription;
}
```
Interface for objects that can be observed. Generic type `T` represents the event data type.

#### Subscription
```typescript
interface Subscription {
    readonly event: string;
    readonly isUnsubscribed: boolean;
    unsubscribe(): void;
}
```
Represents a subscription to an observable event.

### Observer Class

#### Constructor
```typescript
constructor(event: string)
```
Creates a new observer for a specific event.
- `event`: The name of the event being observed

#### Properties
- `event`: string - The name of the event
- `hasSubscriptions`: boolean - Indicates if there are active subscriptions

#### Methods

##### subscribe()
```typescript
subscribe(callback: (eventData: T) => void): Subscription
```
Subscribes to the observer's events.
- `callback`: Function to be called when the event occurs
- Returns: A subscription object that can be used to unsubscribe

##### notify()
```typescript
notify(eventData: T): void
```
Notifies all subscribers about an event.
- `eventData`: The data to be passed to subscribers

##### cancel()
```typescript
cancel(): void
```
Cancels all active subscriptions.

## Best Practices

1. **Proper Cleanup**
   ```typescript
   const subscription = observer.subscribe(callback);
   // Always unsubscribe when done
   subscription.unsubscribe();
   ```

2. **Type Safety**
   ```typescript
   // Use specific types for event data
   const observer = new Observer<{ id: string, value: number }>("dataChanged");
   ```

3. **Error Handling**
   ```typescript
   observer.subscribe((data) => {
       try {
           processData(data);
       } catch (error) {
           handleError(error);
       }
   });
   ```

4. **Memory Management**
   - Always unsubscribe when components are destroyed
   - Use the `cancel()` method to clean up all subscriptions
   - Check `isUnsubscribed` before performing operations

## Common Patterns

### Event Bus
```typescript
class EventBus {
    private static _observers = new Map<string, Observer<any>>();

    static subscribe<T>(event: string, callback: (data: T) => void): Subscription {
        let observer = this._observers.get(event);
        if (!observer) {
            observer = new Observer<T>(event);
            this._observers.set(event, observer);
        }
        return observer.subscribe(callback);
    }

    static notify<T>(event: string, data: T): void {
        const observer = this._observers.get(event);
        observer?.notify(data);
    }
}
```

### Component Communication
```typescript
class Component {
    private valueObserver = new Observer<number>("valueChanged");

    updateValue(newValue: number) {
        this.valueObserver.notify(newValue);
    }

    onValueChanged(callback: (value: number) => void): Subscription {
        return this.valueObserver.subscribe(callback);
    }
}
```

## Notes
- Events are delivered asynchronously using `process.nextTick` in Node.js or `setTimeout` in browsers
- Subscriptions are tracked using unique UUIDs
- The observer maintains a map of active subscriptions
- Unsubscribed callbacks are automatically cleaned up
- The pattern is particularly useful for implementing the Publish-Subscribe pattern 