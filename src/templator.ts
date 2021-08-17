import * as Mustache from "mustache";
import { given } from "@nivinjoseph/n-defensive";

/**
 * @description A class used to render templates that uses the mustache syntax.
 */
export class Templator
{
    private readonly _template: string;
    private readonly _tokens: ReadonlyArray<string>;
    
    
    public get template(): string { return this._template; }
    public get tokens(): ReadonlyArray<string> { return this._tokens; }
       
    
    public constructor(template: string)
    {
        given(template, "template").ensureHasValue().ensureIsString();
        this._template = template;
        
        const tokens = Mustache.parse(this._template);
        this._tokens = tokens.filter(t => t[0] === "name").map(t => t[1]);
    }
    
    /**
     * @description Changes the interpolated HTML string and replaces the mustache tags (i.e. `{{ key... }}`) 
     * with the `data` value with the keys inside the mustache tag. Nested objects can be accessed through
     * (i.e. `{{ key1.key2... }}`)
     * 
     * @param data - The data used to replace the template. 
     * @returns The rendered template.
     */
    public render(data: Object): string
    {
        given(data, "data").ensureHasValue().ensureIsObject();
        
        return Mustache.render(this._template, data, null, { escape: (t) => t });
    }
}