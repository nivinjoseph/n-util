import assert from "node:assert";
import { describe, test } from "node:test";
import { Serializable, serialize, Deserializer } from "../src/index.js";
import { given } from "@nivinjoseph/n-defensive";


type AddressSchema = {
    street: string;
    locality: string;
};
@serialize("Main")
class Address extends Serializable<AddressSchema>
{
    private readonly _street: string;
    private readonly _city: string;

    @serialize
    public get street(): string { return this._street; }

    @serialize("locality")
    public get city(): string { return this._city; }

    public get fullAddress(): string { return `${this._street}, ${this._city}`; }


    public constructor(data: AddressSchema)
    {
        super(data);

        const { street, locality: city } = data;

        given(street, "street").ensureHasValue().ensureIsString();
        this._street = street;

        given(city, "city").ensureHasValue().ensureIsString();
        this._city = city;
    }

    public static deserialize({ street, locality: city }: AddressSchema): Address
    {
        console.log("Calling custom address deserialize");

        return new Address({ street, locality: city });
    }
}

interface FullName
{
    firstName: string;
    lastName: string;
}

@serialize("Main")
class Dummy extends Serializable
{
    public constructor()
    {
        super({});
    }

    public foo(): void
    {
        console.log("I am foo");
    }
}

@serialize("Main")
class Employee extends Serializable
{
    private readonly _id: string;
    private readonly _name: FullName;
    private readonly _address: Address;
    private readonly _dummy: Dummy;

    @serialize
    public get id(): string { return this._id; }

    @serialize
    public get name(): FullName { return this._name; }

    @serialize
    public get address(): Address { return this._address; }

    @serialize
    public get dummy(): Dummy { return this._dummy; }


    public constructor(data: Pick<Employee, "id" | "name" | "address" | "dummy">)
    {
        super(data);

        const { id, name, address, dummy } = data;

        given(id, "id").ensureHasValue().ensureIsString();
        this._id = id;

        given(name, "name").ensureHasValue().ensureIsObject();
        this._name = name;

        given(address, "address").ensureHasValue().ensureIsObject().ensureIsType(Address);
        this._address = address;

        given(dummy, "dummy").ensureHasValue().ensureIsObject().ensureIsType(Dummy);
        this._dummy = dummy;
    }
}


@serialize("Dum")
class Dummy2 extends Dummy
{
    @serialize
    public get field1(): string { return "Dummy2 Field 1"; }

    @serialize("field2Key")
    public get field2(): string { return "Dummy2 Field 2"; }

    @serialize
    public get field3(): string { return "Dummy2 Field 3"; }

    public constructor()
    {
        super();
    }

    public asd(): void
    {
        console.log("I am foo");
    }
}

@serialize("TEST")
class SerializePrefix extends Serializable
{
    @serialize
    public get field1(): string { return "SerializePrefix Field 1"; }

    @serialize("newKeyForField2")
    public get field2(): string { return "SerializePrefix Field 2"; }
}

@serialize("Blah")
class SerializePrefixChildNoPrefix extends SerializePrefix
{
    @serialize
    public get field3(): string { return "SerializePrefixChildNoPrefix Field 3"; }
}

@serialize("PREFIX")
class SerializePrefixChildWithPrefix extends SerializePrefix
{
    @serialize
    public get field3(): string { return "SerializePrefixChildWithPrefix Field 3"; }
}


@serialize("TT")
class Dummy3 extends Dummy2
{
    @serialize
    public override get field1(): string { return "Dummy3 Field 1"; }

    @serialize("newKeyForField2")
    public override get field2(): string { return "Dummy3 Field 2"; }

    @serialize
    public get field4(): string { return "Dummy3 Field 4"; }
}


