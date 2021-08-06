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
     * 
     * Creates a resolve given a `value` for the deferred promise.
     * 
     * @param value - The value to resolve.
     */
    public resolve(value?: T): void
    {
        this._resolve(value);
    }

    /**
     * 
     * Creates a reject given a `value` for the deferred promise.
     * 
     * @param reason - The value to reject.
     */
    public reject(reason?: any): void
    {
        this._reject(reason);
    }
}