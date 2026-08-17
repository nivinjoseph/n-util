# DTO Factory

`DtoFactory` projects an object into a **DTO** — a plain, JSON-safe wire shape built from a subset of the source's properties, optionally renamed or derived.

The returned type is **inferred from the keys you pass**, so the DTO is a checked contract rather than an assertion:

```typescript
const dto = DtoFactory.create(user, ["id", "name"]);
//    ^? { id: string; name: string }

const bad: UserSchema = DtoFactory.create(user, ["id"]);
//    ^ Error: Property 'name' is missing
```

## Features

- DTO type inferred from the key list — a missing or misspelled key is a compile error
- Three key forms: direct copy, rename, and derived value
- Recursive serialization of nested `Serializable` values
- Automatic null coercion, so the wire shape is stable
- Method keys and unprojectable values rejected at compile time

## The projection contract

This is the most important thing to understand about `DtoFactory`, and the thing that distinguishes it from `Serializable.serialize()`.

A DTO is a **projection**: a subset, possibly renamed, possibly derived. It is therefore **not** a serialization, and it carries **no top-level `$typename`** — ever.

Why this matters: if a projection claimed a `$typename`, `Deserializer.deserialize` would find that type registered and call `new Type(partialData)`, silently constructing a half-built instance from a payload that was never meant to round-trip. So:

```typescript
const dto = DtoFactory.create(user, ["name"]);
Deserializer.deserialize(dto);   // throws — by design

user.serialize();                // use this when you need something that round-trips
```

Nested `Serializable` values are a different matter. They are emitted via their own `.serialize()`, so they use their `@serialize("customKey")` keys **and keep their own `$typename`** — those *are* complete serializations and *do* round-trip.

| level | keyed by | `$typename` |
|---|---|---|
| top | the property name or alias **you** wrote | never |
| nested | the value's own `@serialize` keys | yes |

The asymmetry is deliberate. Here it is in one example:

```typescript
type GeoData = { lat: number; lng: number; };

@serialize
class Geo extends Serializable<GeoData>
{
    // property is `latitude`; the wire key is `lat`
    @serialize("lat") public get latitude(): number { return this._latitude; }
    @serialize("lng") public get longitude(): number { return this._longitude; }

    public constructor(data: GeoData)
    {
        super(data);
        this._latitude = data.lat;
        this._longitude = data.lng;
    }
}

DtoFactory.create(holder, [{ position: "geo" }]);
// {
//     position: {                 <- your alias
//         lat: 45.4,              <- Geo's @serialize keys, not `latitude`
//         lng: -75.7,
//         $typename: "Geo"        <- legitimate: this level does round-trip
//     }
// }
// ...and no $typename at the top level.
```

Because the top level is keyed by property name, form-1 keys are `keyof T`. That is exactly what makes inference possible.

## The three key forms

```typescript
type UserData = { name: string; email: string; };

@serialize
class User extends Serializable<UserData>
{
    private readonly _name: string;
    private readonly _email: string;

    @serialize public get name(): string { return this._name; }
    @serialize public get email(): string { return this._email; }

    public constructor(data: UserData)
    {
        super(data);
        this._name = data.name;
        this._email = data.email;
    }

    public greet(): string { return `hi ${this._name}`; }
}
```

**Form 1 — direct copy.** A property name; the DTO uses the same key.

```typescript
DtoFactory.create(user, ["name", "email"]);
// ^? { name: string; email: string }
```

**Form 2 — rename.** `{ alias: sourceKey }`.

```typescript
DtoFactory.create(user, [{ displayName: "name" }]);
// ^? { displayName: string }
```

**Form 3 — derived.** `{ alias: transform }`. The parameter is contextually typed, so you don't need to annotate it.

```typescript
DtoFactory.create(user, [{ label: u => `${u.name} <${u.email}>` }]);
// ^? { label: string }
```

All three mix freely in one call, and the results merge into a single flat object type:

```typescript
DtoFactory.create(user, ["name", { contact: "email" }, { label: u => u.name }]);
// ^? { name: string; contact: string; label: string }
```

## Value traversal rules

Each projected value is processed recursively, and the inferred type reflects what you actually get:

| source value | DTO value | inferred type |
|---|---|---|
| `null` / `undefined` | `null` | `null` |
| optional property | `null` when absent | `T \| null` |
| function | `null` | `null` |
| `Serializable<TData>` | its `.serialize()` output | `TData & { $typename: string }` |
| **`Date`** | **ISO 8601 string** | **`string`** |
| array | element-wise, recursively | `Array<...>` |
| plain object | deep-cloned via JSON round-trip | property-wise, recursively |
| `Map` / `Set` / `Promise` | `{}` | `never` |
| scalar | unchanged | unchanged |

### Dates become strings

Worth calling out, because it is easy to miss. Values are deep-cloned with a JSON round-trip, and `JSON.stringify` turns a `Date` into a string:

```typescript
class Event { public startsAt = new Date("2020-01-01T00:00:00Z"); }

const dto = DtoFactory.create(new Event(), ["startsAt"]);
// { startsAt: "2020-01-01T00:00:00.000Z" }
// ^? { startsAt: string }
```

The type says `string`, so nothing silently lies to you. If you want a different format, convert explicitly in a transform.

### Nullish values are coerced, never omitted

A requested key is always present in the output. This keeps the wire shape stable — a list endpoint returns rows with identical key sets regardless of per-row values.

