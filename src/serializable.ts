import { ApplicationException, ArgumentException } from "@nivinjoseph/n-exception";
import { given } from "@nivinjoseph/n-defensive";

/**
 * @description A class used to create serialize data object.
 */
export abstract class Serializable<TData extends object = {}>
{
    public constructor(data: TData)
    {
        given(data, "data").ensureHasValue().ensureIsObject();
    }
    
    /**
     * @description Serializes the data.
     * 
     * @returns The serialized data.
     */
    public serialize(): TData
    {
        const typeName = (<Object>this).getTypeName();
        const propertyInfos = Utilities.getPropertyInfos(this, typeName);
        
        const serialized = propertyInfos.reduce((acc, propInfo) =>
        {
            const val = (this as any)[propInfo.name];
            if (val == null)
            {
                acc[propInfo.serializationKey] = null;
                return acc;
            }
            
            if (typeof val === "object")
            {
                if (Array.isArray(val))
                    acc[propInfo.serializationKey] = val.map((v) =>
                    {
                        if (v == null)
                            return null;
                        
                        if (typeof v === "object")
                        {
                            if (v instanceof Serializable)
                                return v.serialize();
                            else
                                return JSON.parse(JSON.stringify(v));
                        }
                        
                        return v;
                    });
                else
                    acc[propInfo.serializationKey] = val instanceof Serializable
                        ? val.serialize() : JSON.parse(JSON.stringify(val));   
            }
            else
            {
                acc[propInfo.serializationKey] = val;    
            }
            
            return acc;
        }, {} as any);
        
        serialized.$typename = typeName;
        
        return serialized;
    }
}


/**
 * @description Used to deserialize serialized data.
 */
export class Deserializer
{
    private static _typeCache = new Map<string, object>();
    
    /**
     * @static
     */
    private constructor() { }

    
    public static hasType(typeName: string): boolean
    {
        // this is postel's law compliant
        if (typeName == null || typeof typeName !== "string" || typeName.isEmptyOrWhiteSpace()
            || !this._typeCache.has(typeName.trim()))
            return false;
        
        return true;
    }

    public static registerType(type: object | Function): void
    {
        given(type, "type").ensureHasValue();
        
        const typeName = (type as Object).getTypeName();
        if (!this._typeCache.has(typeName))
            this._typeCache.set(typeName, type);
    }
    
    /**
     * @description Deserialized the given `serialize` data.
     * 
     * @param serialized - The serialized object to be deserialized.
     * @returns The deserialized data.
     */
    public static deserialize<T>(serialized: object): T
    {
        given(serialized, "serialized").ensureHasValue().ensureIsObject()
            .ensure(t => (<any>t).$typename && typeof (<any>t).$typename === "string"
                && !(<any>t).$typename.isEmptyOrWhiteSpace(), "$typename property is missing on object");

        const typeName = (<any>serialized).$typename;
        let type = Deserializer.getType(typeName) as any;
        if (type == null)
            throw new ApplicationException(`Cannot deserialize unregistered type '${typeName}'.`);

        if (typeof type === "object")
            type = type.constructor;
        
        if (type.deserialize && typeof type.deserialize === "function")
            return type.deserialize(serialized);

        serialized = Object.keys(serialized).reduce((acc, key) =>
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
                            if (v.$typename && typeof v.$typename === "string" && !v.$typename.isEmptyOrWhiteSpace())
                                return Deserializer.deserialize(v);
                            // else
                            //     return JSON.parse(JSON.stringify(v));
                        }

                        return v;
                    });
                }
                else
                {
                    if (val.$typename && typeof val.$typename === "string" && !val.$typename.isEmptyOrWhiteSpace())
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
        }, {} as any);

        return new (type as any)(serialized);
    }
    
    private static getType(typeName: string): object | null
    {
        given(typeName, "typeName").ensureHasValue().ensureIsString();
        typeName = typeName.trim();
        
        if (this._typeCache.has(typeName))
            return this._typeCache.get(typeName);
        
        return null;
    }
}

// export function serialize(key?: string): Function
// {
//     given(key, "key").ensureIsString();

