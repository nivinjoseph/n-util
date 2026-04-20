import { Buffer } from "buffer";
/**
 * Utility class for working with image data and conversions.
 * Provides methods for handling data URLs and image buffers.
 *
 * @remarks
 * This is a static-only class and cannot be instantiated.
 */
export declare class ImageHelper {
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    private constructor();
    /**
     * Converts a base64-encoded image data URL to a Buffer.
     *
     * The input must be a well-formed data URL of the shape
     * `data:image/<subtype>[;param=value]*;base64,<payload>`.
     * Non-image MIME types and non-base64 payloads are rejected — use a
     * generic data-URL parser for those cases.
     *
     * @param dataUrl - The data URL string to convert
     * @returns A Buffer containing the decoded image bytes
     * @throws Error if the value is not a base64-encoded `image/*` data URL
     *
     * @example
     * ```typescript
     * const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
     * const buffer = ImageHelper.dataUrlToBuffer(dataUrl);
     * ```
     */
    static dataUrlToBuffer(dataUrl: string): Buffer;
}
//# sourceMappingURL=image-helper.d.ts.map