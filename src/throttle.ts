import { given } from "@nivinjoseph/n-defensive";
import { Duration } from "./duration.js";
import { Delay } from "./delay.js";
import { ApplicationException } from "@nivinjoseph/n-exception";
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
export function throttle<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void>(
        delay: Duration
    ): ThrottleMethodDecorator<This, Args, Return>;
export function throttle<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void
>(
    target: DecoratorTargetMethod<This, Args, Return>,
    context: MethodDecoratorContext<This, Args, Return>
): DecoratorReplacementMethod<This, Args>;
export function throttle<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void>(
        delayOrTarget: Duration | DecoratorTargetMethod<This, Args, Return>,
        context?: MethodDecoratorContext<This, Args, Return>
    ): ThrottleMethodDecorator<This, Args, Return> | DecoratorReplacementMethod<This, Args>
{
    if (delayOrTarget instanceof Duration)
    {
        const delay = delayOrTarget;
        given(delay, "delay").ensureIsObject().ensureIsInstanceOf(Duration)
            .ensure(t => t.toMilliSeconds() > 0, "delay should be greater than 0ms");

        const decorator: ThrottleMethodDecorator<This, Args, Return> = function (target, context)
        {
            return createReplacementMethod(target, context, delay);
        };

        return decorator;
    }

    const target = delayOrTarget;
    if (context == null)
        throw new ApplicationException("Context should not be null or undefined");

    return createReplacementMethod(target, context, null);
}


function createReplacementMethod<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void
>(
    target: DecoratorTargetMethod<This, Args, Return>,
    context: MethodDecoratorContext<This, Args, Return>,
    delay: Duration | null
): DecoratorReplacementMethod<This, Args>
{
    const { name, kind } = context;
    given(kind, "kind").ensureHasValue().ensureIsString().ensure(t => t === "method", "throttle decorator can only be used on a method");

    const activeKey = Symbol.for(`@nivinjoseph/n-util/throttle/${String(name)}/isActive`);
    const scheduledCallKey = Symbol.for(`@nivinjoseph/n-util/throttle/${String(name)}/scheduledCall`);

    context.addInitializer(function (this)
    {
        (<any>this)[activeKey] = false;
        (<any>this)[scheduledCallKey] = null;
    });

    return async function (this: This, ...args: Args): Promise<void>
    {
        (<any>this)[scheduledCallKey] = async (): Promise<void> =>
        {
            await target.call(this, ...args);
        };

        if ((<any>this)[activeKey])
            return;

        while ((<any>this)[scheduledCallKey] != null && !(<any>this)[activeKey])
        {
            (<any>this)[activeKey] = true;
            const currentCall: () => Promise<void> = (<any>this)[scheduledCallKey];
            (<any>this)[scheduledCallKey] = null;
            try
            {
                await currentCall();
            }
            finally
            {
                if (delay != null)
                    await Delay.milliseconds(delay.toMilliSeconds());

                (<any>this)[activeKey] = false;
            }
        }
    };
}




export type ThrottleMethodDecorator<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void
> = (
    target: DecoratorTargetMethod<This, Args, Return>,
    context: MethodDecoratorContext<This, Args, Return>
) => DecoratorReplacementMethod<This, Args>;