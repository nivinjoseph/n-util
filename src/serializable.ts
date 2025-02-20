import { ApplicationException } from "@nivinjoseph/n-exception";
import { given } from "@nivinjoseph/n-defensive";
import { ClassDefinition } from "./utility-types.js";

//@ts-expect-error polyfill to use metadata object
Symbol.metadata ??= Symbol("Symbol.metadata");

export abstract class Serializable<TData extends object = {}>
{
    public constructor(data: TData)
    {
        given(data, "data").ensureHasValue().ensureIsObject();
    }


    public serialize(): TData
    {
        const classInfo = Utilities.fetchSerializableClassInfoForObject(this);

        const fields = Utilities.fetchSerializableFieldsForObject(this);
        const serialized = fields.reduce<Record<string, any>>((acc, field) =>
        {
            const val = field.target.call(this);
            const serializationKey = field.key ?? field.name;

            if (val == null)
            {
                acc[serializationKey] = null;
                return acc;
            }

            if (typeof val === "object")
            {
                if (Array.isArray(val))
                    acc[serializationKey] = val.map((v) =>
                    {
                        if (v == null)
                            return null;

                        if (typeof v === "object")
                        {
                            if (v instanceof Serializable)
                                return v.serialize() as unknown;
                            else
                                return JSON.parse(JSON.stringify(v)) as unknown;
                        }

                        return v as unknown;
                    });
                else
                    acc[serializationKey] = val instanceof Serializable
                        ? val.serialize() : JSON.parse(JSON.stringify(val));
            }
            else
            {
                acc[serializationKey] = val;
            }

            return acc;
        }, {});

        // add prefix here...
        serialized.$typename = classInfo.typeName;

        return serialized as TData;
    }
}



export class Deserializer
{
    private static readonly _typeCache = new Map<string, object>();

    /**
     * @static
     */
    private constructor() { }


    public static hasType(typeName: string): boolean
    {
        // this is postel's law compliant
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (typeName == null || typeof typeName !== "string" || typeName.isEmptyOrWhiteSpace()
            || !this._typeCache.has(typeName.trim()))
            return false;

        return true;
    }

    public static registerType(type: SerializableClass<any>, serializeInfo?: SerializableClassInfo): void
    {
        given(type, "type").ensureHasValue()
            .ensure(t => t.prototype instanceof Serializable, "type does not extend Serializable");
        given(serializeInfo, "serializeInfo").ensureIsObject();

        serializeInfo ??= Utilities.fetchSerializableInfoForClass(type);

        const typeName = serializeInfo.typeName;
        if (!this._typeCache.has(typeName))
            this._typeCache.set(typeName, type);
    }

    public static deserialize<T>(serialized: object): T
    {
        given(serialized, "serialized").ensureHasValue().ensureIsObject()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .ensure(t => (<any>t).$typename && typeof (<any>t).$typename === "string"
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                && !(<any>t).$typename.isEmptyOrWhiteSpace(), "$typename property is missing on object");

        const typeName = (<any>serialized).$typename;
        let type = Deserializer._getType(typeName) as any;
        if (type == null)
            throw new ApplicationException(`Cannot deserialize unregistered type '${typeName}'.`);

        if (typeof type === "object")
            type = type.constructor;

        if (type.deserialize && typeof type.deserialize === "function")
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return type.deserialize(serialized) as T;

        serialized = Object.keys(serialized).reduce<Record<string, any>>((acc, key) =>
        {
            const val = (serialized as any)[key];
            if (val == null)
            {
                acc[key] = null;
                return acc;
            }

            if (typeof val === "object")
            {
                if (Array.isArray(val))
                {
                    acc[key] = val.map((v) =>
                    {
                        if (v == null)
                            return null;

                        if (typeof v === "object")
                        {
                            if (v.$typename && typeof v.$typename === "string" && (v.$typename as string).isNotEmptyOrWhiteSpace())
                                return Deserializer.deserialize(v);
                            // else
                            //     return JSON.parse(JSON.stringify(v));
                        }

                        return v as unknown;
                    });
                }
                else
                {
                    if (val.$typename && typeof val.$typename === "string" && (val.$typename as string).isNotEmptyOrWhiteSpace())
                        acc[key] = Deserializer.deserialize(val);
                    else
                        acc[key] = val; // JSON.parse(JSON.stringify(val));
                }
            }
            else
            {
                acc[key] = val;
            }

            return acc;
        }, {});

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return new type(serialized) as T;
    }

    private static _getType(typeName: string): object | null
    {
        given(typeName, "typeName").ensureHasValue().ensureIsString();
        typeName = typeName.trim();

        if (this._typeCache.has(typeName))
            return this._typeCache.get(typeName)!;

        return null;
    }
}


export function serialize<Class extends Serializable, T>(
    target: SerializableClassGetter<Class, T>,
    context: ClassGetterDecoratorContext<Class, T>
): void;
export function serialize<Class extends Serializable, T, K extends string>(
    key: K extends "" ? never : K
): UniversalSerializeDecorator<Class, T>;
export function serialize<
    Class extends Serializable,
    T
>(
    keyOrTarget: string | SerializableClass<Class> | SerializableClassGetter<Class, T>,
    context?: ClassDecoratorContext<SerializableClass<Class>> | ClassGetterDecoratorContext<Class, T>
): SerializeGetterDecorator<Class, T> | SerializeClassDecorator<Class> | void // eslint-disable-line @typescript-eslint/no-invalid-void-type
{
    if (typeof keyOrTarget === "string")
    {
        const key = keyOrTarget;
        given(key, "key").ensureHasValue().ensureIsString();

        const decorator: UniversalSerializeDecorator<Class, T> = function (target, context)
        {
            Utilities.configureMetaOnContext(context, target, key);
        };

        return decorator;
    }
    else
    {
        given(context, "context").ensureHasValue().ensureIsObject();
        Utilities.configureMetaOnContext(context!, keyOrTarget);
    }
}



