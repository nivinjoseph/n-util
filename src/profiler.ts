import { given } from "@nivinjoseph/n-defensive";

// public
/**
 * @description A class used to profile and trace code execution.
 */
export class Profiler
{
    private readonly _id: string;
    private readonly _traces: Array<ProfilerTrace>;
    
    
    public get id(): string { return this._id; }
    public get traces(): ReadonlyArray<ProfilerTrace> { return this._traces; }
    
    
    public constructor(id: string)
    {
        given(id, "id").ensureHasValue().ensureIsString();
        
        this._id = id;
        this._traces = [{
            dateTime: Date.now(),
            message: "Profiler created",
            diffMs: 0
        }];
    }
    
    /**
     * 
     * Creates a trace point for a profiler.
     * 
     * @param message - A message for the trace point's context.
     */
    public trace(message: string): void
    {
        given(message, "message").ensureHasValue().ensureIsString();
        
        const now = Date.now();
        
        this._traces.push({
            dateTime: now,
            message: message.trim(),
            diffMs: now - this._traces[this._traces.length - 1].dateTime
        });
    }
}

// public
export interface ProfilerTrace
{
    readonly dateTime: number;
    readonly message: string;
    readonly diffMs: number;
}