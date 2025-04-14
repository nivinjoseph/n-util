# HTML Sanitizer

The `HtmlSanitizer` class provides a utility for sanitizing HTML content to prevent XSS (Cross-Site Scripting) attacks while maintaining safe HTML elements and attributes.

## Features

- HTML content sanitization
- Protection against XSS attacks
- Configurable allowed tags and attributes
- Support for custom styling and classes
- Safe image handling with controlled schemes

## Usage

### Basic Usage

```typescript
import { HtmlSanitizer } from "n-util";

// Sanitize HTML content
const html = `
    <div class="content">
        <h1>Hello World</h1>
        <p>This is <b>bold</b> text with <a href="https://example.com">a link</a></p>
        <img src="https://example.com/image.jpg" alt="Example" style="width: 100px;">
    </div>
`;

const sanitizedHtml = HtmlSanitizer.sanitize(html);
// Result: Sanitized HTML with safe tags and attributes
```

### Allowed Elements and Attributes

The sanitizer allows the following by default:
- Common HTML tags (p, div, span, etc.)
- Basic text formatting (b, i, strong, em)
- Links with href attributes
- Images with src, alt attributes
- Custom styling and classes
- Safe URL schemes (http, https, data)

## API Reference

### HtmlSanitizer Class
```typescript
class HtmlSanitizer
```
A utility class for sanitizing HTML content.

#### Methods

##### sanitize
```typescript
static sanitize(html: string): string
```
Sanitizes the given HTML string, removing potentially dangerous content while preserving safe elements.

- Parameters:
  - `html`: The HTML string to sanitize
- Returns: A sanitized HTML string
- Throws: Error if html is null, undefined, or not a string

## Best Practices

1. **Input Validation**:
   - Always validate input before sanitization
   - Handle null or undefined values
   - Ensure input is a string

2. **Security Considerations**:
   - Use for user-generated content
   - Apply to all HTML content from untrusted sources
   - Consider additional validation for specific use cases

3. **Performance**:
   - Sanitize content before storage
   - Cache sanitized content when possible
   - Consider content length and complexity

## Examples

### User-Generated Content
```typescript
// Example of sanitizing user-generated content
class Comment {
    private _id: string;
    private _content: string;
    private _author: string;

    constructor(id: string, content: string, author: string) {
        this._id = id;
        this._content = HtmlSanitizer.sanitize(content);
        this._author = author;
    }

    get id(): string { return this._id; }
    get content(): string { return this._content; }
    get author(): string { return this._author; }
}

// Create a comment with sanitized content
const comment = new Comment(
    "C001",
    '<div onclick="alert(\'xss\')">Hello <script>alert("xss")</script>World!</div>',
    "John Doe"
);

// The content will be sanitized, removing dangerous elements
console.log(comment.content);
// Result: <div>Hello World!</div>
```

### Rich Text Editor Integration
```typescript
// Example of integrating with a rich text editor
class RichTextEditor {
    private _content: string;

    constructor(initialContent: string = "") {
        this._content = HtmlSanitizer.sanitize(initialContent);
    }

    public updateContent(newContent: string): void {
        this._content = HtmlSanitizer.sanitize(newContent);
    }

    public getContent(): string {
        return this._content;
    }

    public render(): string {
        return `
            <div class="rich-text-editor">
                ${this._content}
            </div>
        `;
    }
}

// Create and use a rich text editor
const editor = new RichTextEditor(`
    <h1>Welcome</h1>
    <p>This is <b>bold</b> text with <img src="data:image/png;base64,..." alt="Image"></p>
`);

// Update content with sanitization
editor.updateContent(`
    <div style="color: red;">
        <p>New content with <a href="javascript:alert('xss')">dangerous link</a></p>
    </div>
`);

// The content will be sanitized, preserving safe elements
console.log(editor.getContent());
// Result: <div style="color: red;"><p>New content with dangerous link</p></div>
```

### Custom Styling and Classes
```typescript
// Example of using custom styling and classes
class StyledContent {
    private _content: string;

    constructor(content:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           string) {
        this._content = HtmlSanitizer.sanitize(content);
    }

    public getContent(): string {
        return this._content;
    }
}

// Create styled content
const styledContent = new StyledContent(`
    <div class="card" style="background-color: #f0f0f0; padding: 20px;">
        <h2 class="title" style="color: #333;">Styled Content</h2>
        <p class="description" style="font-size: 16px;">
            This content has custom styling and classes
        </p>
    </div>
`);

// The content will preserve safe styling and classes
console.log(styledContent.getContent());
// Result: HTML with preserved styling and classes
```

## Security Notes

1. **XSS Prevention**:
   - Removes script tags and event handlers
   - Sanitizes URLs in links and images
   - Removes potentially dangerous attributes

2. **Allowed Content**:
   - Basic HTML formatting
   - Safe styling attributes
   - Controlled image sources
   - Custom classes

3. **Limitations**:
   - Does not validate content semantics
   - May not catch all XSS vectors
   - Consider additional security measures for critical applications 