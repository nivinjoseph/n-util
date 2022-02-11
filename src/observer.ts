import { given } from "@nivinjoseph/n-defensive";
import { Uuid } from "./uuid";


export interface Observable<T>
{
    /**
     * @description Creates a subscription to the event that executes callback when it is notified.
     * 
     * @param callback - The callback to execute after it is notified .
     * @returns A subscription to the event.
     */
    subscribe(callback: (eventData: T) => void): Subscription;
}


export interface Subscription
{
    /**
     * @description The name of the event.
     */
    readonly event: string;
    /**
     * @description The boolean indicating if the 
     */
    readonly isUnsubscribed: boolean;
    /**
     * @description Unsubscribes from the subscription
     */
    unsubscribe(): void;
}

/**
 * @description A class used to create event subscriptions using the Observer Pattern.
 */
export class Observer<T> implements Observable<T>
{
    private readonly _event: string;
    private readonly _subMap = new Map<string, SubInfo<T>>();


    public get event(): string { return this._event; }
    public get hasSubscriptions(): boolean { return this._subMap.size > 0; }

    /**
     * @description Creates the observer with the event name, `event`.
     * 
     * @param event The name of the event.
     */
    public constructor(event: string)
    {
        given(event, "event").ensureHasValue().ensureIsString();
        this._event = event.trim();
    }

    public subscribe(callback: (eventData: T) => void): Subscription
    {
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
     * @description Notify the subscriptions that an event has been executed and invokes the subscription's callback
     * with `eventData`.
     * 
     * @param eventData - The data given to the subscription callback.
     */
    public notify(eventData: T): void
    {
        // no defensive check cuz eventData can be void

        if (!this.hasSubscriptions)
            return;
        
        if (process && process.nextTick)
        {
            for (const entry of this._subMap.values())
            {
                process.nextTick(entry.callback, eventData);
            }
        }
        else
        {
            for (const entry of this._subMap.values())
            {
                setTimeout(entry.callback, 0, eventData);
            }
        }
    }
    
    public cancel(): void
    {
        for (const key of this._subMap.keys())
            this._cancel(key);
    }

    private _cancel(key: string): void
    {
        const subInfo = this._subMap.get(key);
        if (subInfo == null)
            return;
        
        (<any>subInfo.subscription).isUnsubscribed = true;
        (<any>subInfo.subscription).unsubscribe = () => {};
        this._subMap.delete(key);
    }
}

interface SubInfo<T>
{
    subscription: Subscription;
    callback: (eventData: T) => void;
}