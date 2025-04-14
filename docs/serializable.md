# Serializable

The `Serializable` module provides a robust system for serializing and deserializing TypeScript classes with metadata support. It includes decorators for marking properties and classes as serializable, and utilities for handling the serialization/deserialization process.

## Features

- Class serialization and deserialization
- Property-level serialization control
- Metadata-based serialization configuration
- Type-safe serialization/deserialization
- Custom serialization keys
- Nested object handling
- Array serialization support

## Usage

```typescript
import { Serializable, serialize, Deserializer } from "n-util";

interface UserData {
    name: string;
    age: number;
    email: string;
}

@serialize("user")
class User extends Serializable<UserData>
{
    private readonly _name: string;
    private readonly _age: number;
    private readonly _email: string;

    @serialize
    public get name(): string { return this._name; }
    
    @serialize
    public get age(): number { return this._age; }
    
    @serialize
    public get email(): string { return this._email; }

    public constructor(data: UserData)
    {
        super(data);

        const { name, age, email } = data;

        given(name, "name").ensureHasValue().ensureIsString();
        this._name = name;

        given(age, "age").ensureHasValue().ensureIsNumber();
        this._age = age;

        given(email, "email").ensureHasValue().ensureIsString();
        this._email = email;
    }
}

// Serialize an object
const user = new User({ 
    name: "John", 
    age: 30, 
    email: "john@example.com" 
});
const serialized = user.serialize();
// { 
//   $typename: "user.User", 
//   name: "John", 
//   age: 30, 
//   email: "john@example.com" 
// }

// Deserialize an object
const deserialized = Deserializer.deserialize<User>(serialized);
```

## API Reference

### Serializable Class
```typescript
abstract class Serializable<TData extends object = {}>
```
Base class for serializable objects.

- Type Parameters:
  - `TData`: The type of data object used for serialization

#### Methods

##### serialize
```typescript
serialize(): TData
```
Serializes the object to a plain data object.

- Returns: The serialized data object
- Throws: Error if serialization fails

### Deserializer Class
```typescript
class Deserializer
```
Handles deserialization of serialized objects.

#### Static Methods

##### hasType
```typescript
static hasType(typeName: string): boolean
```
Checks if a type is registered for deserialization.

- Parameters:
  - `typeName`: The type name to check
- Returns: `true` if the type is registered, `false` otherwise

##### registerType
```typescript
static registerType(type: SerializableClass<any>, serializeInfo?: SerializableClassInfo): void
```
Registers a type for deserialization.

- Parameters:
  - `type`: The class to register
  - `serializeInfo`: Optional serialization information
- Throws: Error if the type is invalid

##### deserialize
```typescript
static deserialize<T>(serialized: object): T
```
Deserializes a serialized object.

- Type Parameters:
  - `T`: The expected type of the deserialized object
- Parameters:
  - `serialized`: The serialized object to deserialize
- Returns: The deserialized object
- Throws: Error if deserialization fails

### Decorators

#### serialize
```typescript
function serialize<Class extends Serializable, T>(
    target: SerializableClassGetter<Class, T>,
    context: ClassGetterDecoratorContext<Class, T>
): void;
function serialize<Class extends Serializable, T, K extends string>(
    key: K extends "" ? never : K
): UniversalSerializeDecorator<Class, T>;
```
Decorator for marking properties and classes as serializable.

- When used on a class:
  - The key parameter is REQUIRED and must be a non-empty string
  - The key is used to uniquely identify the class during deserialization
  - Format: `@serialize("namespace")`
  - Example: `@serialize("user") class User extends Serializable`

- When used on a property:
  - The key parameter is OPTIONAL
  - If not provided, the property name will be used as the serialization key
  - Format: `@serialize()` or `@serialize("customKey")`
  - Example: `@serialize() public get name()` or `@serialize("fullName") public get name()`

## Best Practices

1. Always extend `Serializable` for serializable classes
2. Use the `@serialize` decorator with a required key for classes
3. Use the `@serialize` decorator with an optional key for properties
4. Register types before deserialization
5. Use TypeScript interfaces for data types
6. Handle nested serializable objects appropriately
7. Use meaningful serialization keys
8. Validate data before serialization/deserialization

## Examples

