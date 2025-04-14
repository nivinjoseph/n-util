import { given } from "@nivinjoseph/n-defensive";
import { Duration } from "./duration.js";
import { Delay } from "./delay.js";
import { ApplicationException } from "@nivinjoseph/n-exception";
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
export function dedupe<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void
>(
    delay: Duration
): DedupeMethodDecorator<This, Args, Return>;
export function dedupe<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void
>(
    target: DecoratorTargetMethod<This, Args, Return>,
    context: MethodDecoratorContext<This, Args, Return>
): DecoratorReplacementMethod<This, Args>;
export function dedupe<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void
>(
    delayOrTarget: Duration | DecoratorTargetMethod<This, Args, Return>,
    context?: MethodDecoratorContext<This, Args, Return>
): DedupeMethodDecorator<This, Args, Return> | DecoratorReplacementMethod<This, Args>
{
    if (delayOrTarget instanceof Duration)
    {
        const delay = delayOrTarget;
        given(delay, "delay").ensureIsObject().ensureIsInstanceOf(Duration)
            .ensure(t => t.toMilliSeconds() > 0, "delay should be greater than 0ms");

        const decorator: DedupeMethodDecorator<This, Args, Return> = function (target, context)
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
    given(kind, "kind").ensureHasValue().ensureIsString().ensure(t => t === "method", "dedupe decorator can only be used on a method");

    const activeKey = Symbol.for(`@nivinjoseph/n-util/dedupe/${String(name)}/isActive`);
    // setting value to false on initialization.
    context.addInitializer(function (this)
    {
        (<any>this)[activeKey] = false;
    });

    return async function (this: This, ...args: Args): Promise<void>
    {
        if ((<any>this)[activeKey])
            return;

        (<any>this)[activeKey] = true;

        try
        {
            await target.call(this, ...args);
        }
        finally
        {
            if (delay != null)
                await Delay.milliseconds(delay.toMilliSeconds());

            (<any>this)[activeKey] = false;
        }
    };
}



export type DedupeMethodDecorator<
    This,
    Args extends Array<any>,
    Return extends Promise<void> | void
> = (
    target: DecoratorTargetMethod<This, Args, Return>,
    context: MethodDecoratorContext<This, Args, Return>
) => DecoratorReplacementMethod<This, Args>;