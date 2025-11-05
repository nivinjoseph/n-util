/**
 * A utility class for tracking and measuring execution time of operations.
 * Creates a timeline of events with timestamps and calculates time differences
 * between consecutive operations.
 *
 * @example
 * ```typescript
 * const profiler = new Profiler("dataProcessing");
 *
 * profiler.trace("Starting operation");
 * await doSomething();
 * profiler.trace("Operation completed");
 *
 * // Access timing information
 * console.log(profiler.traces);
 * ```
 */
export declare class Profiler {
    private readonly _id;
    private readonly _traces;
    /** The unique identifier of this profiler instance */
    get id(): string;
    /** The history of recorded traces */
    get traces(): ReadonlyArray<ProfilerTrace>;
    /**
     * Creates a new profiler instance with the specified identifier.
     * Automatically creates an initial trace with the creation message.
     *
     * @param id - Unique identifier for the profiler
     * @throws ArgumentException if id is null, undefined, or empty
     *
     * @example
     * ```typescript
     * const profiler = new Profiler("apiCall");
     * ```
     */
    constructor(id: string);
    /**
     * Records a new trace with the current timestamp and calculates
     * the time difference from the previous trace.
     *
     * @param message - Description of the operation being traced
     * @throws ArgumentException if message is null, undefined, or empty
     *
     * @example
     * ```typescript
     * profiler.trace("Starting data processing");
     * await processData();
     * profiler.trace("Data processing completed");
     * ```
     */
    trace(message: string): void;
}
/**
 * Interface representing a single trace in the profiler's history.
 * Each trace contains a timestamp, message, and time difference from the previous trace.
 */
export interface ProfilerTrace {
    /** Unix timestamp in milliseconds when the trace was recorded */
    readonly dateTime: number;
    /** Description of the operation being traced */
    readonly message: string;
    /** Time difference in milliseconds from the previous trace */
    readonly diffMs: number;
}
//# sourceMappingURL=profiler.d.ts.map