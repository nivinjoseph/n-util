import { given } from "@nivinjoseph/n-defensive";

// public
export abstract class Delay // static class
{
    /**
     * 
     * Asynchronously delays for an hour value.
     * 
     * @param value - The value in hours to delay by.
     */
    public static async hours(value: number): Promise<void>
    {
        given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
        await Delay.minutes(value * 60);
    }
    
    /**
     * 
     * Asynchronously delays for a minute value.
     * 
     * @param value - The value in minute to delay by.
     */
    public static async minutes(value: number): Promise<void>
    {
        given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
        await Delay.seconds(value * 60);
    }
    
    /**
     * 
     * Asynchronously delays for a second value.
     * 
     * @param value - The value in second to delay by.
     */
    public static async seconds(value: number): Promise<void>
    {
        given(value, "value").ensureHasValue().ensureIsNumber().ensure(t => t >= 0, "value has to be 0 or greater");
        await Delay.milliseconds(value * 1000);
    }
    
    /**
     * 
     * Asynchronously delays for a millisecond value.
     * 
     * @param value - The value in millisecond to delay by.
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