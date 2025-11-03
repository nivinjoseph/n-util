import { given } from "@nivinjoseph/n-defensive";
import { Serializable } from "./serializable.js";


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
export class DtoFactory
{
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    private constructor() { }


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
    public static create<T extends object, TDto extends Record<string, any> = Record<string, any>>(value: T, keys: Array<keyof T | { [key: string]: keyof T | ((val: T) => any); }>): TDto
    {
        given(value as object, "value").ensureHasValue().ensureIsObject();
        given(keys, "keys").ensureHasValue().ensureIsArray();

        const typename = (value as any).$typename ?? value.getTypeName();

        let dto;

        if (value instanceof Serializable)
        {
            const serialized = value.serialize();
            dto = keys.reduce<any>((acc, k) =>
            {
                if (typeof k === "object")
                {
                    Object.keys(k).forEach((alias) =>
                    {
                        const key = (k as any)[alias];
                        if (typeof key === "function")
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                            acc[alias] = key(value);
                        else
                            acc[alias] = serialized[key];
                        if (acc[alias] == null)
                            acc[alias] = null;
                    });
                }
                else
                {
                    acc[k] = serialized[k];
                    if (acc[k] == null)
                        acc[k] = null;
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return acc;
            }, {});
        }
        else
        {
            dto = keys.reduce<any>((acc, k) =>
            {
                if (typeof k === "object")
                {
                    Object.keys(k).forEach((alias) =>
                    {
                        const key = (k as any)[alias];
                        if (typeof key === "function")
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                            acc[alias] = key(value);
                        else
                            acc[alias] = (value as any)[key];
                        if (acc[alias] == null)
                            acc[alias] = null;
                    });
                }
                else
                {
                    let val = (value as any)[k];

                    if (typeof val === "function")
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return acc;

                    if (val instanceof Serializable)
                        val = val.serialize();

                    acc[k] = val;
                    if (acc[k] == null)
                        acc[k] = null;
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return acc;
            }, {});
        }

        dto.$typename = typename;

        return dto as TDto;
    }
}