import assert from "node:assert";
import { describe, test } from "node:test";
import "@nivinjoseph/n-ext";
import { Templator } from "../src/index.js";


await describe("Templator", async () =>
{
    await test("Basic test", () =>
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
        // console.log(templator.tokens);
        assert.deepStrictEqual(templator.tokens, ["firstName", "lastName", "address.street", "address.city", "address.street"]);

        const output = templator.render(data);
        assert.strictEqual(output, `Hello Mr. ${data.firstName} ${data.lastName}. Address: ${data.address.street} ${(data.address as any).city || ""} ${data.address.street}`);
    });

    await test("html escape test", () =>
    {
        const template = "{{data.title}}";
        const descriptionData = {};
        descriptionData.setValue("data.title", "CME engine optimization: Take the user's age into consideration");

        const templator = new Templator(template);
        const output = templator.render(descriptionData);

        assert.strictEqual(output, "CME engine optimization: Take the user's age into consideration");
    });
});