```typescript
class Sparse { public a = "x"; public b?: string; }

DtoFactory.create(new Sparse(), ["a", "b"]);
// { a: "x", b: null }   <- `b` is present and null, not missing
```

### Known limitation: a `Serializable` hidden inside a plain object

Traversal does not walk into plain objects hunting for nested `Serializable` values:

```typescript
class Holder { public wrapper = { addr: new Address(...) }; }

DtoFactory.create(new Holder(), ["wrapper"]);
// { wrapper: { addr: { _street: "...", _city: "..." } } }
//                     ^ private backing fields, because getters are not
//                       own enumerable properties
```

Project such values explicitly instead — e.g. `[{ addr: h => h.wrapper.addr }]`, which hits the `Serializable` directly and serializes it properly.

## Compile-time guarantees

Method names are rejected, in both form 1 and form 2:

```typescript
DtoFactory.create(user, ["greet"]);
// Error: '"greet"' is not assignable to type 'DtoKey<User>'

DtoFactory.create(user, [{ g: "greet" }]);
// Error: '"greet"' is not assignable to ...
```

Misspellings are rejected, since form-1 keys are `keyof T`:

```typescript
DtoFactory.create(user, ["nmae"]);   // Error
```

A transform returning something unprojectable doesn't error at the transform — it infers the type the runtime will actually produce, so the mistake surfaces where it matters:

```typescript
const dto = DtoFactory.create(user, [{ f: u => u.greet }]);
// ^? { f: null }        <- the runtime nulls functions

const bad: { f: string; } = dto;   // Error: 'null' is not assignable to 'string'
```

`Map`, `Set`, and `Promise` infer `never` for the same reason: JSON-cloning them yields `{}`, so a `never` turns a meaningless field into an error at the point of use.

> Transform return types are intentionally **not** constrained by an up-front JSON-ish union. Such a union has to be written with a string index signature, which TypeScript grants implicitly to type aliases but **not** to interfaces — so it would reject perfectly JSON-safe interface-typed values. Inferring the real output type catches the same mistakes without the false positives.

## API Reference

### `DtoFactory.create`

```typescript
public static create<T extends object, const TKeys extends ReadonlyArray<DtoKey<T>>>(
    value: T,
    keys: TKeys
): DtoOf<T, TKeys>
```

- **`value`** — the source object to project. Throws if null, undefined, or not an object.
- **`keys`** — the keys to include. Throws if not an array.
- **returns** — a new DTO with one entry per key, and no `$typename`.

### Exported types

| type | purpose |
|---|---|
| `DtoKey<T>` | the three accepted key forms for a source type `T` |
| `DtoOf<T, TKeys>` | the DTO type produced by projecting `T` through `TKeys` |
| `DtoValue<V>` | what a single source value type becomes on the wire |

`DtoOf` is what you need to type a wrapper around `create`:

```typescript
import { DtoFactory, DtoOf } from "@nivinjoseph/n-util";

const userKeys = ["id", "name", "email"] as const;

function toUserDto(user: User): DtoOf<User, typeof userKeys>
{
    return DtoFactory.create(user, userKeys);
}
```

## Complete example

```typescript
import { DtoFactory, Serializable, serialize } from "@nivinjoseph/n-util";

type AddressData = { street: string; city: string; };

@serialize
class Address extends Serializable<AddressData>
{
    private readonly _street: string;
    private readonly _city: string;

    @serialize public get street(): string { return this._street; }
    @serialize public get city(): string { return this._city; }

    public constructor(data: AddressData)
    {
        super(data);
        this._street = data.street;
        this._city = data.city;
    }
}

type EmployeeData = { firstName: string; lastName: string; salary: number; };

@serialize
class Employee extends Serializable<EmployeeData>
{
    private readonly _firstName: string;
    private readonly _lastName: string;
    private readonly _salary: number;
    private readonly _address: Address;
    private readonly _hiredAt: Date;

    @serialize public get firstName(): string { return this._firstName; }
    @serialize public get lastName(): string { return this._lastName; }
    @serialize public get salary(): number { return this._salary; }
    @serialize public get address(): Address { return this._address; }

    public get hiredAt(): Date { return this._hiredAt; }

    public constructor(data: EmployeeData & { address: Address; hiredAt: Date; })
    {
        super(data);
        this._firstName = data.firstName;
        this._lastName = data.lastName;
        this._salary = data.salary;
        this._address = data.address;
        this._hiredAt = data.hiredAt;
    }
}

const dto = DtoFactory.create(employee, [
    "salary",
    "address",
    { fullName: e => `${e.firstName} ${e.lastName}` },
    { hiredOn: e => e.hiredAt.toISOString().split("T")[0] }
]);

// {
//     salary: 85000,
//     address: { street: "711 Kennedy", city: "Ottawa", $typename: "Address" },
//     fullName: "Jane Doe",
//     hiredOn: "2019-04-01"
// }
//
// inferred as:
// {
//     salary: number;
//     address: AddressData & { $typename: string };
//     fullName: string;
//     hiredOn: string;
// }
```

Note `hiredAt` is converted explicitly with `.toISOString()`. Projecting it directly would also produce a string, but the explicit conversion states the format you want rather than inheriting whatever `JSON.stringify` does.

## See also

- [Serializable](serializable.md) — full, round-trippable serialization, and the `@serialize` decorator that `DtoFactory` relies on for nested values.
