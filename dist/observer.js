import { given } from "@nivinjoseph/n-defensive";
import { Uuid } from "./uuid.js";
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
export class Observer {
    _event;
    _subMap = new Map();
    /** The name of the event being observed */
    get event() { return this._event; }
    /** Whether there are any active subscriptions */
    get hasSubscriptions() { return this._subMap.size > 0; }
    /**
     * Creates a new observer for a specific event.
     *
     * @param event - The name of the event being observed
     * @throws ArgumentException if event is null, undefined, or empty
     */
    constructor(event) {
        given(event, "event").ensureHasValue().ensureIsString();
        this._event = event.trim();
    }
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
    subscribe(callback) {
        given(callback, "callback").ensureHasValue().ensureIsFunction();
        const key = Uuid.create();
        const subscription = {
            event: this._event,
            isUnsubscribed: false,
            unsubscribe: () => this._cancel(key)
        };
        this._subMap.set(key, {
            subscription,
            callback
        });
        return subscription;
    }
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
    notify(eventData) {
        // no defensive check cuz eventData can be void
        if (!this.hasSubscriptions)
            return;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (process && process.nextTick) {
            for (const entry of this._subMap.values()) {
                // eslint-disable-next-line @typescript-eslint/unbound-method
                process.nextTick(entry.callback, eventData);
            }
        }
        else {
            for (const entry of this._subMap.values()) {
                // eslint-disable-next-line @typescript-eslint/unbound-method
                setTimeout(entry.callback, 0, eventData);
            }
        }
    }
    /**
     * Cancels all active subscriptions to this observer.
     *
     * @example
     * ```typescript
     * // Clean up all subscriptions
     * observer.cancel();
     * ```
     */
    cancel() {
        for (const key of this._subMap.keys())
            this._cancel(key);
    }
    /**
     * Cancels a specific subscription.
     *
     * @param key - The unique identifier of the subscription to cancel
     */
    _cancel(key) {
        const subInfo = this._subMap.get(key);
        if (subInfo == null)
            return;
        // @ts-expect-error: deliberately setting readonly property
        subInfo.subscription.isUnsubscribed = true;
        subInfo.subscription.unsubscribe = () => { };
        this._subMap.delete(key);
    }
}
//# sourceMappingURL=observer.js.map