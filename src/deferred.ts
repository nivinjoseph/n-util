/**
 * @description A class used to defer a promise.
 */
export class Deferred<T>
{
    private readonly _promise: Promise<T>;
    private _resolve: (value?: T) => void;
    private _reject: (reason?: any) => void;


    public get promise(): Promise<T> { return this._promise; }


    public constructor()
    {
        this._promise = new Promise<T>((resolve, reject) =>
        {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    /**
     * @description Adds a resolve value, `value` to the deferred promise. Use 
     * the getter `promise()` to retrieve the promise.
     * 
     * @param value - The value to resolve.
     */
    public resolve(value?: T): void
    {
        this._resolve(value);
    }

    /**
     * @description Adds a reject reason, `reason` to the deferred promise. Use 
     * the getter `promise()` to retrieve the promise.
     * 
     * @param value - The value to resolve.
     */
    public reject(reason?: any): void
    {
        this._reject(reason);
    }
}