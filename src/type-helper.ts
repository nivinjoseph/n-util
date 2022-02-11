import { given } from "@nivinjoseph/n-defensive";

/**
 * @description A class used to add helper function to primitive types.
 */
export class TypeHelper
{
    /**
     * @static
     */
    private constructor() { }
    
    /**
     * @description Checks if the type is boolean, if so returns the value else 
     * does a type conversion on `value` and check if it string value is `"true"` or  `"false"` 
     * then returns the corresponding boolean value. Returns `null` if the value is incorrect.
     * 
     * @param value - The value being type converted.
     * @returns The boolean value or null.
     */
    public static parseBoolean(value: any): boolean | null
    {
        if (value == null)
            return null;
        
        if (typeof (value) === "boolean")
            return value;
        
        const strval = (<string>value.toString()).trim().toLowerCase();
        
        if (strval === "true")
            return true;
        
        if (strval === "false")
            return false;
        
        return null;
    }
    
    /**
     * @description Checks if the type is number, if so returns the `value` else 
     * does a type conversion on `value` and check if it string value is a number. 
     * Returns `null` if the value is incorrect.
     * 
     * @param value - The value being type converted.
     */
    public static parseNumber(value: any): number | null
    {
        if (value == null)
            return null;

        if (typeof (value) === "number")
            return Number.isFinite(value) ? value : null;
        
        const strval = (<string>value.toString()).trim();
        
        if (strval.length === 0)
            return null;
        
        const parsed = +strval;
        if (!Number.isNaN(parsed) && Number.isFinite(parsed))
            return parsed;
        
        return null;
    }

    /**
     * @description Converts the enum, `enumClass` to a tuple of this format `[[var1, val1], [var2, var2], ...]`.
     * 
     * @param enumClass - The enumClass being converted to tuple.
     * @returns The converted tuple.
     */
    public static enumTypeToTuples<T extends string | number>(enumClass: object): ReadonlyArray<[string, T]>
    {
        given(enumClass, "enumClass").ensureHasValue().ensureIsObject();
        
        return this.getEnumTuples(enumClass) as any;
    }

    private static getEnumTuples(enumType: object): ReadonlyArray<[string, string | number]>
    {
        const keys = Object.keys(enumType);
        if (keys.length === 0)
            return [];

        if (this.isNumber(keys[0]))
            return keys.filter(t => this.isNumber(t)).map(t => [(<any>enumType)[t], +t]) as any;

        return keys.map(t => [t, (<any>enumType)[t]]) as any;
    }
    
    private static isNumber(value: any): boolean
    {
        if (value == null)
            return false;

        value = value.toString().trim();
        if (value.length === 0)
            return false;
        let parsed = +value.toString().trim();
        return !isNaN(parsed) && isFinite(parsed);
    }
}