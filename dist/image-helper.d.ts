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
     * Converts a data URL to a Buffer object.
     *
     * @param dataUrl - The data URL string to convert (e.g., "data:image/png;base64,...")
     * @returns A Buffer containing the image data
     * @throws Error if the data URL is invalid or empty
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