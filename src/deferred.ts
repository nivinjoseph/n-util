/**
 * A class that provides external control over a Promise.
 * Allows resolving or rejecting a Promise from outside its constructor.
 * 
 * @remarks
 * This is particularly useful when you need to control a Promise's
 * resolution or rejection from a different scope than where it was created.
 * 
 * @typeParam T - The type of the value that the Promise will resolve with
 */
export class Deferred<T>
{
    private readonly _promise: Promise<T>;
    private _resolve!: (value: T) => void;
    private _reject!: (reason?: any) => void;


    /**
     * Gets the underlying Promise that can be awaited.
     */
    public get promise(): Promise<T> { return this._promise; }


    /**
     * Creates a new Deferred instance.
     * The underlying Promise is created immediately.
     */
    public constructor()
    {
        this._promise = new Promise<T>((resolve, reject) =>
        {
            this._resolve = resolve;
            this._reject = reject;
        });
    }


    /**
     * Resolves the underlying Promise with the given value.
     * 
     * @param value - The value to resolve the Promise with
     */
    public resolve(value: T): void
    {
        this._resolve(value);
    }


    /**
     * Rejects the underlying Promise with the given reason.
     * 
     * @param reason - The reason for rejection (optional)
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public reject(reason?: any): void
    {
        this._reject(reason);
    }
}