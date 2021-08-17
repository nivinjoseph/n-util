import * as SanitizeHtml from "sanitize-html";
import { given } from "@nivinjoseph/n-defensive";

/**
 * @description A class used to sanitize and clean up HTML fragments.
 */
export class HtmlSanitizer
{
    /**
     * @static
     */
    private constructor() { }
    
    /**
     * @description Cleans up the HTML fragments from HTML copied from text editors therefore, sanitizing it.
     * 
     * @param html - The html to be sanitized.
     * @returns The sanitized html.
     */
    public static sanitize(html: string): string
    {
        given(html, "html").ensureHasValue().ensureIsString();

        const sanitized = SanitizeHtml(html, this.createOptions());

        return sanitized;
    }
    
    private static createOptions(): SanitizeHtml.IOptions
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