### Basic Serialization
```typescript
interface PersonData {
    firstName: string;
    lastName: string;
    age: number;
}

@serialize("person")
class Person extends Serializable<PersonData>
{
    private readonly _firstName: string;
    private readonly _lastName: string;
    private readonly _age: number;

    @serialize
    public get firstName(): string { return this._firstName; }

    @serialize
    public get lastName(): string { return this._lastName; }

    @serialize
    public get age(): number { return this._age; }

    public get fullName(): string { return `${this._firstName} ${this._lastName}`; }

    public constructor(data: PersonData)
    {
        super(data);

        const { firstName, lastName, age } = data;

        given(firstName, "firstName").ensureHasValue().ensureIsString();
        this._firstName = firstName;

        given(lastName, "lastName").ensureHasValue().ensureIsString();
        this._lastName = lastName;

        given(age, "age").ensureHasValue().ensureIsNumber();
        this._age = age;
    }
}

const person = new Person({ 
    firstName: "John", 
    lastName: "Doe", 
    age: 30 
});
const serialized = person.serialize();
// { 
//   $typename: "person.Person", 
//   firstName: "John", 
//   lastName: "Doe", 
//   age: 30 
// }
```

### Nested Objects
```typescript
interface AddressData {
    street: string;
    locality: string;
}

@serialize("address")
class Address extends Serializable<AddressData>
{
    private readonly _street: string;
    private readonly _city: string;

    @serialize
    public get street(): string { return this._street; }

    @serialize("locality")
    public get city(): string { return this._city; }

    public get fullAddress(): string { return `${this._street}, ${this._city}`; }

    public constructor(data: AddressData)
    {
        super(data);

        const { street, locality: city } = data;

        given(street, "street").ensureHasValue().ensureIsString();
        this._street = street;

        given(city, "city").ensureHasValue().ensureIsString();
        this._city = city;
    }
}

interface UserData {
    id: string;
    name: string;
    address: AddressData;
}

@serialize("user")
class User extends Serializable<UserData>
{
    private readonly _id: string;
    private readonly _name: string;
    private readonly _address: Address;

    @serialize
    public get id(): string { return this._id; }

    @serialize
    public get name(): string { return this._name; }

    @serialize
    public get address(): Address { return this._address; }

    public constructor(data: UserData)
    {
        super(data);

        const { id, name, address } = data;

        given(id, "id").ensureHasValue().ensureIsString();
        this._id = id;

        given(name, "name").ensureHasValue().ensureIsString();
        this._name = name;

        given(address, "address").ensureHasValue().ensureIsObject();
        this._address = new Address(address);
    }
}

const user = new User({
    id: "123",
    name: "John",
    address: { street: "123 Main St", locality: "New York" }
});

const serialized = user.serialize();
// {
//   $typename: "user.User",
//   id: "123",
//   name: "John",
//   address: {
//     $typename: "address.Address",
//     street: "123 Main St",
//     locality: "New York"
//   }
// }
```

### Array Serialization
```typescript
interface ProductData {
    id: string;
    name: string;
    price: number;
}

@serialize("product")
class Product extends Serializable<ProductData>
{
    private readonly _id: string;
    private readonly _name: string;
    private readonly _price: number;

    @serialize
    public get id(): string { return this._id; }

    @serialize
    public get name(): string { return this._name; }

    @serialize
    public get price(): number { return this._price; }

    public constructor(data: ProductData)
    {
        super(data);

        const { id, name, price } = data;

        given(id, "id").ensureHasValue().ensureIsString();
        this._id = id;

        given(name, "name").ensureHasValue().ensureIsString();
        this._name = name;

        given(price, "price").ensureHasValue().ensureIsNumber();
        this._price = price;
    }
}

interface OrderData {
    id: string;
    products: ProductData[];
}

@serialize("order")
class Order extends Serializable<OrderData>
{
    private readonly _id: string;
    private readonly _products: Product[];

    @serialize
    public get id(): string { return this._id; }

    @serialize
    public get products(): Product[] { return this._products; }

    public constructor(data: OrderData)
    {
        super(data);

        const { id, products } = data;

        given(id, "id").ensureHasValue().ensureIsString();
        this._id = id;

        given(products, "products").ensureHasValue().ensureIsArray();
        this._products = products.map(p => new Product(p));
    }
}

const order = new Order({
    id: "ORD-123",
    products: [
        { id: "P1", name: "Item 1", price: 10 },
        { id: "P2", name: "Item 2", price: 20 }
    ]
});

const serialized = order.serialize();
// {
//   $typename: "order.Order",
//   id: "ORD-123",
//   products: [
//     { 
//       $typename: "product.Product", 
//       id: "P1", 
//       name: "Item 1", 
//       price: 10 
//     },
//     { 
//       $typename: "product.Product", 
//       id: "P2", 
//       name: "Item 2", 
//       price: 20 
//     }
//   ]
// }
```

## Notes

- The serialization system uses metadata to store configuration
- All serialized objects include a `$typename` property for deserialization
- Nested objects are automatically handled if they are also serializable
- Arrays of serializable objects are properly serialized and deserialized
- The `@serialize` decorator's key parameter is optional - if not provided, the field name will be used as the serialization key
- Constructors are required to properly initialize the Serializable base class with the data object
- Use proper TypeScript interfaces for data structures