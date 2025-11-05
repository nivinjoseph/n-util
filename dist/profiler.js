import { given } from "@nivinjoseph/n-defensive";
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
export class Profiler {
    _id;
    _traces;
    /** The unique identifier of this profiler instance */
    get id() { return this._id; }
    /** The history of recorded traces */
    get traces() { return this._traces; }
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
    constructor(id) {
        given(id, "id").ensureHasValue().ensureIsString();
        this._id = id;
        this._traces = [{
                dateTime: Date.now(),
                message: "Profiler created",
                diffMs: 0
            }];
    }
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
    trace(message) {
        given(message, "message").ensureHasValue().ensureIsString();
        const now = Date.now();
        this._traces.push({
            dateTime: now,
            message: message.trim(),
            diffMs: now - this._traces[this._traces.length - 1].dateTime
        });
    }
}
//# sourceMappingURL=profiler.js.map