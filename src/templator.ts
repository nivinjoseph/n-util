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
export class Templator
{
    private readonly _template: string;
    private readonly _tokens: ReadonlyArray<string>;


    /**
     * Gets the original template string.
     */
    public get template(): string { return this._template; }


    /**
     * Gets an array of token names found in the template.
     */
    public get tokens(): ReadonlyArray<string> { return this._tokens; }


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
    public constructor(template: string)
    {
        given(template, "template").ensureHasValue().ensureIsString();
        this._template = template;

        const tokens = Mustache.parse(this._template);
        this._tokens = tokens.filter(t => t[0] === "name").map(t => t[1]);
    }


    /**
     * Renders the template with the provided data.
     * 
     * @param data - An object containing values for the template tokens
     * @returns The rendered template string
     * @throws Error if the data is not a valid object
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
    public render(data: Object): string
    {
        given(data, "data").ensureHasValue().ensureIsObject();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Mustache.render(this._template, data, null as any, { escape: (t) => t });
    }
}