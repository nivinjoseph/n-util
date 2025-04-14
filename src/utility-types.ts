/**
 * Module containing utility types for TypeScript type transformations and class definitions.
 * @module
 */

/**
 * From T, pick a set of properties as optional whose keys are in the union K
 * 
 * @typeParam T - The base type
 * @typeParam K - Union of keys from T to make optional
 * @returns A type with the specified properties from T made optional
 * 
 * @example
 * ```typescript
 * interface User {
 *     id: string;
 *     name: string;
 *     age: number;
 * }
 * 
 * type UserPartial = PartialPick<User, "name" | "age">;
 * // Equivalent to:
 * // {
 * //     name?: string;
 * //     age?: number;
 * // }
 * ```
 */
export type PartialPick<T, K extends keyof T> = {
    [P in K]?: T[P];
};

/**
 * From T, pick a set of properties whose keys are in the union K, removing readonly modifiers
 * 
 * @typeParam T - The base type
 * @typeParam K - Union of keys from T to include
 * @returns A type with the specified properties from T, without readonly modifiers
 * 
 * @example
 * ```typescript
 * interface User {
 *     readonly id: string;
 *     readonly name: string;
 *     age: number;
 * }
 * 
 * type UserSchema = Schema<User, "id" | "name">;
 * // Equivalent to:
 * // {
 * //     id: string;
 * //     name: string;
 * // }
 * ```
 */
export type Schema<T, K extends keyof T> = {
    -readonly [P in K]: T[P];
};

/**
 * From T, pick a set of properties as optional whose keys are in the union K, removing readonly modifiers
 * 
 * @typeParam T - The base type
 * @typeParam K - Union of keys from T to include
 * @returns A type with the specified properties from T, without readonly modifiers and made optional
 * 
 * @example
 * ```typescript
 * interface User {
 *     readonly id: string;
 *     readonly name: string;
 *     age: number;
 * }
 * 
 * type UserPartialSchema = PartialSchema<User, "id" | "name">;
 * // Equivalent to:
 * // {
 * //     id?: string;
 * //     name?: string;
 * // }
 * ```
 */
export type PartialSchema<T, K extends keyof T> = {
    -readonly [P in K]?: T[P];
};

/**
 * Represents a class constructor type for a given class type T
 * 
 * @typeParam T - The class type
 * @returns A constructor type that can create instances of T
 * 
 * @example
 * ```typescript
 * class Person {
 *     constructor(public name: string) {}
 * }
 * 
 * type PersonClass = ClassDefinition<Person>;
 * // Equivalent to:
 * // new (...args: any[]) => Person
 * ```
 */
export type ClassDefinition<T extends {}> = new (...args: Array<any>) => T;

/**
 * Represents a class type with its prototype set to T
 * 
 * @typeParam T - The class type
 * @returns A function type with its prototype set to T
 * 
 * @example
 * ```typescript
 * class Person {
 *     constructor(public name: string) {}
 * }
 * 
 * type PersonHierarchy = ClassHierarchy<Person>;
 * // Equivalent to:
 * // Function & { prototype: Person; }
 * ```
 */
export type ClassHierarchy<T extends {}> = Function & { prototype: T; };