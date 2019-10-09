export declare class Profiler {
    private readonly _id;
    private readonly _traces;
    readonly id: string;
    readonly traces: ReadonlyArray<ProfilerTrace>;
    constructor();
    trace(message: string): void;
}
export interface ProfilerTrace {
    readonly dateTime: number;
    readonly message: string;
    readonly diffMs: number;
}