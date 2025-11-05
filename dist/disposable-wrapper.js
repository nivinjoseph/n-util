import { given } from "@nivinjoseph/n-defensive";
/**
 * A wrapper class that implements the Disposable interface for a given disposal function.
 *
 * @remarks
 * This class provides a convenient way to implement the Disposable interface
 * for existing cleanup functions. It ensures that the disposal function is
 * only called once, even if dispose is called multiple times.
 */
export class DisposableWrapper {
    _disposeFunc;
    _isDisposed = false;
    _disposePromise = null;
    /**
     * Creates a new DisposableWrapper instance.
     *
     * @param disposeFunc - The async function to call during disposal
     * @throws Error if disposeFunc is null or undefined
     */
    constructor(disposeFunc) {
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
    dispose() {
        if (!this._isDisposed) {
            this._isDisposed = true;
            this._disposePromise = this._disposeFunc();
        }
        return this._disposePromise;
    }
}
//# sourceMappingURL=disposable-wrapper.js.map