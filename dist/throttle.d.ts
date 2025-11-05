import { Duration } from "./duration.js";
import { DecoratorReplacementMethod, DecoratorTargetMethod, MethodDecoratorContext } from "./decorator-helpers.js";
/**
 * Creates a throttle decorator that limits how often a method can be called.
 * Ensures a minimum time between executions, dropping calls that occur too frequently.
 *
 * @param delay - The minimum time that must pass between executions
 * @returns A method decorator that implements throttling behavior
 * @throws ArgumentException if delay is not a positive Duration
 *
 * @example
 * ```typescript
 * class Example {
 *     @throttle(Duration.fromSeconds(1))
 *     async handleScroll(): Promise<void> {
 *         // This will execute at most once per second
 *         // Additional calls within the second will be ignored
 *         console.log('Scroll event processed');
 *     }
 * }
 * ```
 */
export declare function throttle<This, Args extends Array<any>, Return extends Promise<void> | void>(delay: Duration): ThrottleMethodDecorator<This, Args, Return>;
export declare function throttle<This, Args extends Array<any>, Return extends Promise<void> | void>(target: DecoratorTargetMethod<This, Args, Return>, context: MethodDecoratorContext<This, Args, Return>): DecoratorReplacementMethod<This, Args>;
export type ThrottleMethodDecorator<This, Args extends Array<any>, Return extends Promise<void> | void> = (target: DecoratorTargetMethod<This, Args, Return>, context: MethodDecoratorContext<This, Args, Return>) => DecoratorReplacementMethod<This, Args>;
//# sourceMappingURL=throttle.d.ts.map