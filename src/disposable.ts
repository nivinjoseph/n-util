/**
 * Interface that defines the contract for disposable resources.
 * 
 * @remarks
 * This interface is used to standardize resource cleanup across the application.
 * Classes implementing this interface should ensure proper cleanup of resources
 * when the dispose method is called.
 */
export interface Disposable
{
    /**
     * Asynchronously disposes of the resource.
     * 
     * @returns Promise that resolves when disposal is complete
     */
    dispose(): Promise<void>;
}