import { given } from "@nivinjoseph/n-defensive";

/**
 * @static
 * 
 * @description Converts time value to a millisecond duration value.
 */
export class Duration
{
    private constructor() { }
    
    /**
     * @description Converts `seconds` into a millisecond value.
     * 
     * @param seconds - The seconds value being converted to milliseconds. 
     * @returns The millisecond value.
     */
    public static fromSeconds(seconds: number): number
    {
        given(seconds, "seconds").ensureHasValue().ensureIsNumber();
        
        return seconds * 1000;
    }
    
    /**
     * @description Converts `minutes` into a millisecond value.
     * 
     * @param minutes - The minutes value being converted to milliseconds. 
     * @returns The millisecond value.
     */
    public static fromMinutes(minutes: number): number
    {
        given(minutes, "minutes").ensureHasValue().ensureIsNumber();
        
        return this.fromSeconds(minutes * 60);
    }
    
    /**
     * @description Converts `hours` into a millisecond value.
     * 
     * @param hours - The hours value being converted to milliseconds. 
     * @returns The millisecond value.
     */
    public static fromHours(hours: number): number
    {
        given(hours, "hours").ensureHasValue().ensureIsNumber();
        
        return this.fromMinutes(hours * 60);
    }
    
    /**
     * @description Converts `days` into a millisecond value.
     * 
     * @param days - The days value being converted to milliseconds. 
     * @returns The millisecond value.
     */
    public static fromDays(days: number): number
    {
        given(days, "days").ensureHasValue().ensureIsNumber();
        
        return this.fromHours(days * 24);
    }
}