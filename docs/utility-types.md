# Utility Types

This module provides a collection of TypeScript utility types for common type transformations and class definitions.

## Features

- Type-safe property picking and partialization
- Schema type definitions
- Class definition and hierarchy types
- Readonly property handling

## Usage

```typescript
import { PartialPick, Schema, PartialSchema, ClassDefinition, ClassHierarchy } from "n-util";

// Example interfaces
interface User {
    id: string;
    name: string;
    age: number;
    email: string;
}

// Example class
class Person {
    constructor(public name: string) {}
}

// Using utility types
type UserPartial = PartialPick<User, "name" | "age">;
type UserSchema = Schema<User, "id" | "name">;
type UserPartialSchema = PartialSchema<User, "id" | "name">;
type PersonClass = ClassDefinition<Person>;
type PersonHierarchy = ClassHierarchy<Person>;
```

## API Reference

### PartialPick
```typescript
type PartialPick<T, K extends keyof T>
```
Creates a type with a subset of properties from T, where the specified keys are made optional.

- Type Parameters:
  - `T`: The base type
  - `K`: Union of keys from T to make optional
- Returns: A type with the specified properties from T made optional

Example:
```typescript
interface User {
    id: string;
    name: string;
    age: number;
}

type UserPartial = PartialPick<User, "name" | "age">;
// Equivalent to:
// {
//     name?: string;
//     age?: number;
// }
```

### Schema
```typescript
type Schema<T, K extends keyof T>
```
Creates a type with a subset of properties from T, removing readonly modifiers.

- Type Parameters:
  - `T`: The base type
  - `K`: Union of keys from T to include
- Returns: A type with the specified properties from T, without readonly modifiers

Example:
```typescript
interface User {
    readonly id: string;
    readonly name: string;
    age: number;
}

type UserSchema = Schema<User, "id" | "name">;
// Equivalent to:
// {
//     id: string;
//     name: string;
// }
```

### PartialSchema
```typescript
type PartialSchema<T, K extends keyof T>
```
Creates a type with a subset of properties from T, removing readonly modifiers and making them optional.

- Type Parameters:
  - `T`: The base type
  - `K`: Union of keys from T to include
- Returns: A type with the specified properties from T, without readonly modifiers and made optional

Example:
```typescript
interface User {
    readonly id: string;
    readonly name: string;
    age: number;
}

type UserPartialSchema = PartialSchema<User, "id" | "name">;
// Equivalent to:
// {
//     id?: string;
//     name?: string;
// }
```

### ClassDefinition
```typescript
type ClassDefinition<T extends {}>
```
Represents a class constructor type for a given class type T.

- Type Parameters:
  - `T`: The class type
- Returns: A constructor type that can create instances of T

Example:
```typescript
class Person {
    constructor(public name: string) {}
}

type PersonClass = ClassDefinition<Person>;
// Equivalent to:
// new (...args: any[]) => Person
```

### ClassHierarchy
```typescript
type ClassHierarchy<T extends {}>
```
Represents a class type with its prototype set to T.

- Type Parameters:
  - `T`: The class type
- Returns: A function type with its prototype set to T

Example:
```typescript
class Person {
    constructor(public name: string) {}
}

type PersonHierarchy = ClassHierarchy<Person>;
// Equivalent to:
// Function & { prototype: Person; }
```

## Best Practices

1. Use `PartialPick` when you need to make specific properties optional
2. Use `Schema` when you need to work with mutable versions of readonly properties
3. Use `PartialSchema` when you need both optional and mutable properties
4. Use `ClassDefinition` for type-safe class constructors
5. Use `ClassHierarchy` when working with class inheritance and prototypes

## Examples

### Creating Partial Types
```typescript
interface User {
    id: string;
    name: string;
    age: number;
    email: string;
}

// Make name and age optional
type UserUpdate = PartialPick<User, "name" | "age">;
const update: UserUpdate = {
    name: "John" // age is optional
};

// Make all properties optional and mutable
type UserCreate = PartialSchema<User, keyof User>;
const newUser: UserCreate = {
    name: "John",
    age: 30
    // id and email are optional
};
```

### Working with Classes
```typescript
class Animal {
    constructor(public name: string) {}
}

class Dog extends Animal {
    constructor(name: string, public breed: string) {
        super(name);
    }
}

// Type-safe class constructor
type AnimalClass = ClassDefinition<Animal>;
const createAnimal: AnimalClass = Animal;

// Working with class hierarchy
type AnimalHierarchy = ClassHierarchy<Animal>;
function isAnimal(obj: any): obj is AnimalHierarchy {
    return obj.prototype instanceof Animal;
}
``` 