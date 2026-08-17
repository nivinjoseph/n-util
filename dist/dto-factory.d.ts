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
export declare class DtoFactory {
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    private constructor();
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
    static create<T extends object, const TKeys extends ReadonlyArray<DtoKey<T>>>(value: T, keys: TKeys): DtoOf<T, TKeys>;
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
    private static _serializeValue;
}
/**
 * Flattens an intersection into a single object type so hovers and error
 * messages show `{ a: string; b: number }` rather than `{ a: string } & { b: number }`.
 */
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
/**
 * Collapses a union into an intersection, via the contravariance of function
 * parameter positions. Used to merge the per-key contributions into one DTO type.
 */
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
/**
 * Keys of `T` whose values are not methods. Filters `keyof T` so that
 * method names can't be passed to {@link DtoFactory.create} at compile time.
 */
type NonMethodKey<T> = {
    [K in keyof T]-?: T[K] extends (...args: Array<any>) => any ? never : K;
}[keyof T];
/**
 * Maps a source value type to what {@link DtoFactory.create} actually emits for it.
 * Every rule here mirrors a branch of `DtoFactory._serializeValue`, so the type
 * describes the real wire shape rather than the source shape:
 *
 * - `null` / `undefined` → `null`, so an optional `string` becomes `string | null`
 * - function → `null`
 * - `Serializable<TData>` → `TData & { $typename: string }` (its `.serialize()` output)
 * - `Date` → `string`, because the JSON round-trip produces an ISO 8601 string
 * - `Map` / `Set` / `Promise` → `never`, since JSON-cloning them yields `{}`;
 *   surfacing that as `never` turns a meaningless DTO field into a compile error
 * - array → element-wise, recursively
 * - plain object → property-wise, recursively
 */
export type DtoValue<V> = V extends null | undefined ? null : V extends (...args: Array<any>) => any ? null : V extends Serializable<infer TData> ? TData & {
    $typename: string;
} : V extends Date ? string : V extends Map<any, any> | Set<any> | Promise<any> ? never : V extends ReadonlyArray<infer E> ? Array<DtoValue<E>> : V extends object ? {
    -readonly [K in keyof V]-?: DtoValue<V[K]>;
} : V;
/**
 * The DTO contribution of a single {@link DtoKey}. A bare key contributes its own
 * name; an object contributes one entry per alias, resolving either a transform's
 * return type or the aliased source property.
 *
 * `-readonly` because `const TKeys` marks the literal's properties readonly, and
 * `-?` because the runtime always emits every requested key.
 */
type DtoEntry<T, K> = K extends keyof T ? {
    [P in K]: DtoValue<T[P]>;
} : K extends object ? {
    -readonly [A in keyof K]-?: K[A] extends (val: any) => infer R ? DtoValue<R> : K[A] extends keyof T ? DtoValue<T[K[A]]> : never;
} : never;
/**
 * The DTO type produced by projecting `T` through `TKeys` — the union of each
 * key's contribution, merged into a single flat object type.
 *
 * Exported so consumers can type a wrapper around {@link DtoFactory.create}:
 *
 * ```typescript
 * const keys = ["id", "name"] as const;
 * function toDto(u: User): DtoOf<User, typeof keys> { return DtoFactory.create(u, keys); }
 * ```
 */
export type DtoOf<T, TKeys extends ReadonlyArray<unknown>> = Prettify<UnionToIntersection<DtoEntry<T, TKeys[number]>>>;
/**
 * A form-3 transform: takes the source value, returns a derived DTO value.
 *
 * The return type is deliberately `unknown` rather than a restrictive JSON-ish
 * union. {@link DtoValue} maps whatever comes back to what the runtime emits, so
 * a mistake still fails — at the assignment site, where a transform returning a
 * function yields `null` and won't satisfy a schema expecting a value. An
 * up-front union would have to be expressed with an index signature, which
 * TypeScript grants implicitly to type aliases but **not** to interfaces,
 * rejecting perfectly JSON-safe interface-typed values.
 */
type DtoTransform<T> = (val: T) => unknown;
/**
 * Accepted shapes for a DTO key:
 *   - string: direct 1:1 copy of a non-method property on `T`.
 *   - `{ alias: sourceKey }`: rename a non-method property of `T` to `alias`.
 *   - `{ alias: (v) => derived }`: derived value, typed by {@link DtoValue}.
 */
export type DtoKey<T> = NonMethodKey<T> | {
    [alias: string]: NonMethodKey<T> | DtoTransform<T>;
};
export {};
//# sourceMappingURL=dto-factory.d.ts.map