class Utilities
{
    public static fetchSerializableFieldsForObject(val: Object): ReadonlyArray<SerializableFieldInfo>
    {
        const meta = val.constructor[Symbol.metadata];
        if (meta == null)
            return [];

        const fields = meta[this._fetchSerializableFieldsKey()] as Array<SerializableFieldInfo> | undefined;
        if (fields == null || fields.isEmpty)
            return [];

        const className = val.constructor.name;
        given(className, className)
            .ensure(
                t =>
                {
                    const key = this._fetchSerializableClassKey(t);
                    const isSerializable = val.constructor[Symbol.metadata]![key] != null;
                    return isSerializable;
                },
                `class '${className}' should have the serialize decorator`
            );

        return fields;
    }

    public static fetchSerializableClassInfoForObject(val: Object): SerializableClassInfo
    {
        const meta = val.constructor[Symbol.metadata];
        if (meta == null)
            throw new ApplicationException(`No metadata found on the class '${val.constructor.name}'`);

        const info = meta[this._fetchSerializableClassKey(val.constructor.name)] as SerializableClassInfo | undefined;

        if (info == null)
            throw new ApplicationException(`class '${val.constructor.name}' should have a serialize decorator`);

        return info;
    }

    public static fetchSerializableInfoForClass(target: SerializableClass<any>): SerializableClassInfo
    {
        given(target, "target").ensureHasValue().ensureIsFunction();

        const meta = target[Symbol.metadata];
        if (meta == null)
            throw new ApplicationException(`no metadata found on class ${target.getTypeName()}`);

        const serializableInfo = meta[this._fetchSerializableClassKey(target.getTypeName())] as SerializableClassInfo | undefined;

        if (serializableInfo == null)
            throw new ApplicationException(`class '${target.getTypeName()}' should have a serialize decorator`);

        return serializableInfo;
    }

    public static configureMetaOnContext<Class extends Serializable, T>(
        context: ClassDecoratorContext<SerializableClass<Class>>
            | ClassGetterDecoratorContext<Class, T>,
        target: SerializableClass<Class> | SerializableClassGetter<Class, T>,
        key?: string
    ): void
    {
        given(context, "context").ensureHasValue().ensureIsObject();
        given(target, "target").ensureHasValue().ensureIsFunction();
        given(key, "key").ensureIsString();

        const kind = context.kind;
        given(kind, "kind").ensure(t => ["getter", "class"].contains(t), "serialize can only be used on getters or class");

        if (kind === "getter")
        {
            given(context, "context")
                .ensure(t => !t.private, "property should not be private")
                .ensure(t => !t.static, "property should not be static");

            const fieldInfo: SerializableFieldInfo = {
                name: context.name.toString(),
                target,
                key
            };

            const fieldsKey = this._fetchSerializableFieldsKey();
            const existingFields = context.metadata[fieldsKey] as ReadonlyArray<SerializableFieldInfo> | undefined ?? [];

            context.metadata[fieldsKey] = [
                ...existingFields.where(t => t.name !== context.name), // filtering out any info that might have been overridden
                fieldInfo
            ];

            context.addInitializer(function (this: Class): void
            {
                const className = this.constructor.name;
                given(className, "className")
                    .ensure(
                        t => this.constructor[Symbol.metadata]![Utilities._fetchSerializableClassKey(t)] != null,
                        `class '${className}' does not have the serialize decorator`
                    );
            });
        }
        else
        {
            given(target, "target")
                .ensure(t => t.prototype instanceof Serializable, `class '${context.name}' decorated with serialize must extend Serializable`);

            const prefix = key!;

            given(prefix, "prefix").ensureHasValue().ensureIsString();

            const info: SerializableClassInfo = {
                className: target.getTypeName(),
                prefix,
                typeName: `${prefix}.${context.name}`
            };

            const serializeKey = this._fetchSerializableClassKey(context.name!);
            context.metadata[serializeKey] = info;

            Deserializer.registerType(target as SerializableClass<Class>, info);
        }
    }


    private static _fetchSerializableClassKey(className: string): symbol
    {
        given(className, "className").ensureHasValue().ensureIsString();
        return Symbol.for(`@nivinjoseph/n-util/serializable/${className}/info`);
    }

    private static _fetchSerializableFieldsKey(): symbol
    {
        return Symbol.for("@nivinjoseph/n-util/serializable/fields");
    }
}


export type SerializableClass<This extends Serializable> = ClassDefinition<This>;
export type SerializableClassGetter<This extends Serializable, T> = (this: This) => T;



export type SerializeClassDecorator<Class extends Serializable> = (
    target: SerializableClass<Class>,
    context: ClassDecoratorContext<SerializableClass<Class>>
) => void;


export type SerializeGetterDecorator<Class extends Serializable, T> = (
    target: SerializableClassGetter<Class, T>,
    context: ClassGetterDecoratorContext<Class, T>
) => void;


interface SerializableFieldInfo
{
    target: Function;
    name: string;
    key?: string;
}

interface SerializableClassInfo
{
    className: string;
    prefix?: string;
    typeName: string;
}

type UniversalSerializeDecorator<Class extends Serializable, T> =
    (target: SerializableClass<Class> | SerializableClassGetter<Class, T>,
        context: ClassDecoratorContext<SerializableClass<Class>>
            | ClassGetterDecoratorContext<Class, T>) => void;