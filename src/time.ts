import { given } from "@nivinjoseph/n-defensive";

/**
 * @description A class used for time comparison.
 */
export class Time
{
    private constructor() { }
    
    /**
     * 
     * Returns true if the time is in the past, else returns false.
     * 
     * @param time - The time in milliseconds.
     */
    public static isPast(time: number): boolean
    {
        given(time, "time").ensureHasValue().ensureIsNumber();
        
        return time < Date.now();
    }
    
    /**
     * 
     * Returns true if the time is in the future, else returns false.
     * 
     * @param time - The time in milliseconds.
     */
    public static isFuture(time: number): boolean
    {
        given(time, "time").ensureHasValue().ensureIsNumber();

        return time > Date.now();
    }
}