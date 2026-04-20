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
export class DtoFactory {
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    constructor() { }
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
    static create(value, keys) {
        given(value, "value").ensureHasValue().ensureIsObject();
        given(keys, "keys").ensureHasValue().ensureIsArray();
        const typename = value.$typename ?? value.getTypeName();
        const dto = keys.reduce((acc, k) => {
            if (typeof k === "object") {
                Object.keys(k).forEach((alias) => {
                    const mapping = k[alias];
                    const raw = typeof mapping === "function"
                        ? mapping(value)
                        : value[mapping];
                    // Reject function-valued results across every form — DTOs are
                    // for serialization and functions can't cross a wire.
                    if (typeof raw === "function")
                        return;
                    acc[alias] = DtoFactory._serializeValue(raw);
                });
                return acc;
            }
            const raw = value[k];
            if (typeof raw === "function")
                return acc;
            acc[k] = DtoFactory._serializeValue(raw);
            return acc;
        }, {});
        dto["$typename"] = typename;
        return dto;
    }
    /**
     * Recursively projects a value into its DTO-safe form, mirroring the
     * traversal rules of {@link Serializable.serialize}:
     *
     * - `null` / `undefined` → `null` (preserves the key for JSON wire format)
     * - `Serializable` instance → its `.serialize()` output
     * - Array → each element processed with the same rules
     * - Plain object → deep-cloned via JSON round-trip
     * - Scalar → passed through
     *
     * Function values are treated as `null` here as a runtime backstop —
     * the type system already rejects them at the call site, but JS consumers
     * and `as any` casts can slip functions in at runtime.
     */
    static _serializeValue(val) {
        if (val == null)
            return null;
        if (typeof val === "function")
            return null;
        if (typeof val !== "object")
            return val;
        if (Array.isArray(val))
            return val.map((element) => {
                if (element == null)
                    return null;
                if (typeof element === "function")
                    return null;
                if (typeof element === "object") {
                    if (element instanceof Serializable)
                        return element.serialize();
                    return JSON.parse(JSON.stringify(element));
                }
                return element;
            });
        if (val instanceof Serializable)
            return val.serialize();
        return JSON.parse(JSON.stringify(val));
    }
}
//# sourceMappingURL=dto-factory.js.map