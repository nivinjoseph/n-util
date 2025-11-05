/**
 * Factory class for creating Data Transfer Objects (DTOs) from complex objects.
 * Supports both plain objects and Serializable instances with flexible property mapping.
 *
 * @example
 * ```typescript
 * class User {
 *     public id: string;
 *     public name: string;
 *     public email: string;
 * }
 *
 * const user = new User();
 * user.id = "123";
 * user.name = "John Doe";
 * user.email = "john@example.com";
 *
 * const userDto = DtoFactory.create(user, ["id", "name", "email"]);
 * // Result: { id: "123", name: "John Doe", email: "john@example.com" }
 * ```
 */
export declare class DtoFactory {
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    private constructor();
    /**
     * Creates a DTO from the given object using the specified keys.
     * Supports direct property mapping, aliases, and transform functions.
     *
     * @template T - The type of the source object
     * @template TDto - The type of the resulting DTO (defaults to empty object)
     * @param value - The source object to create the DTO from
     * @param keys - Array of property keys or key mappings to include in the DTO
     * @returns A new DTO object containing the specified properties
     * @throws Error if value is null or undefined, or if keys is not an array
     *
     * @example
     * ```typescript
     * // Basic usage
     * const userDto = DtoFactory.create(user, ["id", "name", "email"]);
     *
     * // Using aliases
     * const userDto = DtoFactory.create(user, [
     *   "id",
     *   { fullName: "name" },
     *   { contactEmail: "email" }
     * ]);
     *
     * // Using transform functions
     * const userDto = DtoFactory.create(user, [
     *   "id",
     *   { formattedName: (user) => `${user.name} (${user.age})` }
     * ]);
     * ```
     */
    static create<T extends object, TDto extends Record<string, any> = Record<string, any>>(value: T, keys: Array<keyof T | {
        [key: string]: keyof T | ((val: T) => any);
    }>): TDto;
}
//# sourceMappingURL=dto-factory.d.ts.map