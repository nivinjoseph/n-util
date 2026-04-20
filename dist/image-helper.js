import { given } from "@nivinjoseph/n-defensive";
import { Buffer } from "buffer";
/**
 * Utility class for working with image data and conversions.
 * Provides methods for handling data URLs and image buffers.
 *
 * @remarks
 * This is a static-only class and cannot be instantiated.
 */
export class ImageHelper {
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    constructor() { }
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
    static dataUrlToBuffer(dataUrl) {
        given(dataUrl, "dataUrl").ensureHasValue().ensureIsString();
        dataUrl = dataUrl.trim();
        // data URL grammar (RFC 2397): data:[<mediatype>][;base64],<data>
        // Split strictly on the FIRST comma — the payload may contain commas
        // only if non-base64, which we reject anyway.
        const commaIdx = dataUrl.indexOf(",");
        given(dataUrl, "dataUrl")
            .ensure(t => /^data:/i.test(t), "must be a data URL starting with 'data:'")
            .ensure(_ => commaIdx > "data:".length, "must contain ',' separating the header and payload");
        const header = dataUrl.substring("data:".length, commaIdx);
        const payload = dataUrl.substring(commaIdx + 1);
        const params = header.split(";").map(p => p.trim().toLowerCase());
        const mime = params[0];
        const isBase64 = params.includes("base64");
        given(dataUrl, "dataUrl")
            .ensure(_ => mime.startsWith("image/"), `media type must be image/*, got '${mime}'`)
            .ensure(_ => isBase64, "payload must be base64-encoded (';base64' marker required)");
        return Buffer.from(payload, "base64");
    }
}
//# sourceMappingURL=image-helper.js.map