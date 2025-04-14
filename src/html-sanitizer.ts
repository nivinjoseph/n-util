import SanitizeHtml from "sanitize-html";
import { given } from "@nivinjoseph/n-defensive";

/**
 * Utility class for sanitizing HTML content to prevent XSS attacks.
 * Provides safe HTML sanitization while maintaining allowed elements and attributes.
 * 
 * @example
 * ```typescript
 * const html = '<div onclick="alert(\'xss\')">Hello <script>alert("xss")</script>World!</div>';
 * const sanitized = HtmlSanitizer.sanitize(html);
 * // Result: <div>Hello World!</div>
 * ```
 */
export class HtmlSanitizer
{
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    private constructor() { }


    /**
     * Sanitizes HTML content by removing potentially dangerous elements and attributes
     * while preserving safe HTML elements and styling.
     * 
     * @param html - The HTML string to sanitize
     * @returns A sanitized HTML string with safe elements and attributes
     * @throws Error if html is null, undefined, or not a string
     * 
     * @example
     * ```typescript
     * const html = `
     *     <div class="content">
     *         <h1>Hello World</h1>
     *         <p>This is <b>bold</b> text with <a href="https://example.com">a link</a></p>
     *         <img src="https://example.com/image.jpg" alt="Example" style="width: 100px;">
     *     </div>
     * `;
     * const sanitized = HtmlSanitizer.sanitize(html);
     * ```
     */
    public static sanitize(html: string): string
    {
        given(html, "html").ensureHasValue().ensureIsString();

        const sanitized = SanitizeHtml(html, this._createOptions());

        return sanitized;
    }


    /**
     * Creates the sanitization options for the HTML sanitizer.
     * Configures allowed tags, attributes, and URL schemes.
     * 
     * @private
     * @returns Sanitization options object
     */
    private static _createOptions(): SanitizeHtml.IOptions
    {
        return {
            allowedTags: SanitizeHtml.defaults.allowedTags.concat(["img"]),
            allowedAttributes: Object.assign(SanitizeHtml.defaults.allowedAttributes, {
                "*": ["style", "class"]
            }),
            allowedSchemesByTag: {
                "img": ["http", "https", "data"]
            }
        };
    }
}