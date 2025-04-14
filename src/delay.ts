import { given } from "@nivinjoseph/n-defensive";


/**
 * A utility class for creating time-based delays in asynchronous code.
 * Provides methods for creating delays in different time units with optional cancellation.
 * 
 * @remarks
 * All methods are static and return Promises that can be awaited.
 * The class supports delays in hours, minutes, seconds, and milliseconds.
 */
export abstract class Delay // static class
{
    /**
     * Creates a delay for the specified number of hours.
     * 
     * @param value - Number of hours to delay (must be >= 0)
     * @param canceller - Optional cancellation object
     * @returns Promise that resolves after the delay
     * @throws Error if value is negative
     */
    public static async hours(value: number, canceller?: DelayCanceller): Promise<void>
    {
        given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
        await Delay.minutes(value * 60, canceller);
    }

    /**
     * Creates a delay for the specified number of minutes.
     * 
     * @param value - Number of minutes to delay (must be >= 0)
     * @param canceller - Optional cancellation object
     * @returns Promise that resolves after the delay
     * @throws Error if value is negative
     */
    public static async minutes(value: number, canceller?: DelayCanceller): Promise<void>
    {
        given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
        await Delay.seconds(value * 60, canceller);
    }

    /**
     * Creates a delay for the specified number of seconds.
     * 
     * @param value - Number of seconds to delay (must be >= 0)
     * @param canceller - Optional cancellation object
     * @returns Promise that resolves after the delay
     * @throws Error if value is negative
     */
    public static async seconds(value: number, canceller?: DelayCanceller): Promise<void>
    {
        given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
        await Delay.milliseconds(value * 1000, canceller);
    }

    /**
     * Creates a delay for the specified number of milliseconds.
     * 
     * @param value - Number of milliseconds to delay (must be >= 0)
     * @param canceller - Optional cancellation object
     * @returns Promise that resolves after the delay
     * @throws Error if value is negative
     */
    public static milliseconds(value: number, canceller?: DelayCanceller): Promise<void>
    {
        return new Promise<void>((resolve, reject) =>
        {
            try 
            {
                given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
                given(canceller, "canceller").ensureIsObject();
                const timer = setTimeout(() => resolve(), value);
                if (canceller)
                    canceller.cancel = (): void =>
                    {
                        clearTimeout(timer);
                        resolve();
                    };
            }
            catch (error)
            {
                reject(error);
            }
        });
    }
}


/**
 * Type for the cancellation object that can be used to cancel a delay.
 * 
 * @remarks
 * The cancel method is optional and can be called to cancel an ongoing delay.
 */
export type DelayCanceller = { cancel?(): void; };