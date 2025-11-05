import { ApplicationException } from "@nivinjoseph/n-exception";
import { given } from "@nivinjoseph/n-defensive";
//@ts-expect-error polyfill to use metadata object
Symbol.metadata ??= Symbol("Symbol.metadata");
export class Serializable {
    constructor(data) {
        given(data, "data").ensureHasValue().ensureIsObject();
    }
    serialize() {
        const classInfo = Utilities.fetchSerializableClassInfoForObject(this);
        const fields = Utilities.fetchSerializableFieldsForObject(this);
        const serialized = fields.reduce((acc, field) => {
            const val = field.target.call(this);
            const serializationKey = field.key ?? field.name;
            if (val == null) {
                acc[serializationKey] = null;
                return acc;
            }
            if (typeof val === "object") {
                if (Array.isArray(val))
                    acc[serializationKey] = val.map((v) => {
                        if (v == null)
                            return null;
                        if (typeof v === "object") {
                            if (v instanceof Serializable)
                                return v.serialize();
                            else
                                return JSON.parse(JSON.stringify(v));
                        }
                        return v;
                    });
                else
                    acc[serializationKey] = val instanceof Serializable
                        ? val.serialize() : JSON.parse(JSON.stringify(val));
            }
            else {
                acc[serializationKey] = val;
            }
            return acc;
        }, {});
        // add prefix here...
        serialized.$typename = classInfo.typeName;
        return serialized;
    }
}
export class Deserializer {
    static _typeCache = new Map();
    /**
     * @static
     */
    constructor() { }
    static hasType(typeName) {
        // this is postel's law compliant
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (typeName == null || typeof typeName !== "string" || typeName.isEmptyOrWhiteSpace()
            || !this._typeCache.has(typeName.trim()))
            return false;
        return true;
    }
    static registerType(type, serializeInfo) {
        given(type, "type").ensureHasValue()
            .ensure(t => t.prototype instanceof Serializable, "type does not extend Serializable");
        given(serializeInfo, "serializeInfo").ensureIsObject();
        serializeInfo ??= Utilities.fetchSerializableInfoForClass(type);
        const typeName = serializeInfo.typeName;
        if (!this._typeCache.has(typeName))
            this._typeCache.set(typeName, type);
    }
    static deserialize(serialized) {
        given(serialized, "serialized").ensureHasValue().ensureIsObject()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .ensure(t => t.$typename && typeof t.$typename === "string"
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            && !t.$typename.isEmptyOrWhiteSpace(), "$typename property is missing on object");
        const typeName = serialized.$typename;
        let type = Deserializer._getType(typeName);
        if (type == null)
            throw new ApplicationException(`Cannot deserialize unregistered type '${typeName}'.`);
        if (typeof type === "object")
            type = type.constructor;
        if (type.deserialize && typeof type.deserialize === "function")
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return type.deserialize(serialized);
        serialized = Object.keys(serialized).reduce((acc, key) => {
            const val = serialized[key];
            if (val == null) {
                acc[key] = null;
                return acc;
            }
            if (typeof val === "object") {
                if (Array.isArray(val)) {
                    acc[key] = val.map((v) => {
                        if (v == null)
                            return null;
                        if (typeof v === "object") {
                            if (v.$typename && typeof v.$typename === "string" && v.$typename.isNotEmptyOrWhiteSpace())
                                return Deserializer.deserialize(v);
                            // else
                            //     return JSON.parse(JSON.stringify(v));
                        }
                        return v;
                    });
                }
                else {
                    if (val.$typename && typeof val.$typename === "string" && val.$typename.isNotEmptyOrWhiteSpace())
                        acc[key] = Deserializer.deserialize(val);
                    else
                        acc[key] = val; // JSON.parse(JSON.stringify(val));
                }
            }
            else {
                acc[key] = val;
            }
            return acc;
        }, {});
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return new type(serialized);
    }
    static _getType(typeName) {
        given(typeName, "typeName").ensureHasValue().ensureIsString();
        typeName = typeName.trim();
        if (this._typeCache.has(typeName))
            return this._typeCache.get(typeName);
        return null;
    }
}
export function serialize(keyOrTarget, context) {
    if (typeof keyOrTarget === "string") {
        const key = keyOrTarget;
        given(key, "key").ensureHasValue().ensureIsString();
        const decorator = function (target, context) {
            Utilities.configureMetaOnContext(context, target, key);
        };
        return decorator;
    }
    else {
        given(context, "context").ensureHasValue().ensureIsObject();
        Utilities.configureMetaOnContext(context, keyOrTarget);
    }
}
class Utilities {
    static fetchSerializableFieldsForObject(val) {
        const meta = val.constructor[Symbol.metadata];
        if (meta == null)
            return [];
        const fields = meta[this._fetchSerializableFieldsKey()];
        if (fields == null || fields.isEmpty)
            return [];
        const className = val.constructor.name;
        given(className, className)
            .ensure(t => {
            const key = this._fetchSerializableClassKey(t);
            const isSerializable = val.constructor[Symbol.metadata][key] != null;
            return isSerializable;
        }, `class '${className}' should have the serialize decorator`);
        return fields;
    }
    static fetchSerializableClassInfoForObject(val) {
        const meta = val.constructor[Symbol.metadata];
        if (meta == null)
            throw new ApplicationException(`No metadata found on the class '${val.constructor.name}'`);
        const info = meta[this._fetchSerializableClassKey(val.constructor.name)];
        if (info == null)
            throw new ApplicationException(`class '${val.constructor.name}' should have a serialize decorator`);
        return info;
    }
    static fetchSerializableInfoForClass(target) {
        given(target, "target").ensureHasValue().ensureIsFunction();
        const meta = target[Symbol.metadata];
        if (meta == null)
            throw new ApplicationException(`no metadata found on class ${target.getTypeName()}`);
        const serializableInfo = meta[this._fetchSerializableClassKey(target.getTypeName())];
        if (serializableInfo == null)
            throw new ApplicationException(`class '${target.getTypeName()}' should have a serialize decorator`);
        return serializableInfo;
    }
    static configureMetaOnContext(context, target, key) {
        given(context, "context").ensureHasValue().ensureIsObject();
        given(target, "target").ensureHasValue().ensureIsFunction();
        given(key, "key").ensureIsString();
        const kind = context.kind;
        given(kind, "kind").ensure(t => ["getter", "class"].contains(t), "serialize can only be used on getters or class");
        if (kind === "getter") {
            given(context, "context")
                .ensure(t => !t.private, "property should not be private")
                .ensure(t => !t.static, "property should not be static");
            const fieldInfo = {
                name: context.name.toString(),
                target: target,
                key
            };
            const fieldsKey = this._fetchSerializableFieldsKey();
            const existingFields = context.metadata[fieldsKey] ?? [];
            context.metadata[fieldsKey] = [
                ...existingFields.where(t => t.name !== context.name), // filtering out any info that might have been overridden
                fieldInfo
            ];
            context.addInitializer(function () {
                const className = this.constructor.name;
                given(className, "className")
                    .ensure(t => this.constructor[Symbol.metadata][Utilities._fetchSerializableClassKey(t)] != null, `class '${className}' does not have the serialize decorator`);
            });
        }
        else {
            given(target, "target")
                .ensure(t => t.prototype instanceof Serializable, `class '${context.name}' decorated with serialize must extend Serializable`);
            const prefix = key;
            given(prefix, "prefix").ensureIsString();
            const info = {
                className: target.getTypeName(),
                prefix,
                typeName: prefix == null ? context.name : `${prefix}.${context.name}`
            };
            const serializeKey = this._fetchSerializableClassKey(context.name);
            context.metadata[serializeKey] = info;
            Deserializer.registerType(target, info);
        }
    }
    static _fetchSerializableClassKey(className) {
        given(className, "className").ensureHasValue().ensureIsString();
        return Symbol.for(`@nivinjoseph/n-util/serializable/${className}/info`);
    }
    static _fetchSerializableFieldsKey() {
        return Symbol.for("@nivinjoseph/n-util/serializable/fields");
    }
}
//# sourceMappingURL=serializable.js.map