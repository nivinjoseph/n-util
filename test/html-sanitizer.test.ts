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

