import { given } from "@nivinjoseph/n-defensive";
import { Duration } from "./duration.js";
import { Delay } from "./delay.js";
import { ApplicationException } from "@nivinjoseph/n-exception";
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
export function debounce<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void>(
        delay: Duration
    ): DebounceMethodDecorator<This, Args, Return>;
export function debounce<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void
>(
    target: DecoratorTargetMethod<This, Args, Return>,
    context: MethodDecoratorContext<This, Args, Return>
): DecoratorReplacementMethod<This, Args>;
export function debounce<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void>(
        delayOrTarget: Duration | DecoratorTargetMethod<This, Args, Return>,
        context?: MethodDecoratorContext<This, Args, Return>
    ): DebounceMethodDecorator<This, Args, Return> | DecoratorReplacementMethod<This, Args>
{
    if (delayOrTarget instanceof Duration)
    {
        const delay = delayOrTarget;
        given(delay, "delay").ensureIsObject().ensureIsInstanceOf(Duration)
            .ensure(t => t.toMilliSeconds() > 0, "delay should be greater than 0ms");

        const decorator: DebounceMethodDecorator<This, Args, Return> = function (target, context)
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
    given(kind, "kind").ensureHasValue().ensureIsString().ensure(t => t === "method", "debounce decorator can only be used on a method");

    const activeKey = Symbol.for(`@nivinjoseph/n-util/debounce/${String(name)}/isActive`);
    const scheduledCallKey = Symbol.for(`@nivinjoseph/n-util/debounce/${String(name)}/scheduledCall`);

    return async function (this: This, ...args: Args)
    {
        (this as any)[scheduledCallKey] = async (): Promise<void> =>
        {
            await target.call(this, ...args);
        };

        if ((this as any)[activeKey])
            return;

        while ((this as any)[scheduledCallKey] != null && !(this as any)[activeKey])
        {
            (this as any)[activeKey] = true;
            if (delay != null)
                await Delay.milliseconds(delay.toMilliSeconds());

            const currentCall: () => Promise<void> = (this as any)[scheduledCallKey];
            (this as any)[scheduledCallKey] = null;
            try
            {
                await currentCall();
            }
            finally
            {
                (this as any)[activeKey] = false;
            }
        }
    };
}



export type DebounceMethodDecorator<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void
> = (
    target: DecoratorTargetMethod<This, Args, Return>,
    context: MethodDecoratorContext<This, Args, Return>
) => DecoratorReplacementMethod<This, Args>;