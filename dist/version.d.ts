/**
 * Represents a semantic version number with major, minor, and patch components.
 * Provides methods for version comparison and string representation.
 *
 * @example
 * ```typescript
 * const version = new Version("1.2.3");
 * console.log(version.major); // 1
 * console.log(version.minor); // 2
 * console.log(version.patch); // 3
 * console.log(version.full); // "1.2.3"
 * ```
 */
export declare class Version {
    private readonly _major;
    private readonly _minor;
    private readonly _patch;
    /**
     * Gets the major version number.
     */
    get major(): number;
    /**
     * Gets the minor version number.
     */
    get minor(): number;
    /**
     * Gets the patch version number.
     */
    get patch(): number;
    /**
     * Gets the full version string in "major.minor.patch" format.
     */
    get full(): string;
    /**
     * Creates a new Version instance from a semantic version string.
     *
     * @param semanticVersion - A string in the format "major.minor.patch"
     * @throws {InvalidArgumentException} If the version string is not in the correct format
     * @throws {ArgumentException} If any component is not a valid number
     *
     * @example
     * ```typescript
     * const version = new Version("1.2.3");
     * ```
     */
    constructor(semanticVersion: string);
    /**
     * Compares this version with another for equality.
     *
     * @param version - The version to compare with
     * @returns `true` if all components are equal, `false` otherwise
     *
     * @example
     * ```typescript
     * const v1 = new Version("1.2.3");
     * const v2 = new Version("1.2.3");
     * console.log(v1.equals(v2)); // true
     * ```
     */
    equals(version: Version): boolean;
    /**
     * Compares this version with another version.
     *
     * @param version - The version to compare with
     * @returns -1 if this version is less than the other, 0 if equal, 1 if greater
     *
     * @example
     * ```typescript
     * const v1 = new Version("1.2.3");
     * const v2 = new Version("2.0.0");
     * console.log(v1.compareTo(v2)); // -1
     * ```
     */
    compareTo(version: Version): number;
    /**
     * Returns the string representation of the version.
     *
     * @returns The full version string in "major.minor.patch" format
     *
     * @example
     * ```typescript
     * const version = new Version("1.2.3");
     * console.log(version.toString()); // "1.2.3"
     * ```
     */
    toString(): string;
    /**
     * Compares two numbers for version comparison.
     *
     * @param v1 - First version number
     * @param v2 - Second version number
     * @returns -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
     * @private
     */
    private _compare;
}
//# sourceMappingURL=version.d.ts.map