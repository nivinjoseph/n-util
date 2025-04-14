# Templator

The `Templator` class provides a simple interface for template rendering using Mustache templates. It allows for template parsing, token extraction, and rendering with data objects.

## Features

- Mustache template rendering
- Template token extraction
- Custom escaping behavior
- Type-safe interface

## Usage

```typescript
import { Templator } from "n-util";

// Create a template
const template = "Hello, {{name}}! Welcome to {{place}}.";
const templator = new Templator(template);

// Get template tokens
console.log(templator.tokens); // ["name", "place"]

// Render template with data
const data = {
    name: "John",
    place: "New York"
};
const result = templator.render(data);
console.log(result); // "Hello, John! Welcome to New York."
```

## API Reference

### Constructor
```typescript
constructor(template: string)
```
Creates a new Templator instance with the given template string.

- Parameters:
  - `template`: The Mustache template string
- Throws: Error if the template is not a valid string

### Properties

#### template
```typescript
get template(): string
```
Gets the original template string.

#### tokens
```typescript
get tokens(): ReadonlyArray<string>
```
Gets an array of token names found in the template.

### Methods

#### render
```typescript
render(data: Object): string
```
Renders the template with the provided data.

- Parameters:
  - `data`: An object containing values for the template tokens
- Returns: The rendered template string
- Throws: Error if the data is not a valid object

## Best Practices

1. Use descriptive token names in templates
2. Validate data before rendering
3. Handle missing token values appropriately
4. Consider using TypeScript interfaces for data objects
5. Use template caching for frequently used templates

## Examples

### Basic Template Rendering
```typescript
const template = "Hello, {{name}}!";
const templator = new Templator(template);

const data = { name: "World" };
console.log(templator.render(data)); // "Hello, World!"
```

### Working with Multiple Tokens
```typescript
const template = `
    User Information:
    Name: {{name}}
    Age: {{age}}
    Email: {{email}}
`;

const templator = new Templator(template);
console.log(templator.tokens); // ["name", "age", "email"]

const userData = {
    name: "John Doe",
    age: 30,
    email: "john@example.com"
};

console.log(templator.render(userData));
// Output:
// User Information:
// Name: John Doe
// Age: 30
// Email: john@example.com
```

### Using with TypeScript Interfaces
```typescript
interface User {
    firstName: string;
    lastName: string;
    role: string;
}

const template = "{{firstName}} {{lastName}} ({{role}})";
const templator = new Templator(template);

const user: User = {
    firstName: "John",
    lastName: "Doe",
    role: "Admin"
};

console.log(templator.render(user)); // "John Doe (Admin)"
```

## Notes

- The Templator uses Mustache.js internally for template rendering
- Token names are case-sensitive
- The render method uses a custom escape function that preserves the original value
- The class is designed to be immutable after construction 