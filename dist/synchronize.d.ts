import { Duration } from "./duration.js";
/**
 * Creates a synchronize decorator that ensures only one instance of a method runs at a time.
 * Uses a mutex to prevent concurrent execution of the decorated method.
 *
 * @param delay - Optional delay between executions after the mutex is released
 * @returns A method decorator that implements synchronization behavior
 * @throws ArgumentException if delay is not a positive Duration
 *
 * @example
 * ```typescript
 * class Example {
 *     @synchronize(Duration.fromSeconds(1))
 *     async updateResource(): Promise<void> {
 *         // This will ensure only one update happens at a time
 *         // Other calls will wait for the current one to complete
 *         await this.database.update(data);
 *     }
 * }
 * ```
 */
export declare function synchronize<This, Args extends Array<any>>(delay: Duration): SynchronizeMethodDecorator<This, Args>;
export declare function synchronize<This, Args extends Array<any>>(target: SynchronizeDecoratorTargetMethod<This, Args>, context: SynchronizeDecoratorContext<This, Args>): SynchronizeDecoratorReplacementMethod<This, Args>;
export type SynchronizeDecoratorTargetMethod<This, Args extends Array<any>> = (this: This, ...args: Args) => any;
export type SynchronizeDecoratorReplacementMethod<This, Args extends Array<any>> = (this: This, ...args: Args) => Promise<any>;
export type SynchronizeDecoratorContext<This, Args extends Array<any>> = ClassMethodDecoratorContext<This, SynchronizeDecoratorTargetMethod<This, Args>>;
export type SynchronizeMethodDecorator<This, Args extends Array<any>> = (value: SynchronizeDecoratorTargetMethod<This, Args>, context: SynchronizeDecoratorContext<This, Args>) => SynchronizeDecoratorReplacementMethod<This, Args>;
//# sourceMappingURL=synchronize.d.ts.map