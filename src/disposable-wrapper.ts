import { given } from "@nivinjoseph/n-defensive";
import { Disposable } from "./disposable.js";


/**
 * A wrapper class that implements the Disposable interface for a given disposal function.
 * 
 * @remarks
 * This class provides a convenient way to implement the Disposable interface
 * for existing cleanup functions. It ensures that the disposal function is
 * only called once, even if dispose is called multiple times.
 */
export class DisposableWrapper implements Disposable
{
    private readonly _disposeFunc: () => Promise<void>;
    private _isDisposed = false;
    private _disposePromise: Promise<void> | null = null;


    /**
     * Creates a new DisposableWrapper instance.
     * 
     * @param disposeFunc - The async function to call during disposal
     * @throws Error if disposeFunc is null or undefined
     */
    public constructor(disposeFunc: () => Promise<void>)
    {
        given(disposeFunc, "disposeFunc").ensureHasValue().ensureIsFunction();
        this._disposeFunc = disposeFunc;
    }


    /**
     * Disposes of the resource by calling the provided disposal function.
     * 
     * @returns Promise that resolves when disposal is complete
     * @remarks
     * The disposal function is only called once, even if this method
     * is called multiple times. Subsequent calls return the same promise.
     */
    public dispose(): Promise<void>
    {
        if (!this._isDisposed)
        {
            this._isDisposed = true;
            this._disposePromise = this._disposeFunc();
        }

        return this._disposePromise!;
    }
}