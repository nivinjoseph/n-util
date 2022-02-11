import { Deferred } from "./deferred";

/**
 * @description A class used to create Mutual Exclusion Lock and prevent race condition from occurring.
 */
export class Mutex
{
    private readonly _deferreds: Array<Deferred<void>>;
    private _currentDeferred: Deferred<void> | null;


    public constructor()
    {
        this._deferreds = new Array<Deferred<void>>();
        this._currentDeferred = null;
    }

    /**
     * @description Locks a mutex lock. This needs to be unlocked with the `release` method.
     */
    public lock(): Promise<void>
    {
        const deferred = new Deferred<void>();
        this._deferreds.push(deferred);
        if (this._deferreds.length === 1)
        {
            this._currentDeferred = deferred;
            this._currentDeferred.resolve();
        }

        return deferred.promise;
    }

    /**
     * @description Releases a mutex lock. This is invoked consecutively after the `lock` method.
     */
    public release(): void
    {
        if (this._currentDeferred == null)
            return;
        
        this._deferreds.remove(this._currentDeferred);
        this._currentDeferred = this._deferreds[0] || null;
        if (this._currentDeferred != null)
            this._currentDeferred.resolve();
    }
}