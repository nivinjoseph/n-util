/**
 * Interface for objects that can be observed. Allows subscribers to receive notifications
 * when events occur.
 *
 * @template T - The type of data that will be passed to subscribers
 *
 * @example
 * ```typescript
 * const observable: Observable<number> = new Observer("valueChanged");
 * const subscription = observable.subscribe(value => console.log(value));
 * ```
 */
export interface Observable<T> {
    /**
     * Subscribes to events from this observable.
     *
     * @param callback - Function to be called when an event occurs
     * @returns A subscription object that can be used to unsubscribe
     */
    subscribe(callback: (eventData: T) => void): Subscription;
}
/**
 * Represents a subscription to an observable event. Provides methods to manage
 * the subscription and check its status.
 *
 * @example
 * ```typescript
 * const subscription = observer.subscribe(callback);
 * // Later...
 * subscription.unsubscribe();
 * ```
 */
export interface Subscription {
    /** The name of the event being observed */
    readonly event: string;
    /** Whether the subscription has been cancelled */
    readonly isUnsubscribed: boolean;
    /** Cancels the subscription */
    unsubscribe(): void;
}
/**
 * Implementation of the Observer pattern that allows objects to subscribe to events
 * and receive notifications when those events occur. Supports type-safe event data
 * and asynchronous event delivery.
 *
 * @template T - The type of data that will be passed to subscribers
 *
 * @example
 * ```typescript
 * const observer = new Observer<number>("valueChanged");
 *
 * // Subscribe to events
 * const subscription = observer.subscribe(value => {
 *     console.log(`Value changed to: ${value}`);
 * });
 *
 * // Notify subscribers
 * observer.notify(42);
 *
 * // Clean up
 * subscription.unsubscribe();
 * ```
 */
export declare class Observer<T> implements Observable<T> {
    private readonly _event;
    private readonly _subMap;
    /** The name of the event being observed */
    get event(): string;
    /** Whether there are any active subscriptions */
    get hasSubscriptions(): boolean;
    /**
     * Creates a new observer for a specific event.
     *
     * @param event - The name of the event being observed
     * @throws ArgumentException if event is null, undefined, or empty
     */
    constructor(event: string);
    /**
     * Subscribes to events from this observer.
     *
     * @param callback - Function to be called when an event occurs
     * @returns A subscription object that can be used to unsubscribe
     * @throws ArgumentException if callback is null or undefined
     *
     * @example
     * ```typescript
     * const subscription = observer.subscribe(data => {
     *     console.log(`Received: ${data}`);
     * });
     * ```
     */
    subscribe(callback: (eventData: T) => void): Subscription;
    /**
     * Notifies all subscribers about an event. The notification is delivered
     * asynchronously using process.nextTick in Node.js or setTimeout in browsers.
     *
     * @param eventData - The data to be passed to subscribers
     *
     * @example
     * ```typescript
     * observer.notify({ id: "123", value: 42 });
     * ```
     */
    notify(eventData: T): void;
    /**
     * Cancels all active subscriptions to this observer.
     *
     * @example
     * ```typescript
     * // Clean up all subscriptions
     * observer.cancel();
     * ```
     */
    cancel(): void;
    /**
     * Cancels a specific subscription.
     *
     * @param key - The unique identifier of the subscription to cancel
     */
    private _cancel;
}
//# sourceMappingURL=observer.d.ts.map