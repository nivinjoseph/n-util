import { given } from "@nivinjoseph/n-defensive";
import { Serializable } from "./serializable.js";
/**
 * Factory for projecting an object into a DTO — a plain, JSON-safe wire shape
 * built from a subset of the source's properties, optionally renamed or derived.
 *
 * The returned type is **inferred from the `keys` argument**, so the DTO is a
 * checked contract rather than an assertion:
 *
 * ```typescript
 * const dto = DtoFactory.create(user, ["id", "name"]);
 * //    ^? { id: string; name: string }
 *
 * const bad: UserSchema = DtoFactory.create(user, ["id"]);
 * //    ^ Error: missing 'name'
 * ```
 *
 * ## The projection contract
 *
 * A DTO is a *projection*: a subset, possibly renamed, possibly derived. It is
 * therefore **not** a serialization and carries **no top-level `$typename`**.
 * Tagging a projection with its source type would let {@link Deserializer.deserialize}
 * find that type registered and call `new Type(partialData)`, silently building a
 * half-constructed instance. Use `value.serialize()` when you need something that
 * round-trips.
 *
 * Nested {@link Serializable} values are a different matter: they are emitted via
 * their own `.serialize()`, so they use their `@serialize("customKey")` keys **and
 * keep their own `$typename`** — those *are* complete serializations and *do*
 * round-trip. The asymmetry is deliberate:
 *
 * | level  | keyed by                          | `$typename` |
 * |--------|-----------------------------------|-------------|
 * | top    | the property name or alias you wrote | never    |
 * | nested | the value's own `@serialize` keys | yes         |
 *
 * @example
 * ```typescript
 * class User extends Serializable<UserData>
 * {
 *     @serialize public get id(): string { return this._id; }
 *     @serialize public get name(): string { return this._name; }
 *     @serialize public get email(): string { return this._email; }
 * }
 *
 * // direct 1:1 copy
 * DtoFactory.create(user, ["id", "name", "email"]);
 * // => { id: "123", name: "John Doe", email: "john@example.com" }
 *
 * // renamed
 * DtoFactory.create(user, ["id", { fullName: "name" }, { contactEmail: "email" }]);
 * // => { id: "123", fullName: "John Doe", contactEmail: "john@example.com" }
 *
 * // derived
 * DtoFactory.create(user, ["id", { label: u => `${u.name} <${u.email}>` }]);
 * // => { id: "123", label: "John Doe <john@example.com>" }
 * ```
 */
export class DtoFactory {
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    constructor() { }
    /**
     * Projects `value` into a DTO containing exactly the given keys.
     *
     * The return type is inferred from `keys` — see {@link DtoOf} for the
     * value-level mapping, and the class docs for the projection contract.
     *
     * @template T - The type of the source object
     * @template TKeys - The literal type of the `keys` array, used to infer the DTO shape
     * @param value - The source object to project
     * @param keys - The keys to include; see {@link DtoKey} for the three accepted forms
     * @returns A new DTO containing one entry per key. No `$typename` is added.
     * @throws Error if value is null/undefined or not an object, or if keys is not an array
     *
     * @example
     * ```typescript
     * // Basic usage
     * DtoFactory.create(user, ["id", "name", "email"]);
     *
     * // Using aliases
     * DtoFactory.create(user, ["id", { fullName: "name" }]);
     *
     * // Using transform functions
     * DtoFactory.create(user, ["id", { formattedName: u => `${u.name} (${u.age})` }]);
     * ```
     */
    static create(value, keys) {
        given(value, "value").ensureHasValue().ensureIsObject();
        given(keys, "keys").ensureHasValue().ensureIsArray();
        return keys.reduce((acc, k) => {
            if (typeof k === "object") {
                Object.keys(k).forEach((alias) => {
                    const mapping = k[alias];
                    acc[alias] = DtoFactory._serializeValue(typeof mapping === "function"
                        ? mapping(value)
                        : value[mapping]);
                });
                return acc;
            }
            acc[k] = DtoFactory._serializeValue(value[k]);
            return acc;
        }, {});
    }
    /**
     * Recursively projects a value into its DTO-safe form:
     *
     * - `null` / `undefined` → `null` (preserves the key for JSON wire format)
     * - function → `null` at every depth (DTOs are for serialization, and
     *   functions can't cross a wire)
     * - `Serializable` instance → its `.serialize()` output
     * - Array → each element processed with the same rules, recursively
     * - `Date` and other plain objects → deep-cloned via JSON round-trip.
     *   Note this means a `Date` becomes an ISO 8601 **string**; {@link DtoValue}
     *   reflects that.
     * - Scalar → passed through
     *
     * Known limitation: this does not walk into plain objects hunting for nested
     * `Serializable` values. `{ addr: new Address(...) }` is JSON-round-tripped
     * like any other plain object, which emits the private backing fields rather
     * than the serialized form, since getters are not own enumerable properties.
     * Project such values explicitly instead.
     */
    static _serializeValue(val) {
        if (val == null)
            return null;
        const type = typeof val;
        if (type === "function")
            return null;
        if (type !== "object")
            return val;
        if (val instanceof Serializable)
            return val.serialize();
        if (Array.isArray(val))
            return val.map(t => DtoFactory._serializeValue(t));
        return JSON.parse(JSON.stringify(val));
    }
}
//# sourceMappingURL=dto-factory.js.map