await describe.only("Serializable", async () =>
{
    await describe("serialize", async () =>
    {
        await test("basic", () =>
        {
            // console.log(typeof Employee);

            const testObj = new Employee({
                id: "1",
                name: {
                    firstName: "niv",
                    lastName: "jo"
                },
                address: new Address({
                    street: "911 Roger rd",
                    locality: "Waterloo"
                }),
                dummy: new Dummy()
            });

            const serializedTextObj = testObj.serialize();
            assert.deepStrictEqual(serializedTextObj, {
                "id": "1",
                "name": {
                    "firstName": "niv",
                    "lastName": "jo"
                },
                "address": {
                    "street": "911 Roger rd",
                    "locality": "Waterloo",
                    "$typename": "Main.Address"
                },
                "dummy": {
                    "$typename": "Main.Dummy"
                },
                "$typename": "Main.Employee"
            });

            const testObj2 = new Employee({
                id: "1",
                name: {
                    firstName: "niv",
                    lastName: "jo"
                },
                address: new Address({
                    street: "911 Roger rd",
                    locality: "Waterloo"
                }),
                dummy: new Dummy()
            });

            const serializedTestObj2 = testObj2.serialize();

            assert.deepStrictEqual(serializedTestObj2, serializedTextObj);

            const deserialized = Deserializer.deserialize<Employee>(serializedTextObj);
            console.log(deserialized);
            assert.ok(deserialized instanceof Employee);

            const deserialized2 = Deserializer.deserialize<Employee>(serializedTestObj2);

            assert.ok(deserialized2 instanceof Employee);

            assert.deepStrictEqual(deserialized2, deserialized);


            const dummy = new Dummy().serialize();
            console.log(dummy);


            const dummy2 = new Dummy2().serialize();
            console.log(dummy2);

            const dummy3 = new Dummy3().serialize();
            console.log(dummy3);

        });

        await test("inheritance", () =>
        {
            const dummy = new Dummy();
            const serializedDummy = dummy.serialize();
            console.log(serializedDummy);
            assert.deepStrictEqual(serializedDummy, {
                "$typename": "Main.Dummy"
            });
            const deserializedDummy = Deserializer.deserialize<Dummy>(serializedDummy);
            assert.ok(deserializedDummy instanceof Dummy);

            const dummy2 = new Dummy2();
            const serializedDummy2 = dummy2.serialize();

            assert.deepStrictEqual(serializedDummy2, {
                "field1": "Dummy2 Field 1",
                "field2Key": "Dummy2 Field 2",
                "field3": "Dummy2 Field 3",
                "$typename": "Dum.Dummy2"
            });
            const deserializedDummy2 = Deserializer.deserialize<Dummy2>(serializedDummy2);
            assert.ok(deserializedDummy2 instanceof Dummy2);


            const dummy3 = new Dummy3();
            const serializedDummy3 = dummy3.serialize();
            console.log(serializedDummy3);
            assert.deepStrictEqual(serializedDummy3, {
                "field1": "Dummy3 Field 1",
                "newKeyForField2": "Dummy3 Field 2",
                "field3": "Dummy2 Field 3",
                "field4": "Dummy3 Field 4",
                "$typename": "TT.Dummy3"
            });

            const deserializedDummy3 = Deserializer.deserialize<Dummy3>(serializedDummy3);
            assert.ok(deserializedDummy3 instanceof Dummy3);
        });
    });

    await test("with prefix", () =>
    {
        const newName = new SerializePrefix({});
        const newNameSerialized = newName.serialize();

        assert.deepStrictEqual(newNameSerialized, {
            "field1": "SerializePrefix Field 1",
            "newKeyForField2": "SerializePrefix Field 2",
            "$typename": "TEST.SerializePrefix"
        });

        const deserialized = Deserializer.deserialize(newNameSerialized);

        assert.ok(deserialized instanceof SerializePrefix);
    });

    await test("prefixed child", () =>
    {
        const newName = new SerializePrefixChildNoPrefix({});
        const newNameSerialized = newName.serialize();

        assert.deepStrictEqual(newNameSerialized, {
            "field1": "SerializePrefix Field 1",
            "newKeyForField2": "SerializePrefix Field 2",
            "field3": "SerializePrefixChildNoPrefix Field 3",
            "$typename": "Blah.SerializePrefixChildNoPrefix"
        });

        const deserialized = Deserializer.deserialize(newNameSerialized);

        assert.ok(deserialized instanceof SerializePrefixChildNoPrefix);
    });

    await test("prefixed child with prefix", () =>
    {
        const newName = new SerializePrefixChildWithPrefix({});
        const newNameSerialized = newName.serialize();

        assert.deepStrictEqual(newNameSerialized, {
            "field1": "SerializePrefix Field 1",
            "newKeyForField2": "SerializePrefix Field 2",
            "field3": "SerializePrefixChildWithPrefix Field 3",
            "$typename": "PREFIX.SerializePrefixChildWithPrefix"
        });

        const deserialized = Deserializer.deserialize(newNameSerialized);

        assert.ok(deserialized instanceof SerializePrefixChildWithPrefix);
    });
});