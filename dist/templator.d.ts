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
export declare class Templator {
    private readonly _template;
    private readonly _tokens;
    /**
     * Gets the original template string.
     */
    get template(): string;
    /**
     * Gets an array of token names found in the template.
     */
    get tokens(): ReadonlyArray<string>;
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
    constructor(template: string);
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
    render(data: object): string;
}
//# sourceMappingURL=templator.d.ts.map