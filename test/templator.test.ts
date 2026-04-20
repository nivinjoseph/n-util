import assert from "node:assert";
import { describe, test } from "node:test";
import "@nivinjoseph/n-ext";
import { Templator } from "../src/index.js";


await describe("Templator", async () =>
{
    await test("renderText substitutes tokens", () =>
    {
        const template = "Hello Mr. {{ firstName  }} {{lastName}}. Address: {{address.street}} {{address.city}} {{address.street}}";
        const data = {
            firstName: "Nivin",
            lastName: "joseph",
            address: {
                street: "711 Kennedy"
            }
        };

        const templator = new Templator(template);
        assert.deepStrictEqual(templator.tokens, ["firstName", "lastName", "address.street", "address.city", "address.street"]);

        const output = templator.renderText(data);
        assert.strictEqual(output, `Hello Mr. ${data.firstName} ${data.lastName}. Address: ${data.address.street} ${(data.address as any).city || ""} ${data.address.street}`);
    });

    await test("renderText leaves HTML-significant characters raw", () =>
    {
        const template = "{{data.title}}";
        const descriptionData = {};
        descriptionData.setValue("data.title", "CME engine optimization: Take the user's age into consideration");

        const templator = new Templator(template);
        const output = templator.renderText(descriptionData);

        assert.strictEqual(output, "CME engine optimization: Take the user's age into consideration");
    });

    await test("renderHtml escapes HTML-significant characters in substitutions", () =>
    {
        const templator = new Templator("<div>Welcome {{name}}</div>");
        const output = templator.renderHtml({ name: "<script>alert(1)</script>" });

        assert.ok(!output.includes("<script>"), "raw <script> tag must not appear in rendered output");
        assert.ok(output.includes("&lt;script&gt;"), "opening script tag should be HTML-escaped");
        assert.ok(output.includes("&lt;&#x2F;script&gt;") || output.includes("&lt;/script&gt;"), "closing script tag should be HTML-escaped");
        assert.ok(output.startsWith("<div>Welcome ") && output.endsWith("</div>"), "template markup should pass through");
    });

    await test("renderHtml escapes quotes and apostrophes", () =>
    {
        const templator = new Templator("<a title={{title}}>x</a>");
        const output = templator.renderHtml({ title: `it's "quoted"` });

        assert.ok(!output.includes(`"quoted"`), "raw double quotes must not appear");
        assert.ok(!output.includes(`it's`), "raw apostrophe must not appear");
        assert.ok(output.includes("&quot;"), "double quote should be entity-encoded");
        assert.ok(output.includes("&#39;"), "apostrophe should be entity-encoded");
    });

    await test("renderHtml honours triple-brace opt-out for raw output", () =>
    {
        const templator = new Templator("{{{raw}}}");
        const output = templator.renderHtml({ raw: "<b>bold</b>" });

        assert.strictEqual(output, "<b>bold</b>");
    });
});