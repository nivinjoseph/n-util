// Compile-time assertions for DtoFactory's inferred DTO types.
//
// This file is NOT named *.test.ts on purpose: `tsc` type-checks it (tsconfig has
// no include/exclude, and noEmitOnError is on, so a failure here fails the build),
// but the `./test/**/*.test.js` glob will not execute it. Nothing here is
// runtime-verifiable — it all lives in the type system.
//
// Every `@ts-expect-error` is a two-way assertion: TypeScript raises TS2578 if the
// following line does NOT error, so a rejection that silently stops working fails
// the build just as loudly as a false positive.

import { DtoFactory, DtoOf, Serializable, serialize } from "../src/index.js";


/** True only if A and B are identical types — not merely mutually assignable. */
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

/** Compiles only when the supplied type resolves to `true`. */
declare function assertType<T extends true>(): void;


type AddressData = { street: string; city: string; };

@serialize
class Address extends Serializable<AddressData>
{
    private readonly _street: string;
    private readonly _city: string;

    @serialize
    public get street(): string { return this._street; }

    @serialize
    public get city(): string { return this._city; }

    public constructor(data: AddressData)
    {
        super(data);
        this._street = data.street;
        this._city = data.city;
    }
}


/** Deliberately an `interface`, not a type alias — see the interface case below. */
interface Badge
{
    label: string;
    rank: number;
}


type UserData = { name: string; email: string; };

declare class User extends Serializable<UserData>
{
    public get name(): string;
    public get email(): string;
    public get address(): Address;
    public get tags(): Array<string>;
    public get created(): Date;
    public get nickname(): string | undefined;
    public get profile(): { bio: string; score: number; };
    public get badge(): Badge;
    public greet(): string;
}

declare const user: User;

type UserSchema = { name: string; email: string; };


// -------------------------------------------------------------------- inference

const scalars = DtoFactory.create(user, ["name", "email"]);
assertType<Equals<typeof scalars, { name: string; email: string; }>>();

// A nested Serializable is typed as its serialize() output, $typename included.
const nested = DtoFactory.create(user, ["address"]);
assertType<Equals<typeof nested, { address: AddressData & { $typename: string; }; }>>();

// A Date becomes an ISO string, because the runtime JSON round-trip makes it one.
const dated = DtoFactory.create(user, ["created"]);
assertType<Equals<typeof dated, { created: string; }>>();

// Optional properties surface as `| null`, matching the runtime coercion.
const optional = DtoFactory.create(user, ["nickname"]);
assertType<Equals<typeof optional, { nickname: string | null; }>>();

const arrays = DtoFactory.create(user, ["tags"]);
assertType<Equals<typeof arrays, { tags: Array<string>; }>>();

const plain = DtoFactory.create(user, ["profile"]);
assertType<Equals<typeof plain, { profile: { bio: string; score: number; }; }>>();

// Form 2: renamed.
const renamed = DtoFactory.create(user, [{ displayName: "name" }]);
assertType<Equals<typeof renamed, { displayName: string; }>>();

// Form 3: derived. Note `u` is NOT annotated — contextual typing survives the
// `const` type parameter, so callers don't have to spell out the source type.
const derived = DtoFactory.create(user, [{ line: (u) => `${u.name} <${u.email}>` }]);
assertType<Equals<typeof derived, { line: string; }>>();

// All three forms merge into one flat object type.
const mixed = DtoFactory.create(user, ["name", { contact: "email" }, { greeting: (u) => u.name }]);
assertType<Equals<typeof mixed, { name: string; contact: string; greeting: string; }>>();

// $typename must be absent from a projection.
assertType<Equals<keyof typeof scalars, "name" | "email">>();

// DtoOf lets a consumer type a wrapper around create().
const wrapperKeys = ["name", "email"] as const;
assertType<Equals<DtoOf<User, typeof wrapperKeys>, { name: string; email: string; }>>();


// ----------------------------------------------------------- interface support
//
// Regression guard. The previous DtoReturn union was expressed with an index
// signature, which TypeScript grants implicitly to type aliases but NOT to
// interfaces — so these two used to fail with "Index signature is missing in
// type 'Badge'" despite Badge being perfectly JSON-safe.

const viaTransform = DtoFactory.create(user, [{ b: (u) => u.badge }]);
assertType<Equals<typeof viaTransform, { b: { label: string; rank: number; }; }>>();

const viaProperty = DtoFactory.create(user, ["badge"]);
assertType<Equals<typeof viaProperty, { badge: { label: string; rank: number; }; }>>();


// ------------------------------------------------------------------ rejections

export const exact: UserSchema = DtoFactory.create(user, ["name", "email"]);

// @ts-expect-error a projection missing a schema member is caught at the assignment site
export const missing: UserSchema = DtoFactory.create(user, ["name"]);

// @ts-expect-error method names are not projectable (NonMethodKey)
DtoFactory.create(user, ["greet"]);

// @ts-expect-error aliasing a method is equally rejected
DtoFactory.create(user, [{ g: "greet" }]);

// @ts-expect-error a misspelled key is not a property of the source
DtoFactory.create(user, ["nmae"]);

// Map / Set / Promise infer `never`: JSON-cloning them yields `{}`, so the field
// would be meaningless. Surfacing `never` turns that into an error at the point
// of use rather than a silently empty object on the wire.
const mapped = DtoFactory.create(user, [{ m: (): Map<string, number> => new Map() }]);
assertType<Equals<typeof mapped, { m: never; }>>();

// A transform returning a function infers `null` rather than erroring outright —
// the runtime nulls it, and the mistake still fails at the assignment site.
// eslint-disable-next-line @typescript-eslint/unbound-method
const fn = DtoFactory.create(user, [{ f: (u) => u.greet }]);
assertType<Equals<typeof fn, { f: null; }>>();

// @ts-expect-error which is exactly what makes this fail
// eslint-disable-next-line @typescript-eslint/unbound-method
export const fnAssigned: { f: string; } = DtoFactory.create(user, [{ f: (u) => u.greet }]);
