import { given } from "@nivinjoseph/n-defensive";

// public
/**
 * @description Creates a Promise that gets resolved after a delay of the given duration.
 */
export abstract class Delay // static class
{
    /**
     * @description Creates a Promise that resolves in given hour, `value`.
     * 
     * @param value - The value in hours to delay by.
     */
    public static async hours(value: number): Promise<void>
    {
        given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
        await Delay.minutes(value * 60);
    }
    
    /**
     * @description Creates a Promise that resolves in given minute, `value`.
     * 
     * @param value - The value in minutes to delay by.
     */
    public static async minutes(value: number): Promise<void>
    {
        given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
        await Delay.seconds(value * 60);
    }
    
    /**
     * @description Creates a Promise that resolves in given second, `value`.
     * 
     * @param value - The value in seconds to delay by.
     */
    public static async seconds(value: number): Promise<void>
    {
        given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
        await Delay.milliseconds(value * 1000);
    }
    
    /**
     * @description Creates a Promise that resolves in given millisecond, `value`.
     * 
     * @param value - The value in milliseconds to delay by.
     */
    public static milliseconds(value: number): Promise<void>
    {
        return new Promise<void>((resolve, reject) =>
        {
            try 
            {
                given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
                setTimeout(() => resolve(), value);
            }
            catch (error)
            {
                reject(error);
            }
        });
    }
}