//     return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)
//     { 
//         given(target, "target").ensureHasValue().ensureIsObject()
//             .ensure(t => t instanceof Serializable,
//                 "serialize decorator must only be used on properties in subclasses of Serializable");
        
//         Deserializer.registerType(target);

//         if (!descriptor.get)
//             throw new ArgumentException(propertyKey, "serialize decorator must only be applied to getters");

//         (descriptor.get as any).serializable = true;
//         if (key && !key.isEmptyOrWhiteSpace())
//             (descriptor.get as any).serializationKey = key.trim();
//     };
// }

export function serialize(key: string): Function;
export function serialize(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export function serialize(keyOrTarget?: any, propertyKey?: string, descriptor?: PropertyDescriptor): any
{
    if (keyOrTarget != null && typeof keyOrTarget === "object")
    {
        const target = keyOrTarget as object;
        given(target, "target").ensureHasValue().ensureIsObject()
            .ensure(t => t instanceof Serializable,
                "serialize decorator must only be used on properties in subclasses of Serializable");

        Deserializer.registerType(target);

        if (!descriptor.get)
            throw new ArgumentException(propertyKey, "serialize decorator must only be applied to getters");

        (descriptor.get as any).serializable = true;
    }
    else
    {
        const key = keyOrTarget as string;
        given(key, "key").ensureIsString();
        
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)
        {
            given(target, "target").ensureHasValue().ensureIsObject()
                .ensure(t => t instanceof Serializable,
                    "serialize decorator must only be used on properties in subclasses of Serializable");

            Deserializer.registerType(target);

            if (!descriptor.get)
                throw new ArgumentException(propertyKey, "serialize decorator must only be applied to getters");

            (descriptor.get as any).serializable = true;
            if (key != null && key.isNotEmptyOrWhiteSpace())
                (descriptor.get as any).serializationKey = key.trim();
        };
    }
}

export function deserialize(target: Function): void
{
    given(target, "target").ensureHasValue().ensureIsFunction();
    
    Deserializer.registerType(target);
}


class Utilities
{
    private static typeCache = new Map<string, ReadonlyArray<PropertyInfo>>();
    
    private static internal: string[] = [];

    private static forbidden = ["do", "if", "for", "let", "new", "try", "var", "case", "else", "with", "await", "break",
        "catch", "class", "const", "super", "throw", "while", "yield", "delete", "export", "import", "return",
        "switch", "default", "extends", "finally", "continue", "debugger", "function", "arguments", "typeof", "void"];
    
    public static getPropertyInfos(val: any, typeName: string): ReadonlyArray<PropertyInfo>
    {
        given(val, "val").ensureHasValue().ensureIsObject();
        given(typeName, "typeName").ensureHasValue().ensureIsString();
        
        if (!Utilities.typeCache.has(typeName))
            Utilities.typeCache.set(typeName, Utilities.getPropertyInfosInternal(val));
        
        return Utilities.typeCache.get(typeName);
    }
    
    
    private static getPropertyInfosInternal(val: any): Array<PropertyInfo>
    {
        let propertyInfos = new Array<PropertyInfo>();
        let prototype = Object.getPrototypeOf(val);
        if (prototype === undefined || prototype === null)  // we are dealing with Object
            return propertyInfos;

        propertyInfos.push(...Utilities.getPropertyInfosInternal(prototype));

        let propertyNames = Object.getOwnPropertyNames(val);
        for (let name of propertyNames)
        {
            name = name.trim();
            if (name === "constructor" || name.startsWith("_") || name.startsWith("$") || Utilities.internal.some(t => t === name))
                continue;

            if (Utilities.forbidden.some(t => t === name))
                throw new ApplicationException(`Class ${(<Object>val).getTypeName()} has a member with the forbidden name '${name}'. The following names are forbidden: ${Utilities.forbidden}.`);

            const descriptor = Object.getOwnPropertyDescriptor(val, name);
            if (descriptor.get && (descriptor.get as any).serializable)
            {
                propertyInfos.push({
                    name,
                    descriptor,
                    serializationKey: (descriptor.get as any).serializationKey ?? name
                });
            }
        }

        return propertyInfos;
    }
}


interface PropertyInfo
{
    name: string;
    descriptor: PropertyDescriptor;
    serializationKey: string;
}