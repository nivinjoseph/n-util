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
    static create<T extends object, TDto extends Record<string, any> = Record<string, any>>(value: T, keys: Array<DtoKey<T>>): TDto;
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
    private static _serializeValue;
}
/**
 * Keys of `T` whose values are not methods. Filters `keyof T` so that
 * method names can't be passed to {@link DtoFactory.create} at compile time.
 */
type NonMethodKey<T> = {
    [K in keyof T]-?: T[K] extends (...args: Array<any>) => any ? never : K;
}[keyof T];
/**
 * Values that may legally appear in a DTO. Recursive union of JSON-ish types
 * plus `Serializable` instances.
 *
 * `undefined` is intentionally excluded — callers should return `null` for
 * missing values so the type accurately reflects the JSON wire format.
 * `Date` is intentionally excluded — the runtime JSON round-trip serializes
 * `Date` to a string, so accepting it in the type would misrepresent what
 * the caller actually gets; convert explicitly (e.g. `date.toISOString()`).
 *
 * Returning a value that includes a function anywhere — a bare function, a
 * method reference, a callback-bearing object, a `Map` / `Set`, a `Promise`,
 * or any class whose shape carries method members — fails to unify with this
 * union and is rejected at the call site.
 */
export type DtoReturn = string | number | boolean | null | Serializable<any> | ReadonlyArray<DtoReturn> | {
    readonly [key: string]: DtoReturn;
};
/**
 * A form-3 transform: takes the source value, returns a derived DTO value.
 * The return type is constrained to {@link DtoReturn}, so callers cannot
 * return a function-bearing value. A deliberate `as any` escape is the only
 * way past this check and is caught at runtime by `_serializeValue`.
 */
type DtoTransform<T> = (val: T) => DtoReturn;
/**
 * Accepted shapes for a DTO key:
 *   - string: direct 1:1 copy of a non-method property on `T`.
 *   - `{ alias: sourceKey }`: rename a non-method property of `T` to `alias`.
 *   - `{ alias: (v) => derived }`: derived value of type {@link DtoReturn}.
 */
export type DtoKey<T> = NonMethodKey<T> | {
    [alias: string]: NonMethodKey<T> | DtoTransform<T>;
};
export {};
//# sourceMappingURL=dto-factory.d.ts.map