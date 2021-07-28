import * as SanitizeHtml from "sanitize-html";
import { given } from "@nivinjoseph/n-defensive";


export class HtmlSanitizer
{
    /**
     * @static
     */
    private constructor() { }
    
    /**
     * 
     * Returns a sanitized version of an given `html` using `sanitize-html`.
     * 
     * @param html - The html to be sanitized.
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