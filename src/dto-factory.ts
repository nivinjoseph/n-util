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
    public static create<T extends object, TDto extends Record<string, any> = Record<string, any>>(
        value: T,
        keys: Array<DtoKey<T>>
    ): TDto
    {
        given(value as object, "value").ensureHasValue().ensureIsObject();
        given(keys, "keys").ensureHasValue().ensureIsArray();

        const typename = (value as any).$typename ?? value.getTypeName();

        const dto = keys.reduce<Record<string, any>>((acc, k) =>
        {
            if (typeof k === "object")
            {
                Object.keys(k).forEach((alias) =>
                {
                    const mapping = (k as Record<string, unknown>)[alias];
                    const raw = typeof mapping === "function"
                        ? (mapping as (v: T) => unknown)(value)
                        : (value as any)[mapping as string];

                    // Reject function-valued results across every form — DTOs are
                    // for serialization and functions can't cross a wire.
                    if (typeof raw === "function")
                        return;

                    acc[alias] = DtoFactory._serializeValue(raw);
                });
                return acc;
            }

            const raw = (value as any)[k];

            if (typeof raw === "function")
                return acc;

            acc[k as string] = DtoFactory._serializeValue(raw);
            return acc;
        }, {});

        dto["$typename"] = typename;

        return dto as TDto;
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
    private static _serializeValue(val: unknown): unknown
    {
        if (val == null)
            return null;

        if (typeof val === "function")
            return null;

        if (typeof val !== "object")
            return val;

        if (Array.isArray(val))
            return val.map((element): unknown =>
            {
                if (element == null)
                    return null;

                if (typeof element === "function")
                    return null;

                if (typeof element === "object")
                {
                    if (element instanceof Serializable)
                        return element.serialize();
                    return JSON.parse(JSON.stringify(element)) as unknown;
                }

                return element as unknown;
            });

        if (val instanceof Serializable)
            return val.serialize();

        return JSON.parse(JSON.stringify(val)) as unknown;
    }


    // ------------------------------------------------------------------------
    // Previous implementation, preserved for reference during the transition.
    // See https://github.com/nivinjoseph/n-util for the behavioral differences:
    //   - No separate Serializable / plain-object branches (top level always
    //     read directly from `value`).
    //   - Nested Serializable values and arrays of Serializable values are
    //     now recursively serialized on every path.
    //   - Method-valued keys are rejected at compile time via `NonMethodKey`.
    //   - Form-3 transforms that return a function are rejected at compile
    //     time via `DtoTransform`, and defensively at runtime.
    // ------------------------------------------------------------------------
    // public static create_v1<T extends object, TDto extends Record<string, any> = Record<string, any>>(value: T, keys: Array<keyof T | { [key: string]: keyof T | ((val: T) => any); }>): TDto
    // {
    //     given(value as object, "value").ensureHasValue().ensureIsObject();
    //     given(keys, "keys").ensureHasValue().ensureIsArray();
    //
    //     const typename = (value as any).$typename ?? value.getTypeName();
    //
    //     let dto;
    //
    //     if (value instanceof Serializable)
    //     {
    //         const serialized = value.serialize();
    //         dto = keys.reduce<any>((acc, k) =>
    //         {
    //             if (typeof k === "object")
    //             {
    //                 Object.keys(k).forEach((alias) =>
    //                 {
    //                     const key = (k as any)[alias];
    //                     if (typeof key === "function")
    //                         acc[alias] = key(value);
    //                     else
    //                         acc[alias] = serialized[key];
    //                     if (acc[alias] == null)
    //                         acc[alias] = null;
    //                 });
    //             }
    //             else
    //             {
    //                 acc[k] = serialized[k];
    //                 if (acc[k] == null)
    //                     acc[k] = null;
    //             }
    //             return acc;
    //         }, {});
    //     }
    //     else
    //     {
    //         dto = keys.reduce<any>((acc, k) =>
    //         {
    //             if (typeof k === "object")
    //             {
    //                 Object.keys(k).forEach((alias) =>
    //                 {
    //                     const key = (k as any)[alias];
    //                     if (typeof key === "function")
    //                         acc[alias] = key(value);
    //                     else
    //                         acc[alias] = (value as any)[key];
    //                     if (acc[alias] == null)
    //                         acc[alias] = null;
    //                 });
    //             }
    //             else
    //             {
    //                 let val = (value as any)[k];
    //
    //                 if (typeof val === "function")
    //                     return acc;
    //
    //                 if (val instanceof Serializable)
    //                     val = val.serialize();
    //
    //                 acc[k] = val;
    //                 if (acc[k] == null)
    //                     acc[k] = null;
    //             }
    //             return acc;
    //         }, {});
    //     }
    //
    //     dto.$typename = typename;
    //
    //     return dto as TDto;
    // }
}


/**
 * Keys of `T` whose values are not methods. Filters `keyof T` so that
 * method names can't be passed to {@link DtoFactory.create} at compile time.
 */
type NonMethodKey<T> = {
    [K in keyof T]-?: T[K] extends (...args: Array<any>) => any ? never : K
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
export type DtoReturn =
    | string
    | number
    | boolean
    | null
    | Serializable<any>
    | ReadonlyArray<DtoReturn>
    | { readonly [key: string]: DtoReturn; };


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
export type DtoKey<T> =
    | NonMethodKey<T>
    | { [alias: string]: NonMethodKey<T> | DtoTransform<T>; };