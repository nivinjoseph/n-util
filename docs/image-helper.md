# Image Helper

The `ImageHelper` class provides utility methods for working with image data, particularly for converting between different image formats.

## Features

- Data URL to Buffer conversion
- Base64 image data handling
- MIME type extraction from data URLs

## Usage

```typescript
import { ImageHelper } from "n-util";

// Convert a data URL to a Buffer
const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
const buffer = ImageHelper.dataUrlToBuffer(dataUrl);
```

## API Reference

### Static Methods

#### dataUrlToBuffer
```typescript
static dataUrlToBuffer(dataUrl: string): Buffer
```
Converts a data URL to a Buffer object.

- Parameters:
  - `dataUrl`: The data URL string to convert (e.g., "data:image/png;base64,...")
- Returns: A Buffer containing the image data
- Throws: Error if the data URL is invalid or empty

## Examples

### Converting Data URL to Buffer
```typescript
// Example data URL (shortened for clarity)
const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

// Convert to Buffer
const imageBuffer = ImageHelper.dataUrlToBuffer(dataUrl);

// The Buffer can now be used for:
// - Saving to a file
// - Uploading to a server
// - Processing the image data
```

## Notes

- The class is static-only and cannot be instantiated
- Data URLs must be properly formatted with a valid MIME type and base64 data
- The method automatically trims whitespace from the input
- The base64 data portion is extracted and converted to a Buffer
- MIME type information is preserved in the original data URL format 