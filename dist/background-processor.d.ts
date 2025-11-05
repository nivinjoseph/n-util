import { Disposable } from "./disposable.js";
/**
 * A class that processes actions in the background with configurable intervals and error handling.
 * Implements the Disposable interface for proper resource cleanup.
 *
 * @remarks
 * The processor maintains a queue of actions and processes them asynchronously.
 * It can be configured to process actions continuously or only when work is available.
 */
export declare class BackgroundProcessor implements Disposable {
    private readonly _defaultErrorHandler;
    private readonly _breakIntervalMilliseconds;
    private readonly _breakOnlyWhenNoWork;
    private readonly _actionsToProcess;
    private readonly _actionsExecuting;
    private _isDisposed;
    private _timeout;
    /**
     * Gets the current number of actions waiting to be processed.
     */
    get queueLength(): number;
    /**
     * Creates a new instance of the BackgroundProcessor.
     *
     * @param defaultErrorHandler - Function to handle errors during action execution
     * @param breakIntervalMilliseconds - Time between processing attempts (default: 1000ms)
     * @param breakOnlyWhenNoWork - Whether to break only when no work is available (default: true)
     */
    constructor(defaultErrorHandler: (e: Error) => Promise<void>, breakIntervalMilliseconds?: number, breakOnlyWhenNoWork?: boolean);
    /**
     * Adds an action to the processing queue.
     *
     * @param action - The async function to execute
     * @param errorHandler - Optional custom error handler for this action
     * @throws ObjectDisposedException if the processor has been disposed
     */
    processAction(action: () => Promise<void>, errorHandler?: (e: Error) => Promise<void>): void;
    /**
     * Disposes of the processor and optionally kills the remaining queue.
     *
     * @param killQueue - Whether to kill the remaining queue (default: false)
     * @returns Promise that resolves when disposal is complete
     */
    dispose(killQueue?: boolean): Promise<void>;
    /**
     * Initiates the background processing loop.
     * This method is called automatically by the constructor.
     */
    private _initiateBackgroundProcessing;
}
//# sourceMappingURL=background-processor.d.ts.map