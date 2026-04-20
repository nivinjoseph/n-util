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
        // Permissive enough to reject stylesheet-escape tricks (`;` to chain declarations,
        // `<`/`>` for markup injection, `{`/`}` to close a value and open a block) while
        // still allowing CSS functional notation like rgb(), calc(), var(), "quoted" font
        // names, etc. The property allowlist below excludes every property whose CSS
        // grammar accepts a `<url>` value, so functional notation cannot smuggle requests.
        const safeValue = /^[^;<>{}]*$/;
        const safeStyleProps: Record<string, Array<RegExp>> = {
            // Typography
            "color": [safeValue],
            "background-color": [safeValue],
            "font": [safeValue],
            "font-family": [safeValue],
            "font-size": [safeValue],
            "font-weight": [safeValue],
            "font-style": [safeValue],
            "font-variant": [safeValue],
            "line-height": [safeValue],
            "letter-spacing": [safeValue],
            "word-spacing": [safeValue],
            "text-align": [safeValue],
            "text-decoration": [safeValue],
            "text-transform": [safeValue],
            "text-indent": [safeValue],
            "white-space": [safeValue],
            "vertical-align": [safeValue],

            // Box model
            "margin": [safeValue],
            "margin-top": [safeValue],
            "margin-right": [safeValue],
            "margin-bottom": [safeValue],
            "margin-left": [safeValue],
            "padding": [safeValue],
            "padding-top": [safeValue],
            "padding-right": [safeValue],
            "padding-bottom": [safeValue],
            "padding-left": [safeValue],
            "width": [safeValue],
            "height": [safeValue],
            "min-width": [safeValue],
            "min-height": [safeValue],
            "max-width": [safeValue],
            "max-height": [safeValue],

            // Borders
            "border": [safeValue],
            "border-top": [safeValue],
            "border-right": [safeValue],
            "border-bottom": [safeValue],
            "border-left": [safeValue],
            "border-color": [safeValue],
            "border-style": [safeValue],
            "border-width": [safeValue],
            "border-radius": [safeValue],

            // Layout (tight enums — no positioning/stacking primitives that enable clickjacking)
            "display": [/^(inline|block|inline-block|flex|inline-flex|grid|inline-grid|none|table|table-cell|table-row|list-item)$/i],
            "float": [/^(left|right|none)$/i],
            "clear": [/^(left|right|both|none)$/i],

            // List styling
            "list-style": [safeValue],
            "list-style-type": [safeValue],
            "list-style-position": [safeValue]

            // Deliberately excluded (known XSS / UI-redress / exfil vectors):
            //   position, top, right, bottom, left, z-index   → clickjacking overlays
            //   transform, translate, rotate, scale           → clickjacking overlays
            //   opacity, visibility                           → hide-the-real-UI spoofing
            //   cursor                                        → url() exfil
            //   background (shorthand), background-image      → url() exfil
            //   content                                       → url() / attr() exfil
            //   filter, backdrop-filter                       → url() exfil via SVG filters
            //   clip-path, mask                               → url() exfil via SVG refs
        };

        // `allowedSchemesByTag.img` permits `data:` URIs, but sanitize-html does not
        // inspect the MIME type. `data:image/svg+xml,...` can carry inline script and
        // event handlers that execute in lax contexts (older browsers, email clients,
        // native webviews, RSS readers) even though modern browsers disable scripting
        // for SVG-as-<img>. This allowlist restricts data URIs on <img> to raster
        // formats whose decoders can't execute code.
        const safeImageDataUri = /^\s*data:image\/(png|jpe?g|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon)\s*[;,]/i;

        return {
            allowedTags: [...SanitizeHtml.defaults.allowedTags, "img"],
            allowedAttributes: {
                ...SanitizeHtml.defaults.allowedAttributes,
                "*": ["class", "style"]
            },
            allowedStyles: {
                "*": safeStyleProps
            },
            allowedSchemesByTag: {
                "img": ["http", "https", "data"]
            },
            transformTags: {
                "img": (tagName: string, attribs: Record<string, string>): { tagName: string; attribs: Record<string, string>; } =>
                {
                    const src = attribs["src"] as string | undefined;
                    if (src != null && /^\s*data:/i.test(src) && !safeImageDataUri.test(src))
                        delete attribs["src"];

                    return { tagName, attribs };
                }
            }
        };
    }
}