import assert from "node:assert";
import { describe, test } from "node:test";
import { DisposableWrapper } from "../src/index.js";


await describe("DisposableWrapper", async () =>
{
    await describe("construction", async () =>
    {
        await test("throws on null disposeFunc", () =>
        {
            assert.throws(() => new DisposableWrapper(null as any));
        });

        await test("throws on undefined disposeFunc", () =>
        {
            assert.throws(() => new DisposableWrapper(undefined as any));
        });

        await test("throws on non-function disposeFunc", () =>
        {
            assert.throws(() => new DisposableWrapper(42 as any));
        });
    });


    await describe("happy path", async () =>
    {
        await test("invokes the disposeFunc once on first dispose()", async () =>
        {
            let callCount = 0;
            const d = new DisposableWrapper(async () => { callCount++; });

            await d.dispose();

            assert.strictEqual(callCount, 1);
        });

        await test("repeat dispose() calls do not re-invoke disposeFunc", async () =>
        {
            let callCount = 0;
            const d = new DisposableWrapper(async () => { callCount++; });

            await d.dispose();
            await d.dispose();
            await d.dispose();

            assert.strictEqual(callCount, 1);
        });

        await test("all callers receive the same promise instance", async () =>
        {
            const d = new DisposableWrapper(async () => { /* noop */ });
            const a = d.dispose();
            const b = d.dispose();

            assert.strictEqual(a, b, "subsequent dispose() calls must return the exact same promise");
        });

        await test("concurrent callers before completion all observe resolution", async () =>
        {
            let resolveInner!: () => void;
            const d = new DisposableWrapper(() => new Promise<void>((r) => { resolveInner = r; }));

            const pA = d.dispose();
            const pB = d.dispose();
            resolveInner();

            await Promise.all([pA, pB]);
            // If we reach here both resolved — assertion is the absence of timeout/throw.
        });
    });


    await describe("async rejection", async () =>
    {
        await test("first dispose() surfaces the rejection", async () =>
        {
            const boom = new Error("async boom");
            const d = new DisposableWrapper(async () => { throw boom; });

            await assert.rejects(() => d.dispose(), (err) => err === boom);
        });

        await test("second dispose() returns the same rejected promise (same rejection reason)", async () =>
        {
            const boom = new Error("async boom");
            const d = new DisposableWrapper(async () => { throw boom; });

            const first = d.dispose();
            const second = d.dispose();

            assert.strictEqual(first, second, "repeat dispose must return the identical promise");
            await assert.rejects(() => first, (err) => err === boom);
            await assert.rejects(() => second, (err) => err === boom);
        });

        await test("disposeFunc is still called only once despite rejection", async () =>
        {
            let callCount = 0;
            const d = new DisposableWrapper(async () =>
            {
                callCount++;
                throw new Error("x");
            });

            try
            {
                await d.dispose();
            }
            catch { /* swallow */ }

            try
            {
                await d.dispose();
            }
            catch { /* swallow */ }

            assert.strictEqual(callCount, 1);
        });
    });


    await describe("synchronous throw (regression for issue #16)", async () =>
    {
        await test("first dispose() returns a rejected promise, not a sync throw", async () =>
        {
            const boom = new Error("sync boom");
            const d = new DisposableWrapper((() =>
            {
                throw boom;
            }) as () => Promise<void>);

            const returned = d.dispose();

            // Before the fix, the sync throw escaped dispose() entirely; after,
            // it's converted to a rejected promise so the declared return type
            // matches reality.
            assert.ok(returned instanceof Promise, "dispose() must always return a Promise");
            await assert.rejects(() => returned, (err) => err === boom);
        });

        await test("second dispose() returns the same rejected promise (not null)", async () =>
        {
            const boom = new Error("sync boom");
            const d = new DisposableWrapper((() =>
            {
                throw boom;
            }) as () => Promise<void>);

            const first = d.dispose();
            const second = d.dispose();

            assert.strictEqual(first, second, "repeat dispose must return the identical promise");
            // null-returning regression would make `.then` throw TypeError here:
            assert.ok(typeof second.then === "function", "second dispose() must return a real Promise, not null");
            await assert.rejects(() => second, (err) => err === boom);
        });

        await test("sync throw in disposeFunc still invokes the function only once", async () =>
        {
            let callCount = 0;
            const d = new DisposableWrapper((() =>
            {
                callCount++;
                throw new Error("x");
            }) as () => Promise<void>);

            try
            {
                await d.dispose();
            }
            catch { /* swallow */ }

            try
            {
                await d.dispose();
            }
            catch { /* swallow */ }

            assert.strictEqual(callCount, 1);
        });
    });
});
