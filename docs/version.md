# Version

The `Version` class provides semantic version handling with comparison capabilities. It implements a simple version comparison system following semantic versioning principles.

## Features

- Semantic version parsing (major.minor.patch)
- Version comparison
- Equality checking
- String representation
- Immutable version numbers

## Usage

```typescript
import { Version } from "n-util";

// Create a version
const version1 = new Version("1.2.3");
const version2 = new Version("2.0.0");

// Compare versions
const comparison = version1.compareTo(version2); // -1 (version1 is less than version2)

// Check equality
const isEqual = version1.equals(version2); // false

// Get version components
console.log(version1.major); // 1
console.log(version1.minor); // 2
console.log(version1.patch); // 3

// Get full version string
console.log(version1.full); // "1.2.3"
```

## API Reference

### Constructor
```typescript
constructor(semanticVersion: string)
```
Creates a new Version instance from a semantic version string.

- Parameters:
  - `semanticVersion`: A string in the format "major.minor.patch"
- Throws:
  - `InvalidArgumentException` if the version string is not in the correct format
  - `ArgumentException` if any component is not a valid number

### Properties

#### major
```typescript
get major(): number
```
Gets the major version number.

#### minor
```typescript
get minor(): number
```
Gets the minor version number.

#### patch
```typescript
get patch(): number
```
Gets the patch version number.

#### full
```typescript
get full(): string
```
Gets the full version string in "major.minor.patch" format.

### Methods

#### equals
```typescript
equals(version: Version): boolean
```
Compares this version with another for equality.

- Parameters:
  - `version`: The version to compare with
- Returns: `true` if all components are equal, `false` otherwise

#### compareTo
```typescript
compareTo(version: Version): number
```
Compares this version with another version.

- Parameters:
  - `version`: The version to compare with
- Returns:
  - `-1` if this version is less than the other
  - `0` if versions are equal
  - `1` if this version is greater than the other

#### toString
```typescript
toString(): string
```
Returns the string representation of the version.

- Returns: The full version string in "major.minor.patch" format

## Best Practices

1. Use semantic versioning format (major.minor.patch)
2. Compare versions using `compareTo` for ordering
3. Use `equals` for equality checks
4. Access version components through properties rather than parsing the string
5. Use the `full` property for string representation

## Examples

### Version Comparison
```typescript
const v1 = new Version("1.2.3");
const v2 = new Version("1.2.4");
const v3 = new Version("2.0.0");

// Compare versions
console.log(v1.compareTo(v2)); // -1 (v1 < v2)
console.log(v1.compareTo(v1)); // 0 (v1 == v1)
console.log(v3.compareTo(v1)); // 1 (v3 > v1)

// Check equality
console.log(v1.equals(v2)); // false
console.log(v1.equals(new Version("1.2.3"))); // true
```

### Version Sorting
```typescript
const versions = [
    new Version("2.0.0"),
    new Version("1.0.0"),
    new Version("1.1.0"),
    new Version("1.0.1")
];

// Sort versions
versions.sort((a, b) => a.compareTo(b));
// Result: ["1.0.0", "1.0.1", "1.1.0", "2.0.0"]
```

### Version Validation
```typescript
function isValidVersion(versionString: string): boolean {
    try {
        new Version(versionString);
        return true;
    } catch {
        return false;
    }
}

console.log(isValidVersion("1.2.3")); // true
console.log(isValidVersion("1.2")); // false
console.log(isValidVersion("1.2.3.4")); // false
console.log(isValidVersion("1.2.x")); // false
``` 