import { Duration } from "./duration.js";
import { DecoratorReplacementMethod, DecoratorTargetMethod, MethodDecoratorContext } from "./decorator-helpers.js";
/**
 * Creates a dedupe decorator that ensures a method is only called once within a specified time window.
 * Subsequent calls within the window are ignored. Useful for preventing duplicate operations.
 *
 * @param window - The time window during which duplicate calls are ignored
 * @returns A method decorator that implements dedupe behavior
 * @throws ArgumentException if window is not a positive Duration
 *
 * @example
 * ```typescript
 * class Example {
 *     @dedupe(Duration.fromSeconds(5))
 *     async processData(data: string): Promise<void> {
 *         // This will only execute once every 5 seconds
 *         console.log(`Processing: ${data}`);
 *     }
 * }
 * ```
 */
export declare function dedupe<This, Args extends Array<any>, Return extends Promise<void> | void>(delay: Duration): DedupeMethodDecorator<This, Args, Return>;
export declare function dedupe<This, Args extends Array<any>, Return extends Promise<void> | void>(target: DecoratorTargetMethod<This, Args, Return>, context: MethodDecoratorContext<This, Args, Return>): DecoratorReplacementMethod<This, Args>;
export type DedupeMethodDecorator<This, Args extends Array<any>, Return extends Promise<void> | void> = (target: DecoratorTargetMethod<This, Args, Return>, context: MethodDecoratorContext<This, Args, Return>) => DecoratorReplacementMethod<This, Args>;
//# sourceMappingURL=dedupe.d.ts.map