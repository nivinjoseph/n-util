import assert from "node:assert";
import { describe, test } from "node:test";
import { HtmlSanitizer } from "../src/index.js";


await describe("HtmlSanitizer", async () =>
{
    await describe("Basic Sanitization", async () =>
    {
        await test("should sanitize simple HTML and preserve safe tags", () =>
        {
            const html = "<p>Hello <b>World</b></p>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "<p>Hello <b>World</b></p>");
        });

        await test("should preserve nested safe tags", () =>
        {
            const html = "<div><p>Hello <strong><em>World</em></strong></p></div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "<div><p>Hello <strong><em>World</em></strong></p></div>");
        });

        await test("should preserve headings", () =>
        {
            const html = "<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>");
        });

        await test("should preserve links with href attribute", () =>
        {
            const html = "<a href=\"https://example.com\">Link</a>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "<a href=\"https://example.com\">Link</a>");
        });

        await test("should preserve lists", () =>
        {
            const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "<ul><li>Item 1</li><li>Item 2</li></ul>");
        });
    });

    await describe("XSS Attack Prevention", async () =>
    {
        await test("should remove script tags", () =>
        {
            const html = "<div>Hello <script>alert(\"xss\")</script>World</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "<div>Hello World</div>");
        });

        await test("should remove inline event handlers", () =>
        {
            const html = "<div onclick=\"alert('xss')\">Click me</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "<div>Click me</div>");
        });

        await test("should remove onerror event from img tags", () =>
        {
            const html = "<img src=\"x\" onerror=\"alert('xss')\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("onerror"));
            assert.ok(!sanitized.includes("alert"));
        });

        await test("should remove javascript: protocol from links", () =>
        {
            const html = "<a href=\"javascript:alert('xss')\">Click</a>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("javascript:"));
        });

        await test("should remove iframe tags", () =>
        {
            const html = "<div>Content<iframe src=\"evil.com\"></iframe></div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("iframe"));
            assert.strictEqual(sanitized, "<div>Content</div>");
        });

        await test("should remove embed tags", () =>
        {
            const html = "<div>Content<embed src=\"evil.swf\"></div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("embed"));
            assert.strictEqual(sanitized, "<div>Content</div>");
        });

        await test("should remove object tags", () =>
        {
            const html = "<div>Content<object data=\"evil.swf\"></object></div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("object"));
            assert.strictEqual(sanitized, "<div>Content</div>");
        });

        await test("should handle multiple XSS attempts", () =>
        {
            const html = `
                <div onclick="alert('xss')">
                    <script>alert('xss')</script>
                    <img src="x" onerror="alert('xss')" />
                    <a href="javascript:alert('xss')">Click</a>
                    Safe content
                </div>
            `;
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("onclick"));
            assert.ok(!sanitized.includes("script"));
            assert.ok(!sanitized.includes("onerror"));
            assert.ok(!sanitized.includes("javascript:"));
            assert.ok(sanitized.includes("Safe content"));
        });
    });

    await describe("Image Tag Support", async () =>
    {
        await test("should preserve img tags with http URLs", () =>
        {
            const html = "<img src=\"http://example.com/image.jpg\" alt=\"Test\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("img"));
            assert.ok(sanitized.includes("src=\"http://example.com/image.jpg\""));
        });

        await test("should preserve img tags with https URLs", () =>
        {
            const html = "<img src=\"https://example.com/image.jpg\" alt=\"Test\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("img"));
            assert.ok(sanitized.includes("src=\"https://example.com/image.jpg\""));
        });

        await test("should preserve img tags with data URLs", () =>
        {
            const html = "<img src=\"data:image/png;base64,iVBORw0KG\" alt=\"Test\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("img"));
            assert.ok(sanitized.includes("data:image/png;base64"));
        });

        await test("should preserve img alt attribute", () =>
        {
            const html = "<img src=\"https://example.com/image.jpg\" alt=\"Description\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("alt=\"Description\""));
        });
    });

    await describe("Style and Class Attributes", async () =>
    {
        await test("should preserve class attribute on div", () =>
        {
            const html = "<div class=\"container\">Content</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "<div class=\"container\">Content</div>");
        });

        await test("should preserve style attribute on div", () =>
        {
            const html = "<div style=\"color: red;\">Content</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            // Note: sanitize-html normalizes CSS formatting
            assert.ok(sanitized.includes("style="));
            assert.ok(sanitized.includes("color"));
            assert.ok(sanitized.includes("red"));
        });

        await test("should preserve class attribute on paragraph", () =>
        {
            const html = "<p class=\"text-bold\">Text</p>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "<p class=\"text-bold\">Text</p>");
        });

        await test("should preserve style attribute on span", () =>
        {
            const html = "<span style=\"font-weight: bold;\">Bold</span>";
            const sanitized = HtmlSanitizer.sanitize(html);
            // Note: sanitize-html normalizes CSS formatting
            assert.ok(sanitized.includes("style="));
            assert.ok(sanitized.includes("font-weight"));
            assert.ok(sanitized.includes("bold"));
        });

        await test("should preserve both class and style attributes", () =>
        {
            const html = "<div class=\"container\" style=\"margin: 10px;\">Content</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("class=\"container\""));
            assert.ok(sanitized.includes("style="));
            assert.ok(sanitized.includes("margin"));
        });

        await test("should preserve style on img tag", () =>
        {
            const html = "<img src=\"https://example.com/image.jpg\" style=\"width: 100px;\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("style="));
            assert.ok(sanitized.includes("width"));
        });

        await test("should preserve class on img tag", () =>
        {
            const html = "<img src=\"https://example.com/image.jpg\" class=\"responsive\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("class=\"responsive\""));
        });
    });

    await describe("Complex HTML Structures", async () =>
    {
        await test("should sanitize complex nested HTML", () =>
        {
            const html = `
                <div class="content" style="padding: 20px;">
                    <h1>Hello World</h1>
                    <p>This is <b>bold</b> text with <a href="https://example.com">a link</a></p>
                    <img src="https://example.com/image.jpg" alt="Example" style="width: 100px;">
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                    </ul>
                </div>
            `;
            const sanitized = HtmlSanitizer.sanitize(html);

            assert.ok(sanitized.includes("div"));
            assert.ok(sanitized.includes("h1"));
            assert.ok(sanitized.includes("Hello World"));
            assert.ok(sanitized.includes("<b>bold</b>"));
            assert.ok(sanitized.includes("href=\"https://example.com\""));
            assert.ok(sanitized.includes("img"));
            assert.ok(sanitized.includes("ul"));
            assert.ok(sanitized.includes("li"));
            assert.ok(sanitized.includes("class=\"content\""));
            assert.ok(sanitized.includes("style="));
            assert.ok(sanitized.includes("padding"));
        });

        await test("should handle mixed safe and unsafe content", () =>
        {
            const html = `
                <div class="wrapper">
                    <h1>Title</h1>
                    <script>alert('xss')</script>
                    <p onclick="alert('xss')">Paragraph</p>
                    <a href="https://example.com">Safe Link</a>
                    <a href="javascript:alert('xss')">Unsafe Link</a>
                </div>
            `;
            const sanitized = HtmlSanitizer.sanitize(html);

            assert.ok(sanitized.includes("<h1>Title</h1>"));
            assert.ok(sanitized.includes("<p>Paragraph</p>"));
            assert.ok(sanitized.includes("href=\"https://example.com\""));
            assert.ok(!sanitized.includes("script"));
            assert.ok(!sanitized.includes("onclick"));
            assert.ok(!sanitized.includes("javascript:"));
        });
    });

    await describe("Edge Cases", async () =>
    {
        await test("should throw error for empty string", () =>
        {
            const html = "";
            assert.throws(() =>
            {
                HtmlSanitizer.sanitize(html);
            });
        });

        await test("should handle plain text without HTML tags", () =>
        {
            const html = "Just plain text";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "Just plain text");
        });

        await test("should throw error for HTML with only whitespace", () =>
        {
            const html = "   \n\t  ";
            assert.throws(() =>
            {
                HtmlSanitizer.sanitize(html);
            });
        });

        await test("should handle self-closing tags", () =>
        {
            const html = "<br /><hr />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("br"));
            assert.ok(sanitized.includes("hr"));
        });

        await test("should handle malformed HTML gracefully", () =>
        {
            const html = "<div><p>Unclosed paragraph<div>Another div</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("Unclosed paragraph"));
            assert.ok(sanitized.includes("Another div"));
        });

        await test("should preserve HTML entities", () =>
        {
            const html = "<p>&lt;script&gt;alert('test')&lt;/script&gt;</p>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("&lt;") || sanitized.includes("<"));
            assert.ok(sanitized.includes("&gt;") || sanitized.includes(">"));
        });

        await test("should handle special characters", () =>
        {
            const html = "<p>Price: $100 & €50</p>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("$100"));
            assert.ok(sanitized.includes("€50"));
        });
    });

    await describe("Error Handling", async () =>
    {
        await test("should throw error for null input", () =>
        {
            assert.throws(() =>
            {
                HtmlSanitizer.sanitize(null as any);
            });
        });

        await test("should throw error for undefined input", () =>
        {
            assert.throws(() =>
            {
                HtmlSanitizer.sanitize(undefined as any);
            });
        });

        await test("should throw error for non-string input", () =>
        {
            assert.throws(() =>
            {
                HtmlSanitizer.sanitize(123 as any);
            });
        });

        await test("should throw error for object input", () =>
        {
            assert.throws(() =>
            {
                HtmlSanitizer.sanitize({} as any);
            });
        });

        await test("should throw error for array input", () =>
        {
            assert.throws(() =>
            {
                HtmlSanitizer.sanitize([] as any);
            });
        });
    });

    await describe("Dangerous CSS Prevention", async () =>
    {
        await test("should strip position property (clickjacking vector)", () =>
        {
            const html = "<div style=\"position: fixed; top: 0; left: 0; width: 100%; height: 100%;\">overlay</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("position"), `position should be stripped, got: ${sanitized}`);
            assert.ok(!sanitized.includes("top:") && !sanitized.includes("top ") || !sanitized.match(/\btop\b\s*:/), "top should be stripped");
            assert.ok(!sanitized.match(/\bleft\b\s*:/), "left should be stripped");
        });

        await test("should strip z-index (clickjacking vector)", () =>
        {
            const html = "<div style=\"z-index: 9999;\">overlay</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("z-index"), `z-index should be stripped, got: ${sanitized}`);
        });

        await test("should strip transform (clickjacking vector)", () =>
        {
            const html = "<div style=\"transform: translate(100px, 100px);\">moved</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("transform"), `transform should be stripped, got: ${sanitized}`);
        });

        await test("should strip opacity (UI-spoofing vector)", () =>
        {
            const html = "<div style=\"opacity: 0.01;\">invisible</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("opacity"), `opacity should be stripped, got: ${sanitized}`);
        });

        await test("should strip background-image (url() exfil vector)", () =>
        {
            const html = "<div style=\"background-image: url(https://evil.example/leak);\">x</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("background-image"), `background-image should be stripped, got: ${sanitized}`);
            assert.ok(!sanitized.includes("evil.example"), "url target should not leak into output");
        });

        await test("should strip background shorthand (url() exfil vector)", () =>
        {
            const html = "<div style=\"background: url(https://evil.example/leak) no-repeat;\">x</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.match(/background\s*:/), `background shorthand should be stripped, got: ${sanitized}`);
            assert.ok(!sanitized.includes("evil.example"), "url target should not leak into output");
        });

        await test("should strip cursor (url() exfil vector)", () =>
        {
            const html = "<div style=\"cursor: url(https://evil.example/c.cur), auto;\">x</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("cursor"), `cursor should be stripped, got: ${sanitized}`);
            assert.ok(!sanitized.includes("evil.example"));
        });

        await test("should strip content (url() / attr() exfil vector)", () =>
        {
            const html = "<div style=\"content: url(https://evil.example/x);\">x</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.match(/\bcontent\s*:/), `content should be stripped, got: ${sanitized}`);
        });

        await test("should strip filter (SVG-filter url() exfil vector)", () =>
        {
            const html = "<div style=\"filter: url(https://evil.example/f.svg#x);\">x</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("filter"), `filter should be stripped, got: ${sanitized}`);
        });

        await test("should reject display:<arbitrary> outside tight enum", () =>
        {
            const html = "<div style=\"display: -webkit-box; color: red;\">x</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("-webkit-box"), `exotic display value should be rejected, got: ${sanitized}`);
            assert.ok(sanitized.includes("color"), "safe sibling properties should survive");
        });

        await test("should accept safe typography alongside rejected dangerous props", () =>
        {
            const html = "<div style=\"color: red; position: fixed; padding: 10px; z-index: 5;\">mix</div>";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("color"), "color should be preserved");
            assert.ok(sanitized.includes("red"), "color value should be preserved");
            assert.ok(sanitized.includes("padding"), "padding should be preserved");
            assert.ok(!sanitized.includes("position"), "position should be stripped");
            assert.ok(!sanitized.includes("z-index"), "z-index should be stripped");
        });
    });

    await describe("Image data URI allowlist", async () =>
    {
        await test("should strip src for SVG data URI (script-bearing payload)", () =>
        {
            // base64("<svg xmlns='http://www.w3.org/2000/svg' onload='alert(1)'/>")
            const payload = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIG9ubG9hZD0nYWxlcnQoMSknLz4=";
            const html = `<img src="${payload}" alt="x" />`;
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("data:image/svg"), `SVG data URI should be stripped, got: ${sanitized}`);
            assert.ok(!sanitized.includes("onload"), "no onload should leak through");
            assert.ok(!sanitized.includes("alert"), "no alert should leak through");
        });

        await test("should strip src for plain (non-base64) SVG data URI", () =>
        {
            const payload = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' onload='alert(1)'/>";
            const html = `<img src="${payload}" />`;
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("data:image/svg"), `SVG data URI should be stripped, got: ${sanitized}`);
            assert.ok(!sanitized.includes("onload"));
        });

        await test("should strip src for text/html data URI", () =>
        {
            const payload = "data:text/html,<script>alert(1)</script>";
            const html = `<img src="${payload}" />`;
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("text/html"), `text/html data URI should be stripped, got: ${sanitized}`);
        });

        await test("should strip src for application/xhtml+xml data URI", () =>
        {
            const payload = "data:application/xhtml+xml;base64,PGh0bWw+PC9odG1sPg==";
            const html = `<img src="${payload}" />`;
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("application/xhtml"), `xhtml data URI should be stripped, got: ${sanitized}`);
        });

        await test("should preserve PNG data URI", () =>
        {
            const payload = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
            const html = `<img src="${payload}" alt="px" />`;
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("data:image/png"), `PNG data URI should survive, got: ${sanitized}`);
        });

        await test("should preserve JPEG data URI (both jpeg and jpg spellings)", () =>
        {
            const jpeg = "<img src=\"data:image/jpeg;base64,/9j/4AAQSkZJRg==\" />";
            const jpg = "<img src=\"data:image/jpg;base64,/9j/4AAQSkZJRg==\" />";
            assert.ok(HtmlSanitizer.sanitize(jpeg).includes("data:image/jpeg"), "jpeg should survive");
            assert.ok(HtmlSanitizer.sanitize(jpg).includes("data:image/jpg"), "jpg should survive");
        });

        await test("should preserve GIF and WebP data URIs", () =>
        {
            const gif = "<img src=\"data:image/gif;base64,R0lGODlhAQABAAAAACw=\" />";
            const webp = "<img src=\"data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAv\" />";
            assert.ok(HtmlSanitizer.sanitize(gif).includes("data:image/gif"));
            assert.ok(HtmlSanitizer.sanitize(webp).includes("data:image/webp"));
        });

        await test("should not affect http/https image URLs", () =>
        {
            const html = "<img src=\"https://example.com/photo.jpg\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("https://example.com/photo.jpg"));
        });

        await test("should not be fooled by case-varied SVG MIME type", () =>
        {
            const html = "<img src=\"DATA:IMAGE/SVG+XML,<svg onload=alert(1)/>\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.toLowerCase().includes("svg"), `case-varied SVG should still be stripped, got: ${sanitized}`);
        });

        await test("should not be fooled by leading whitespace in data URI", () =>
        {
            const html = "<img src=\"   data:image/svg+xml,<svg onload=alert(1)/>\" />";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(!sanitized.includes("svg"), `leading-whitespace SVG should be stripped, got: ${sanitized}`);
        });

        await test("should preserve non-src attributes on stripped-src img", () =>
        {
            const payload = "data:image/svg+xml,<svg onload=alert(1)/>";
            const html = `<img src="${payload}" alt="keep me" class="keep-me" />`;
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.ok(sanitized.includes("alt=\"keep me\""), "alt should survive even when src is stripped");
            assert.ok(sanitized.includes("class=\"keep-me\""), "class should survive even when src is stripped");
            assert.ok(!sanitized.includes("data:image/svg"));
        });
    });

    await describe("Shared-state isolation", async () =>
    {
        await test("should not mutate sanitize-html library defaults", async () =>
        {
            const sanitizeHtml = (await import("sanitize-html")).default;
            const before = JSON.parse(JSON.stringify(sanitizeHtml.defaults.allowedAttributes));

            HtmlSanitizer.sanitize("<div class=\"x\" style=\"color: red;\">hi</div>");

            const after = JSON.parse(JSON.stringify(sanitizeHtml.defaults.allowedAttributes));
            assert.deepStrictEqual(after, before, "HtmlSanitizer must not mutate sanitize-html shared defaults");
            assert.ok(!("*" in sanitizeHtml.defaults.allowedAttributes), "wildcard '*' key should not leak into shared defaults");
        });
    });

    await describe("Real World Examples", async () =>
    {
        await test("should sanitize user comment with XSS attempt", () =>
        {
            const html = "Great article! <script>steal_cookies()</script> Thanks for sharing.";
            const sanitized = HtmlSanitizer.sanitize(html);
            assert.strictEqual(sanitized, "Great article!  Thanks for sharing.");
        });

        await test("should sanitize blog post with images", () =>
        {
            const html = `
                <div class="post">
                    <h2 class="title">My Blog Post</h2>
                    <p>Check out this image:</p>
                    <img src="https://example.com/photo.jpg" alt="Photo" class="featured" style="max-width: 100%;" />
                    <p>Hope you enjoyed it!</p>
                </div>
            `;
            const sanitized = HtmlSanitizer.sanitize(html);

            assert.ok(sanitized.includes("class=\"post\""));
            assert.ok(sanitized.includes("class=\"title\""));
            assert.ok(sanitized.includes("My Blog Post"));
            assert.ok(sanitized.includes("img"));
            assert.ok(sanitized.includes("src=\"https://example.com/photo.jpg\""));
            assert.ok(sanitized.includes("alt=\"Photo\""));
            assert.ok(sanitized.includes("class=\"featured\""));
        });

        await test("should sanitize email signature", () =>
        {
            const html = `
                <div>
                    <p><strong>John Doe</strong></p>
                    <p><em>Software Engineer</em></p>
                    <p><a href="mailto:john@example.com">john@example.com</a></p>
                </div>
            `;
            const sanitized = HtmlSanitizer.sanitize(html);

            assert.ok(sanitized.includes("<strong>John Doe</strong>"));
            assert.ok(sanitized.includes("<em>Software Engineer</em>"));
            assert.ok(sanitized.includes("href=\"mailto:john@example.com\""));
        });

        await test("should sanitize rich text editor output", () =>
        {
            const html = `
                <h1 style="text-align: center;">Document Title</h1>
                <p class="intro">This is the introduction paragraph.</p>
                <ul>
                    <li>First point</li>
                    <li>Second point with <strong>emphasis</strong></li>
                </ul>
                <blockquote>This is a quote</blockquote>
                <p>Visit <a href="https://example.com">our website</a> for more.</p>
            `;
            const sanitized = HtmlSanitizer.sanitize(html);

            assert.ok(sanitized.includes("h1"));
            assert.ok(sanitized.includes("style="));
            assert.ok(sanitized.includes("text-align"));
            assert.ok(sanitized.includes("class=\"intro\""));
            assert.ok(sanitized.includes("ul"));
            assert.ok(sanitized.includes("li"));
            assert.ok(sanitized.includes("strong"));
            assert.ok(sanitized.includes("blockquote"));
            assert.ok(sanitized.includes("href=\"https://example.com\""));
        });
    });
});

