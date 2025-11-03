import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";

/**
 * Utility class for type conversion and validation in TypeScript.
 * Provides methods for safe parsing of values to common types and helper methods for working with enums.
 *
 * @example
 * ```typescript
 * // Parse boolean values
 * const bool = TypeHelper.parseBoolean("true"); // true
 *
 * // Parse number values
 * const num = TypeHelper.parseNumber("42"); // 42
 *
 * // Work with enums
 * enum Status { Active = "ACTIVE" }
 * const tuples = TypeHelper.enumTypeToTuples(Status);
 * ```
 */
export class TypeHelper
{
    /**
     * Private constructor to prevent instantiation.
     * @private
     */
    private constructor() { }


    /**
     * Parses a value to a boolean.
     *
     * @param value - The value to parse
     * @returns The parsed boolean value or null if parsing fails
     *
     * @example
     * ```typescript
     * TypeHelper.parseBoolean("true"); // true
     * TypeHelper.parseBoolean("false"); // false
     * TypeHelper.parseBoolean("invalid"); // null
     * ```
     */
    public static parseBoolean(value: unknown): boolean | null
    {
        if (value == null)
            return null;

        if (typeof value === "boolean")
            return value;

        const strval = (value as object).toString().trim().toLowerCase();

        if (strval === "true")
            return true;

        if (strval === "false")
            return false;

        return null;
    }

    /**
     * Parses a value to a number.
     *
     * @param value - The value to parse
     * @returns The parsed number value or null if parsing fails
     *
     * @example
     * ```typescript
     * TypeHelper.parseNumber("42"); // 42
     * TypeHelper.parseNumber("3.14"); // 3.14
     * TypeHelper.parseNumber("invalid"); // null
     * ```
     */
    public static parseNumber(value: unknown): number | null
    {
        if (value == null)
            return null;

        if (typeof value === "number")
            return Number.isFinite(value) ? value : null;

        const strval = (value as object).toString().trim();

        if (strval.length === 0)
            return null;

        const parsed = +strval;
        if (!Number.isNaN(parsed) && Number.isFinite(parsed))
            return parsed;

        return null;
    }

    /**
     * Converts an enum type to an array of tuples containing key-value pairs.
     *
     * @param enumClass - The enum class to convert
     * @returns An array of tuples where each tuple contains [key, value] pairs
     *
     * @example
     * ```typescript
     * enum Status { Active = "ACTIVE", Inactive = "INACTIVE" }
     * const tuples = TypeHelper.enumTypeToTuples(Status);
     * // [["Active", "ACTIVE"], ["Inactive", "INACTIVE"]]
     * ```
     */
    public static enumTypeToTuples<T extends string | number>(enumClass: object): Array<[string, T]>
    {
        given(enumClass, "enumClass").ensureHasValue().ensureIsObject();

        return this._getEnumTuples(enumClass) as Array<[string, T]>;
    }

    /**
     * Enforces type safety in switch statements by throwing an exception for unhandled cases.
     *
     * @param _value - The value that should be of type 'never'
     * @param message - Optional error message
     * @throws {ApplicationException} Always throws an exception
     *
     * @example
     * ```typescript
     * type Status = "active" | "inactive";
     *
     * function handleStatus(status: Status): void {
     *     switch (status) {
     *         case "active":
     *             // Handle active
     *             break;
     *         case "inactive":
     *             // Handle inactive
     *             break;
     *         default:
     *             TypeHelper.impossible(status);
     *     }
     * }
     * ```
     */
    public static impossible(_value: never, message?: string): never
    {
        throw new ApplicationException(message ?? `Invalid value: ${_value}`);
    }


    private static _getEnumTuples(enumType: object): Array<[string, string | number]>
    {
        const keys = Object.keys(enumType);
        if (keys.length === 0)
            return [];

        if (this._isNumber(keys[0]))
            return keys.filter(t => this._isNumber(t)).map(t => [(enumType as any)[t] as string, +t]);

        return keys.map(t => [t, (enumType as any)[t] as string]);
    }

    private static _isNumber(value: unknown): boolean
    {
        if (value == null)
            return false;

        const val = (value as object).toString().trim();
        if (val.length === 0)
            return false;
        const parsed = +(value as object).toString().trim();
        return !isNaN(parsed) && isFinite(parsed);
    }
}

// enum Foo
// {
//     bar = "BAR",
//     baz = "BAZ",
//     zeb = "ZEB"
// }

// export function doStuff(val: Foo): void
// {
//     switch (val)
//     {
//         case Foo.bar:
//             console.log(val);
//             break;
//         case Foo.baz:
//             console.log(val, "baz");
//             break;
//         default:
//             TypeHelper.impossible(val, "ff");
//     }
// }