import assert from "node:assert";
import { describe, test } from "node:test";
import "@nivinjoseph/n-ext";
import { DtoFactory, Serializable, serialize } from "../src/index.js";


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
            assert.deepStrictEqual(dto["address"], {
                street: "711 Kennedy",
                city: "Ottawa",
                $typename: "Address"
            });
        });

        await test("recursively serializes an array of Serializable values", () =>
        {
            const dto = DtoFactory.create(new PlainUser(), ["friends"]);
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

        await test("coerces undefined / missing values to null", () =>
        {
            class Sparse { public a: string = "x"; public b?: string; }
            const dto = DtoFactory.create(new Sparse(), ["a", "b"]);
            assert.strictEqual(dto["a"], "x");
            assert.strictEqual(dto["b"], null);
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


    await describe("function-value rejection (runtime backstop)", async () =>
    {
        await test("skips a string key whose property is a method (PlainUser)", () =>
        {
            // TS-level rejection catches this statically; bypassing with `as any` to prove the runtime guard.
            const dto = DtoFactory.create(new PlainUser(), ["name", "computeScore" as any]);
            assert.ok(!("computeScore" in dto), "method key should be absent from DTO");
            assert.strictEqual(dto["name"], "Plain Jane");
        });

        await test("skips an aliased form-2 key whose source is a method", () =>
        {
            const dto = DtoFactory.create(new PlainUser(), [{ fn: "computeScore" as any }]);
            assert.ok(!("fn" in dto), "aliased method should be absent from DTO");
        });

        await test("nullifies a form-3 transform that returns a function", () =>
        {
            // Deliberately returning an unbound method to exercise the runtime guard.
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const dto = DtoFactory.create(mkUser(), [{ bad: ((u: User) => u.greet) as any }]);
            assert.ok(!("bad" in dto), "form-3 function return should be skipped at runtime");
        });

        await test("nullifies function elements inside an array", () =>
        {
            const bad = [(): void => { /* noop */ }, "ok"];
            class Holder { public arr = bad; }
            const dto = DtoFactory.create(new Holder(), ["arr"]);
            assert.deepStrictEqual(dto["arr"], [null, "ok"]);
        });
    });


    await describe("$typename", async () =>
    {
        await test("uses existing $typename on the value when present", () =>
        {
            const value = { $typename: "custom.Shape", width: 10, height: 20 };
            const dto = DtoFactory.create(value, ["width", "height"]);
            assert.strictEqual(dto["$typename"], "custom.Shape");
        });

        await test("falls back to getTypeName() for plain classes without $typename", () =>
        {
            const dto = DtoFactory.create(new PlainUser(), ["name"]);
            assert.strictEqual(dto["$typename"], "PlainUser");
        });

        await test("uses Serializable's class name for decorated classes", () =>
        {
            const dto = DtoFactory.create(mkUser(), ["name"]);
            assert.strictEqual(dto["$typename"], "User");
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


    // ------------------------------------------------------------------------
    // Compile-time rejections (not runtime-verifiable; documented for intent)
    //
    // Form 1 / form 2: method-name keys rejected via NonMethodKey<T>:
    //
    //   DtoFactory.create(user, ["greet"]);
    //   // ^ '"greet"' is not assignable to 'DtoKey<User>'.
    //
    //   DtoFactory.create(user, [{ g: "greet" }]);
    //   // ^ '"greet"' is not assignable to 'NonMethodKey<User> | DtoTransform<User>'.
    //
    // Form 3: transform returns constrained to DtoReturn (JSON-ish + Date +
    // Serializable). Any return whose structural type carries a function
    // member fails to unify:
    //
    //   DtoFactory.create(user, [{ f: (u) => u.greet }]);
    //   // ^ '() => string' is not assignable to type 'DtoReturn'.
    //
    //   DtoFactory.create(user, [{ f: (u) => ({ cb: () => u.name }) }]);
    //   // ^ Property 'cb' is incompatible with index signature.
    //
    //   DtoFactory.create(user, [{ f: () => new Map() }]);
    //   // ^ Map<K,V> / Set<T> / Promise<T> rejected — missing string index.
    //
    // The "function-value rejection (runtime backstop)" suite above covers
    // the `as any` escape hatch and JS-consumer case.
    // ------------------------------------------------------------------------
});
