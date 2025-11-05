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
export declare class TypeHelper {
    /**
     * Private constructor to prevent instantiation.
     * @private
     */
    private constructor();
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
    static parseBoolean(value: unknown): boolean | null;
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
    static parseNumber(value: unknown): number | null;
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
    static enumTypeToTuples<T extends string | number>(enumClass: object): Array<[string, T]>;
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
    static impossible(_value: never, message?: string): never;
    private static _getEnumTuples;
    private static _isNumber;
}
//# sourceMappingURL=type-helper.d.ts.map