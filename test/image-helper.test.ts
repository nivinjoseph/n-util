import assert from "node:assert";
import { describe, test } from "node:test";
import "@nivinjoseph/n-ext";
import { ImageHelper } from "../src/index.js";


await describe("ImageHelper", async () =>
{
    const validPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
    const validPngPayload = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

    await describe("dataUrlToBuffer", async () =>
    {
        await describe("happy path", async () =>
        {
            await test("decodes a valid base64 PNG data URL", () =>
            {
                const buffer = ImageHelper.dataUrlToBuffer(validPng);
                assert.ok(buffer.byteLength > 0);
                assert.strictEqual(buffer.toString("base64"), validPngPayload);
            });

            await test("trims surrounding whitespace", () =>
            {
                const buffer = ImageHelper.dataUrlToBuffer(`   ${validPng}\n`);
                assert.strictEqual(buffer.toString("base64"), validPngPayload);
            });

            await test("accepts case-varied scheme and mime", () =>
            {
                const upper = `DATA:IMAGE/PNG;BASE64,${validPngPayload}`;
                const buffer = ImageHelper.dataUrlToBuffer(upper);
                assert.strictEqual(buffer.toString("base64"), validPngPayload);
            });

            await test("accepts extra media-type parameters before ;base64", () =>
            {
                const withParam = `data:image/png;charset=utf-8;base64,${validPngPayload}`;
                const buffer = ImageHelper.dataUrlToBuffer(withParam);
                assert.strictEqual(buffer.toString("base64"), validPngPayload);
            });

            await test("decodes jpeg, gif, webp, svg+xml media types (any image/*)", () =>
            {
                for (const mime of ["image/jpeg", "image/gif", "image/webp", "image/svg+xml"])
                {
                    const buffer = ImageHelper.dataUrlToBuffer(`data:${mime};base64,${validPngPayload}`);
                    assert.strictEqual(buffer.toString("base64"), validPngPayload, `failed for ${mime}`);
                }
            });
        });

        await describe("rejects malformed input", async () =>
        {
            await test("throws on null", () =>
            {
                assert.throws(() => ImageHelper.dataUrlToBuffer(null as any));
            });

            await test("throws on undefined", () =>
            {
                assert.throws(() => ImageHelper.dataUrlToBuffer(undefined as any));
            });

            await test("throws on non-string", () =>
            {
                assert.throws(() => ImageHelper.dataUrlToBuffer(123 as any));
            });

            await test("throws on empty string", () =>
            {
                assert.throws(() => ImageHelper.dataUrlToBuffer(""));
            });

            await test("throws when 'data:' prefix is missing", () =>
            {
                assert.throws(
                    () => ImageHelper.dataUrlToBuffer(`image/png;base64,${validPngPayload}`),
                    /data:/);
            });

            await test("throws when the comma separator is missing", () =>
            {
                assert.throws(
                    () => ImageHelper.dataUrlToBuffer("data:image/png;base64"),
                    /,/);
            });

            await test("throws when the comma appears inside the 'data:' prefix", () =>
            {
                // commaIdx must be > "data:".length, i.e. actual header content before comma
                assert.throws(() => ImageHelper.dataUrlToBuffer("data:,payload"));
            });
        });

        await describe("rejects non-image MIME types", async () =>
        {
            await test("throws on text/plain", () =>
            {
                assert.throws(
                    () => ImageHelper.dataUrlToBuffer("data:text/plain;base64,SGVsbG8="),
                    /image/);
            });

            await test("throws on application/octet-stream", () =>
            {
                assert.throws(
                    () => ImageHelper.dataUrlToBuffer("data:application/octet-stream;base64,SGVsbG8="),
                    /image/);
            });

            await test("throws on text/html", () =>
            {
                assert.throws(
                    () => ImageHelper.dataUrlToBuffer("data:text/html;base64,PGI+aGk8L2I+"),
                    /image/);
            });

            await test("throws on empty MIME type", () =>
            {
                assert.throws(
                    () => ImageHelper.dataUrlToBuffer(`data:;base64,${validPngPayload}`),
                    /image/);
            });
        });

        await describe("rejects non-base64 payloads", async () =>
        {
            await test("throws when ';base64' marker is absent", () =>
            {
                assert.throws(
                    () => ImageHelper.dataUrlToBuffer("data:image/png,Hello%20World"),
                    /base64/);
            });

            await test("throws on percent-encoded image payload without ;base64", () =>
            {
                assert.throws(
                    () => ImageHelper.dataUrlToBuffer("data:image/svg+xml,%3Csvg%2F%3E"),
                    /base64/);
            });
        });
    });
});