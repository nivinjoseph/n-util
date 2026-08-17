import assert from "node:assert";
import { describe, test } from "node:test";
import "@nivinjoseph/n-ext";
import { Deserializer, DtoFactory, Serializable, serialize } from "../src/index.js";


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


type UserData = { name: string; email: string; address: AddressData; tags: Array<string>; };

@serialize
class User extends Serializable<UserData>
{
    private readonly _name: string;
    private readonly _email: string;
    private readonly _address: Address;
    private readonly _tags: Array<string>;

    @serialize
    public get name(): string { return this._name; }

    @serialize
    public get email(): string { return this._email; }

    @serialize
    public get address(): Address { return this._address; }

    @serialize
    public get tags(): Array<string> { return this._tags; }

    public constructor(data: { name: string; email: string; address: Address; tags: Array<string>; })
    {
        super(data as UserData);
        this._name = data.name;
        this._email = data.email;
        this._address = data.address;
        this._tags = data.tags;
    }

    public greet(): string { return `hi ${this._name}`; }
}


class PlainUser
{
    public name: string;
    public email: string;
    public profile: { bio: string; score: number; };
    public friends: Array<Address>;
    public address: Address;

    public constructor()
    {
        this.name = "Plain Jane";
        this.email = "jane@example.com";
        this.profile = { bio: "hello", score: 42 };
        this.friends = [
            new Address({ street: "1 A St", city: "Alpha" }),
            new Address({ street: "2 B St", city: "Beta" })
        ];
        this.address = new Address({ street: "99 Main", city: "Gamma" });
    }

    public computeScore(): number { return this.profile.score * 2; }
}


type GeoData = { lat: number; lng: number; };

@serialize
class Geo extends Serializable<GeoData>
{
    private readonly _latitude: number;
    private readonly _longitude: number;

    // Note the custom serialization keys: the property is `latitude`, the wire key is `lat`.
    @serialize("lat")
    public get latitude(): number { return this._latitude; }

    @serialize("lng")
    public get longitude(): number { return this._longitude; }

    public constructor(data: GeoData)
    {
        super(data);
        this._latitude = data.lat;
        this._longitude = data.lng;
    }
}


class GeoHolder
{
    public geo: Geo = new Geo({ lat: 45.4, lng: -75.7 });
}


class DateHolder
{
    public when: Date = new Date("2020-01-01T00:00:00.000Z");
    public meta: { at: Date; } = { at: new Date("2021-01-01T00:00:00.000Z") };
    public stamps: Array<Date> = [new Date("2022-01-01T00:00:00.000Z")];
}


class GridHolder
{
    public grid: Array<Array<Address>> = [
        [new Address({ street: "1 A St", city: "Alpha" })],
        [new Address({ street: "2 B St", city: "Beta" })]
    ];
}


