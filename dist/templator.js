import Mustache from "mustache";
import { given } from "@nivinjoseph/n-defensive";
/**
 * A class for rendering Mustache templates with custom escaping behavior.
 * Provides functionality for template parsing, token extraction, and rendering with data objects.
 *
 * @example
 * ```typescript
 * const template = "Hello, {{name}}!";
 * const templator = new Templator(template);
 *
 * const data = { name: "World" };
 * console.log(templator.render(data)); // "Hello, World!"
 * ```
 */
export class Templator {
    _template;
    _tokens;
    /**
     * Gets the original template string.
     */
    get template() { return this._template; }
    /**
     * Gets an array of token names found in the template.
     */
    get tokens() { return this._tokens; }
    /**
     * Creates a new Templator instance with the given template string.
     *
     * @param template - The Mustache template string
     * @throws Error if the template is not a valid string
     *
     * @example
     * ```typescript
     * const template = "Hello, {{name}}!";
     * const templator = new Templator(template);
     * ```
     */
    constructor(template) {
        given(template, "template").ensureHasValue().ensureIsString();
        this._template = template;
        const tokens = Mustache.parse(this._template);
        this._tokens = tokens.filter(t => t[0] === "name").map(t => t[1]);
    }
    /**
     * Renders the template with the provided data, leaving all substitutions raw.
     *
     * Use this for plain-text contexts only (emails, logs, SMS, file paths).
     * For any HTML-bearing output, use {@link renderHtml} instead — `renderText`
     * does NOT escape `<`, `>`, `&`, `'`, `"` and will produce an XSS sink
     * if the rendered string is later injected into the DOM.
     *
     * @param data - An object containing values for the template tokens
     * @returns The rendered template string with raw (unescaped) substitutions
     * @throws Error if the data is not a valid object
     *
     * @example
     * ```typescript
     * const template = "Hello, {{name}}!";
     * const templator = new Templator(template);
     *
     * const data = { name: "World" };
     * console.log(templator.renderText(data)); // "Hello, World!"
     * ```
     */
    renderText(data) {
        given(data, "data").ensureHasValue().ensureIsObject();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Mustache.render(this._template, data, null, { escape: (t) => t });
    }
    /**
     * Renders the template with the provided data, HTML-escaping every
     * `{{token}}` substitution via Mustache's default escaper.
     *
     * Use this whenever the rendered output is placed into an HTML context
     * (innerHTML, SSR output, rendered email bodies). If a specific field
     * must render raw, use Mustache's triple-brace syntax `{{{token}}}` in
     * the template itself — that makes the opt-out explicit and reviewable.
     *
     * @param data - An object containing values for the template tokens
     * @returns The rendered template string with HTML-escaped substitutions
     * @throws Error if the data is not a valid object
     *
     * @example
     * ```typescript
     * const templator = new Templator("<div>Welcome {{name}}</div>");
     * templator.renderHtml({ name: "<script>alert(1)</script>" });
     * // "<div>Welcome &lt;script&gt;alert(1)&lt;&#x2F;script&gt;</div>"
     * ```
     */
    renderHtml(data) {
        given(data, "data").ensureHasValue().ensureIsObject();
        return Mustache.render(this._template, data);
    }
}
//# sourceMappingURL=templator.js.map