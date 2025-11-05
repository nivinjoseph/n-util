import { given } from "@nivinjoseph/n-defensive";
import { ArgumentException, InvalidArgumentException } from "@nivinjoseph/n-exception";
import { TypeHelper } from "./type-helper.js";
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
export class Version {
    _major;
    _minor;
    _patch;
    /**
     * Gets the major version number.
     */
    get major() { return this._major; }
    /**
     * Gets the minor version number.
     */
    get minor() { return this._minor; }
    /**
     * Gets the patch version number.
     */
    get patch() { return this._patch; }
    /**
     * Gets the full version string in "major.minor.patch" format.
     */
    get full() { return `${this._major}.${this._minor}.${this._patch}`; }
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
    constructor(semanticVersion) {
        given(semanticVersion, "semanticVersion").ensureHasValue().ensureIsString();
        semanticVersion = semanticVersion.trim();
        const split = semanticVersion.split(".");
        if (split.length !== 3)
            throw new InvalidArgumentException("semanticVersion");
        const major = TypeHelper.parseNumber(split[0]);
        if (major == null)
            throw new ArgumentException("semanticVersion", "invalid major");
        this._major = major;
        const minor = TypeHelper.parseNumber(split[1]);
        if (minor == null)
            throw new ArgumentException("semanticVersion", "invalid minor");
        this._minor = minor;
        const patch = TypeHelper.parseNumber(split[2]);
        if (patch == null)
            throw new ArgumentException("semanticVersion", "invalid patch");
        this._patch = patch;
    }
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
    equals(version) {
        given(version, "version").ensureHasValue().ensureIsObject().ensureIsInstanceOf(Version);
        return version.major === this.major && version.minor === this.minor && version.patch === this.patch;
    }
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
    compareTo(version) {
        given(version, "version").ensureHasValue().ensureIsObject().ensureIsInstanceOf(Version);
        const majorCompare = this._compare(this.major, version.major);
        if (majorCompare !== 0)
            return majorCompare;
        const minorCompare = this._compare(this.minor, version.minor);
        if (minorCompare !== 0)
            return minorCompare;
        return this._compare(this.patch, version.patch);
    }
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
    toString() {
        return this.full;
    }
    /**
     * Compares two numbers for version comparison.
     *
     * @param v1 - First version number
     * @param v2 - Second version number
     * @returns -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
     * @private
     */
    _compare(v1, v2) {
        given(v1, "v1").ensureHasValue().ensureIsNumber();
        given(v2, "v2").ensureHasValue().ensureIsNumber();
        if (v1 > v2)
            return 1;
        if (v1 < v2)
            return -1;
        else
            return 0;
    }
}
//# sourceMappingURL=version.js.map