await describe("DtoFactory", async () =>
{
    const mkUser = (): User => new User({
        name: "Nivin",
        email: "n@example.com",
        address: new Address({ street: "711 Kennedy", city: "Ottawa" }),
        tags: ["admin", "beta"]
    });


    await describe("form 1 (string key, 1:1 mapping)", async () =>
    {
        await test("copies scalar properties from a Serializable value", () =>
        {
            const dto = DtoFactory.create(mkUser(), ["name", "email"]);
            assert.strictEqual(dto["name"], "Nivin");
            assert.strictEqual(dto["email"], "n@example.com");
        });

        await test("copies scalar properties from a plain-object value", () =>
        {
            const dto = DtoFactory.create(new PlainUser(), ["name", "email"]);
            assert.strictEqual(dto["name"], "Plain Jane");
            assert.strictEqual(dto["email"], "jane@example.com");
        });

        await test("recursively serializes a nested Serializable property", () =>
        {
            const dto = DtoFactory.create(mkUser(), ["name", "address"]);
            // Nested $typename is contractual — nested Serializables are complete
            // serializations and do round-trip. Do not "clean this up".
            assert.deepStrictEqual(dto["address"], {
                street: "711 Kennedy",
                city: "Ottawa",
                $typename: "Address"
            });
        });

        await test("recursively serializes an array of Serializable values", () =>
        {
            const dto = DtoFactory.create(new PlainUser(), ["friends"]);
            // Nested $typename is contractual — nested Serializables are complete
            // serializations and do round-trip. Do not "clean this up".
            assert.deepStrictEqual(dto["friends"], [
                { street: "1 A St", city: "Alpha", $typename: "Address" },
                { street: "2 B St", city: "Beta", $typename: "Address" }
            ]);
        });

        await test("deep-clones plain-object properties (no live reference)", () =>
        {
            const source = new PlainUser();
            const dto = DtoFactory.create(source, ["profile"]);
            assert.deepStrictEqual(dto["profile"], { bio: "hello", score: 42 });
            assert.notStrictEqual(dto["profile"], source.profile, "should be a clone, not the live reference");
            source.profile.score = 9999;
            assert.strictEqual((dto["profile"] as { score: number; }).score, 42, "mutations to source must not affect the DTO");
        });

        await test("preserves scalar arrays", () =>
        {
            const dto = DtoFactory.create(mkUser(), ["tags"]);
            assert.deepStrictEqual(dto["tags"], ["admin", "beta"]);
        });

    });


    await describe("form 2 (alias + source key)", async () =>
    {
        await test("renames a source property to the alias", () =>
        {
            const dto = DtoFactory.create(mkUser(), [{ displayName: "name" }]);
            assert.strictEqual(dto["displayName"], "Nivin");
        });

        await test("recursively serializes a renamed nested Serializable", () =>
        {
            const dto = DtoFactory.create(mkUser(), [{ location: "address" }]);
            // Nested $typename is contractual — nested Serializables are complete
            // serializations and do round-trip. Do not "clean this up".
            assert.deepStrictEqual(dto["location"], {
                street: "711 Kennedy",
                city: "Ottawa",
                $typename: "Address"
            });
        });

        await test("mixes form-1 and form-2 keys in a single call", () =>
        {
            const dto = DtoFactory.create(mkUser(), ["name", { contact: "email" }]);
            assert.strictEqual(dto["name"], "Nivin");
            assert.strictEqual(dto["contact"], "n@example.com");
        });
    });


    await describe("form 3 (alias + transform)", async () =>
    {
        await test("invokes the transform and stores the return value", () =>
        {
            const dto = DtoFactory.create(mkUser(), [{ fullLine: (u: User): string => `${u.name} <${u.email}>` }]);
            assert.strictEqual(dto["fullLine"], "Nivin <n@example.com>");
        });

        await test("recursively serializes when transform returns a Serializable", () =>
        {
            const dto = DtoFactory.create(mkUser(), [{
                primaryAddress: (u: User): Address => u.address
            }]);
            // Nested $typename is contractual — nested Serializables are complete
            // serializations and do round-trip. Do not "clean this up".
            assert.deepStrictEqual(dto["primaryAddress"], {
                street: "711 Kennedy",
                city: "Ottawa",
                $typename: "Address"
            });
        });

        await test("recursively serializes when transform returns an array of Serializables", () =>
        {
            const user = mkUser();
            const dto = DtoFactory.create(user, [{
                addresses: (u: User): Array<Address> => [u.address, u.address]
            }]);
            // Nested $typename is contractual — nested Serializables are complete
            // serializations and do round-trip. Do not "clean this up".
            assert.deepStrictEqual(dto["addresses"], [
                { street: "711 Kennedy", city: "Ottawa", $typename: "Address" },
                { street: "711 Kennedy", city: "Ottawa", $typename: "Address" }
            ]);
        });

        await test("deep-clones a plain-object return (no live reference)", () =>
        {
            const user = mkUser();
            const shared = { rank: 1 };
            const dto = DtoFactory.create(user, [{ meta: (_: User): { rank: number; } => shared }]);
            assert.deepStrictEqual(dto["meta"], { rank: 1 });
            shared.rank = 999;
            assert.strictEqual((dto["meta"] as { rank: number; }).rank, 1);
        });

        await test("transform returning null becomes null in the DTO", () =>
        {
            const dto = DtoFactory.create(mkUser(), [{ maybe: (_): string | null => null }]);
            assert.strictEqual(dto["maybe"], null);
        });
    });


    await describe("function-value coercion (runtime backstop)", async () =>
    {
        await test("nulls a string key whose property is a method (PlainUser)", () =>
        {
            // TS-level rejection catches this statically; bypassing with `as any` to prove the runtime guard.
            const dto = DtoFactory.create(new PlainUser(), ["name", "computeScore" as any]);
            assert.strictEqual((dto as any)["computeScore"], null, "method key should be null, not absent");
            assert.strictEqual(dto["name"], "Plain Jane");
        });

        await test("nulls an aliased form-2 key whose source is a method", () =>
        {
            const dto = DtoFactory.create(new PlainUser(), [{ fn: "computeScore" as any }]);
            assert.strictEqual((dto as any)["fn"], null, "aliased method should be null, not absent");
        });

        await test("nulls a form-3 transform that returns a function", () =>
        {
            // Deliberately returning an unbound method to exercise the runtime guard.
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const dto = DtoFactory.create(mkUser(), [{ bad: ((u: User) => u.greet) as any }]);
            assert.strictEqual((dto as any)["bad"], null, "form-3 function return should be null at runtime");
        });

        await test("nulls function elements inside an array", () =>
        {
            const bad = [(): void => { /* noop */ }, "ok"];
            class Holder { public arr = bad; }
            const dto = DtoFactory.create(new Holder(), ["arr"]);
            assert.deepStrictEqual(dto["arr"], [null, "ok"]);
        });
    });


    await describe("projection contract (no top-level $typename)", async () =>
    {
        await test("does not stamp $typename on a DTO built from a Serializable", () =>
        {
            const dto = DtoFactory.create(mkUser(), ["name"]);
            assert.ok(!("$typename" in dto), "a projection must not claim a type name");
        });

        await test("does not stamp $typename on a DTO built from a plain class", () =>
        {
            const dto = DtoFactory.create(new PlainUser(), ["name"]);
            assert.ok(!("$typename" in dto));
        });

        await test("does not copy a source $typename that was not requested", () =>
        {
            const value = { $typename: "custom.Shape", width: 10, height: 20 };
            const dto = DtoFactory.create(value, ["width", "height"]);
            assert.ok(!("$typename" in dto));
            assert.deepStrictEqual(dto, { width: 10, height: 20 });
        });

        await test("a DTO is not deserializable — this is the point of dropping $typename", () =>
        {
            // With a $typename, Deserializer would find User registered and call
            // new User(partialData), silently building a half-constructed aggregate.
            const dto = DtoFactory.create(mkUser(), ["name"]);
            assert.throws(() => Deserializer.deserialize(dto));
        });

        await test("nested Serializable values keep their own $typename and still round-trip", () =>
        {
            const dto = DtoFactory.create(mkUser(), ["address"]);
            const revived = Deserializer.deserialize<Address>(dto["address"]);
            assert.ok(revived instanceof Address);
            assert.strictEqual(revived.street, "711 Kennedy");
        });
    });


    await describe("nested Serializable uses its own @serialize keys (the asymmetry)", async () =>
    {
        await test("top level uses the alias you wrote; nested level uses @serialize keys", () =>
        {
            const holder = new GeoHolder();
            const dto = DtoFactory.create(holder, [{ position: "geo" }]);

            // `position` is the alias; `lat`/`lng` are Geo's @serialize keys, not
            // its property names (`latitude`/`longitude`).
            assert.deepStrictEqual(dto["position"], {
                lat: 45.4,
                lng: -75.7,
                $typename: "Geo"
            });
        });
    });


    await describe("Date handling", async () =>
    {
        await test("a Date property becomes an ISO 8601 string", () =>
        {
            const dto = DtoFactory.create(new DateHolder(), ["when"]);
            assert.strictEqual(dto["when"], "2020-01-01T00:00:00.000Z");
            assert.strictEqual(typeof dto["when"], "string");
        });

        await test("a Date nested inside a plain object becomes a string", () =>
        {
            const dto = DtoFactory.create(new DateHolder(), ["meta"]);
            assert.deepStrictEqual(dto["meta"], { at: "2021-01-01T00:00:00.000Z" });
        });

        await test("a Date inside an array becomes a string", () =>
        {
            const dto = DtoFactory.create(new DateHolder(), ["stamps"]);
            assert.deepStrictEqual(dto["stamps"], ["2022-01-01T00:00:00.000Z"]);
        });
    });


    await describe("recursive array serialization", async () =>
    {
        await test("an array of arrays of Serializable values serializes each element", () =>
        {
            const dto = DtoFactory.create(new GridHolder(), ["grid"]);
            assert.deepStrictEqual(dto["grid"], [
                [{ street: "1 A St", city: "Alpha", $typename: "Address" }],
                [{ street: "2 B St", city: "Beta", $typename: "Address" }]
            ]);

            // Regression guard: JSON-cloning a Serializable would emit the private
            // backing fields, since getters are not own enumerable properties.
            assert.ok(!JSON.stringify(dto["grid"]).includes("_street"), "must not leak private fields");
        });
    });


    await describe("nullish coercion across all three forms", async () =>
    {
        class Sparse
        {
            public a: string = "x";
            public b?: string;
        }

        await test("form 1 coerces a missing value to null", () =>
        {
            const dto = DtoFactory.create(new Sparse(), ["a", "b"]);
            assert.strictEqual(dto["a"], "x");
            assert.strictEqual(dto["b"], null);
        });

        await test("form 2 coerces a missing source to null", () =>
        {
            const dto = DtoFactory.create(new Sparse(), [{ alias: "b" }]);
            assert.ok("alias" in dto, "the key must be present, not omitted");
            assert.strictEqual(dto["alias"], null);
        });

        await test("form 3 coerces an undefined return to null", () =>
        {
            const dto = DtoFactory.create(new Sparse(), [{ x: ((): undefined => undefined) as any }]);
            assert.ok("x" in dto, "the key must be present, not omitted");
            assert.strictEqual((dto as any)["x"], null);
        });
    });


    await describe("input validation", async () =>
    {
        await test("throws when value is null", () =>
        {
            assert.throws(() => DtoFactory.create(null as any, ["name"]));
        });

        await test("throws when keys is not an array", () =>
        {
            assert.throws(() => DtoFactory.create(mkUser(), "name" as any));
        });
    });


    // Compile-time behavior — inferred DTO shapes and the rejections that go with
    // them — is asserted in ./dto-factory.types.ts. That file is type-checked by
    // `tsc` but deliberately not executed, since none of it is runtime-verifiable.
});
