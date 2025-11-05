import * as uuid from "uuid";
/**
 * Utility class for generating UUID (Universally Unique Identifier) values.
 * Implements the singleton pattern and provides a static method for creating version 4 UUIDs.
 *
 * @example
 * ```typescript
 * const id = Uuid.create();
 * console.log(id); // e.g., "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export class Uuid {
    /**
     * Private constructor to prevent instantiation.
     * @private
     */
    constructor() { }
    /**
     * Generates a new version 4 UUID.
     *
     * @returns A string containing the generated UUID in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
     *
     * @example
     * ```typescript
     * const id = Uuid.create();
     * console.log(id); // e.g., "550e8400-e29b-41d4-a716-446655440000"
     * ```
     */
    static create() {
        return uuid.v4();
    }
}
//# sourceMappingURL=uuid.js.map