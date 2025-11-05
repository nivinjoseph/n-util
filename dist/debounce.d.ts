import { Duration } from "./duration.js";
import { DecoratorReplacementMethod, DecoratorTargetMethod, MethodDecoratorContext } from "./decorator-helpers.js";
/**
 * Creates a debounce decorator that ensures a method is only called after a specified delay
 * has passed since the last call. Useful for handling rapid-fire events like search input.
 *
 * @param delay - The duration to wait after the last call before executing
 * @returns A method decorator that implements debounce behavior
 * @throws ArgumentException if delay is not a positive Duration
 *
 * @example
 * ```typescript
 * class Example {
 *     @debounce(Duration.fromSeconds(1))
 *     async handleInput(value: string): Promise<void> {
 *         // This will only execute after 1 second of no calls
 *         console.log(`Processing: ${value}`);
 *     }
 * }
 * ```
 */
export declare function debounce<This, Args extends Array<any>, Return extends Promise<void> | void>(delay: Duration): DebounceMethodDecorator<This, Args, Return>;
export declare function debounce<This, Args extends Array<any>, Return extends Promise<void> | void>(target: DecoratorTargetMethod<This, Args, Return>, context: MethodDecoratorContext<This, Args, Return>): DecoratorReplacementMethod<This, Args>;
export type DebounceMethodDecorator<This, Args extends Array<any>, Return extends Promise<void> | void> = (target: DecoratorTargetMethod<This, Args, Return>, context: MethodDecoratorContext<This, Args, Return>) => DecoratorReplacementMethod<This, Args>;
//# sourceMappingURL=debounce.d.ts.map