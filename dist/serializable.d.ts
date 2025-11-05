import { ClassDefinition } from "./utility-types.js";
export declare abstract class Serializable<TData extends object = Record<string, any>> {
    constructor(data: TData);
    serialize(): TData;
}
export declare class Deserializer {
    private static readonly _typeCache;
    /**
     * @static
     */
    private constructor();
    static hasType(typeName: string): boolean;
    static registerType(type: SerializableClass<any>, serializeInfo?: SerializableClassInfo): void;
    static deserialize<T>(serialized: object): T;
    private static _getType;
}
export declare function serialize<Class extends Serializable, T>(target: SerializableClassGetter<Class, T>, context: ClassGetterDecoratorContext<Class, T>): void;
export declare function serialize<Class extends Serializable>(target: SerializableClass<Class>, context: ClassDecoratorContext<SerializableClass<Class>>): void;
export declare function serialize<Class extends Serializable, T, K extends string>(key: K extends "" ? never : K): UniversalSerializeDecorator<Class, T>;
export type SerializableClass<This extends Serializable> = ClassDefinition<This>;
export type SerializableClassGetter<This extends Serializable, T> = (this: This) => T;
export type SerializeClassDecorator<Class extends Serializable> = (target: SerializableClass<Class>, context: ClassDecoratorContext<SerializableClass<Class>>) => void;
export type SerializeGetterDecorator<Class extends Serializable, T> = (target: SerializableClassGetter<Class, T>, context: ClassGetterDecoratorContext<Class, T>) => void;
interface SerializableClassInfo {
    className: string;
    prefix?: string;
    typeName: string;
}
type UniversalSerializeDecorator<Class extends Serializable, T> = (target: SerializableClass<Class> | SerializableClassGetter<Class, T>, context: ClassDecoratorContext<SerializableClass<Class>> | ClassGetterDecoratorContext<Class, T>) => void;
export {};
//# sourceMappingURL=serializable.d.ts.map