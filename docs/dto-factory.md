# DTO Factory

The `DtoFactory` class provides a utility for creating Data Transfer Objects (DTOs) from complex objects, with support for both plain objects and `Serializable` instances.

## Features

- Automatic DTO creation from complex objects
- Support for both plain objects and `Serializable` instances
- Flexible key mapping with aliases
- Type safety with TypeScript generics
- Automatic null handling
- Type name preservation

## Usage

### Basic Usage with Proper Class Structure

```typescript
import { DtoFactory } from "n-util";

class User {
    private _id: string;
    private _name: string;
    private _email: string;
    private _age: number;

    get id(): string { return this._id; }
    get name(): string { return this._name; }
    get email(): string { return this._email; }
    get age(): number { return this._age; }
    
    constructor(id: string, name: string, email: string, age: number) {
        this._id = id;
        this._name = name;
        this._email = email;
        this._age = age;
    }
}

// Create an instance properly
const user = new User("123", "John Doe", "john@example.com", 30);

// Create a DTO with selected properties
const userDto = DtoFactory.create(user, ["id", "name", "email"]);
// Result: { id: "123", name: "John Doe", email: "john@example.com" }
```

### Using Aliases with Proper Class Structure

```typescript
// Define a proper class with constructor and properties
class Product {
    private _id: string;
    private _name: string;
    private _price: number;
    private _category: string;

    get id(): string { return this._id; }
    get name(): string { return this._name; }
    get price(): number { return this._price; }
    get category(): string { return this._category; }

    constructor(id: string, name: string, price: number, category: string) {
        this._id = id;
        this._name = name;
        this._price = price;
        this._category = category;
    }
}

// Create an instance properly
const product = new Product("P001", "Laptop", 999.99, "Electronics");

// Create a DTO with property aliases
const productDto = DtoFactory.create(product, [
    "id",
    { productName: "name" },
    { formattedPrice: (p) => `$${p.price.toFixed(2)}` },
    { categoryId: (p) => p.category.toLowerCase() }
]);
// Result: { 
//   id: "P001", 
//   productName: "Laptop", 
//   formattedPrice: "$999.99",
//   categoryId: "electronics"
// }
```

### With Serializable Objects and Proper Class Structure

```typescript
import { Serializable, serialize } from "n-util";

// Define a proper Serializable class
class Order extends Serializable {
    private _id: string;
    private _customer: User;
    private _items: Product[];
    private _total: number;

    get id(): string { return this._id; }
    get customer(): User { return this._customer; }
    get items(): Product[] { return this._items; }
    get total(): number { return this._total; }

    constructor(id: string, customer: User, items: Product[]) {
        super();
        this._id = id;
        this._customer = customer;
        this._items = items;
        this._total = this._calculateTotal();
    }

    private _calculateTotal(): number {
        return this._items.reduce((sum, item) => sum + item.price, 0);
    }

    // Override serialize method if needed
    public override serialize(): Record<string, any> {
        return {
            id: this._id,
            customer: this._customer.serialize(),
            items: this._items.map(item => item.serialize()),
            total: this._total
        };
    }
}

const user = new User("123", "John Doe", "john@example.com", 30);
const product = new Product("P001", "Laptop", 999.99, "Electronics");
const order = new Order("O001", user, [product]);

// Create a DTO from a Serializable instance
const orderDto = DtoFactory.create(order, [
    "id",
    { customerName: (o) => o.customer.name },
    { itemCount: (o) => o.items.length },
    { formattedTotal: (o) => `$${o.total.toFixed(2)}` }
]);
// Result: { 
//   id: "O001", 
//   customerName: "John Doe",
//   itemCount: 1,
//   formattedTotal: "$999.99"
// }
```

## API Reference

### DtoFactory Class
```typescript
class DtoFactory
```
A utility class for creating DTOs from complex objects.

#### Methods

##### create
```typescript
static create<T extends object, TDto extends {} = {}>(
    value: T,
    keys: Array<keyof T | { [key: string]: keyof T | ((val: T) => any); }>
): TDto
```
Creates a DTO from the given object using the specified keys.

- Parameters:
  - `value`: The source object to create the DTO from
  - `keys`: Array of property keys or key mappings to include in the DTO
- Returns: A new DTO object containing the specified properties
- Throws: Error if value is null or undefined, or if keys is not an array

## Best Practices

1. **Class Structure**:
   - Use proper constructors with parameter validation
   - Use private fields with getters
   - Implement proper encapsulation
   - Use proper access modifiers
   - Follow SOLID principles

2. **Type Safety**:
   - Use TypeScript generics
   - Define proper interfaces
   - Use proper type guards
   - Validate inputs
   - Handle edge cases

3. **Property Selection**:
   - Only include necessary properties
   - Use aliases for better naming
   - Use transform functions for complex values
   - Handle null values properly
   - Consider performance implications

4. **Serializable Integration**:
   - Extend Serializable properly
   - Override serialize when needed
   - Handle nested objects
   - Preserve type information
   - Consider circular references

## Examples

### Complex Object Transformation
```typescript
// Define a proper class for complex data
class Employee {
    private _id: string;
    private _personalInfo: {
        firstName: string;
        lastName: string;
        birthDate: Date;
    };
    private _department: string;
    private _salary: number;

    constructor(
        id: string,
        firstName: string,
        lastName: string,
        birthDate: Date,
        department: string,
        salary: number
    ) {
        this._id = id;
        this._personalInfo = { firstName, lastName, birthDate };
        this._department = department;
        this._salary = salary;
    }

    get id(): string { return this._id; }
    get personalInfo(): { firstName: string; lastName: string; birthDate: Date } { 
        return this._personalInfo; 
    }
    get department(): string { return this._department; }
    get salary(): number { return this._salary; }
}

// Create an instance properly
const employee = new Employee(
    "E001",
    "John",
    "Doe",
    new Date("1990-01-01"),
    "Engineering",
    75000
);

// Create a DTO with complex transformations
const employeeDto = DtoFactory.create(employee, [
    "id",
    { 
        fullName: (e) => `${e.personalInfo.firstName} ${e.personalInfo.lastName}`,
        age: (e) => {
            const today = new Date();
            const birthDate = e.personalInfo.birthDate;
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }
    },
    { departmentCode: (e) => e.department.substring(0, 3).toUpperCase() },
    { formattedSalary: (e) => `$${e.salary.toLocaleString()}` }
]);
// Result: {
//   id: "E001",
//   fullName: "John Doe",
//   age: 34,
//   departmentCode: "ENG",
//   formattedSalary: "$75,000"
// }
``` 