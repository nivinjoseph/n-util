import { given } from "@nivinjoseph/n-defensive";

/**
 * @static
 */
export class Duration
{
    private constructor() { }
    
    /**
     * 
     * Returns the milliseconds value given seconds.
     * 
     * @param seconds - The value being converted to milliseconds. 
     */
    public static fromSeconds(seconds: number): number
    {
        given(seconds, "seconds").ensureHasValue().ensureIsNumber();
        
        return seconds * 1000;
    }
    
    /**
     * 
     * Returns the milliseconds value given minutes.
     * 
     * @param minutes - The value being converted to milliseconds.
     */
    public static fromMinutes(minutes: number): number
    {
        given(minutes, "minutes").ensureHasValue().ensureIsNumber();
        
        return this.fromSeconds(minutes * 60);
    }
    
    /**
     * 
     * Returns the milliseconds value given hours.
     * 
     * @param hours - The value being converted to milliseconds.
     */
    public static fromHours(hours: number): number
    {
        given(hours, "hours").ensureHasValue().ensureIsNumber();
        
        return this.fromMinutes(hours * 60);
    }
    
    /**
     * 
     * Returns the milliseconds value given days.
     * 
     * @param days - The value being converted to milliseconds.
     */
    public static fromDays(days: number): number
    {
        given(days, "days").ensureHasValue().ensureIsNumber();
        
        return this.fromHours(days * 24);
    }
}