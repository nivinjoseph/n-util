import assert from "node:assert";
import { describe, test } from "node:test";
import { ObjectDisposedException } from "@nivinjoseph/n-exception";
import { BackgroundProcessor, Delay } from "../src/index.js";


await describe("BackgroundProcessor", async () =>
{
    const noopErrorHandler = (): Promise<void> => Promise.resolve();


    await test("dispose() drains queued actions when killQueue=false (default)", async () =>
    {
        const bp = new BackgroundProcessor(noopErrorHandler, 10);
        const executed: Array<number> = [];

        for (let i = 1; i <= 5; i++)
            bp.processAction(async () => { executed.push(i); });

        await bp.dispose();

        assert.deepStrictEqual(executed.slice().sort((a, b) => a - b), [1, 2, 3, 4, 5]);
    });


    await test("dispose(killQueue=true) drops pending actions", async () =>
    {
        // Large break interval so the scheduler can't pick anything up before we dispose.
        const bp = new BackgroundProcessor(noopErrorHandler, 60_000, false);
        const executed: Array<number> = [];

        for (let i = 1; i <= 5; i++)
            bp.processAction(async () => { executed.push(i); });

        await bp.dispose(true);

        assert.strictEqual(executed.length, 0, `no pending action should run when killQueue=true, got: ${JSON.stringify(executed)}`);
    });


    await test("dispose() waits for in-flight actions to complete", async () =>
    {
        const bp = new BackgroundProcessor(noopErrorHandler, 10);
        let actionFinished = false;

        bp.processAction(async () =>
        {
            await Delay.milliseconds(200);
            actionFinished = true;
        });

        // Let the scheduler pick it up.
        await Delay.milliseconds(50);

        await bp.dispose();

        assert.strictEqual(actionFinished, true, "dispose() must not resolve until the in-flight action has finished");
    });


    await test("dispose() resolves promptly after the last action finishes (not via polling)", async () =>
    {
        const bp = new BackgroundProcessor(noopErrorHandler, 10);
        const actionDurationMs = 150;

        bp.processAction(async () => { await Delay.milliseconds(actionDurationMs); });
        await Delay.milliseconds(50); // let it start

        const start = Date.now();
        await bp.dispose();
        const elapsed = Date.now() - start;

        // Action has ~100ms left. Dispose should resolve shortly after — the pre-fix
        // implementation polled every 3000ms, so this threshold both proves the drain
        // works AND guards against a regression to polling.
        assert.ok(elapsed < 500, `dispose should resolve shortly after the action finishes, elapsed ${elapsed}ms`);
        assert.ok(elapsed >= 80, `dispose should at least wait for the in-flight action (~100ms remaining), elapsed ${elapsed}ms`);
    });


    await test("concurrent dispose() calls share the same drain promise", async () =>
    {
        const bp = new BackgroundProcessor(noopErrorHandler, 10);
        let finishedCount = 0;

        bp.processAction(async () =>
        {
            await Delay.milliseconds(150);
            finishedCount++;
        });
        await Delay.milliseconds(30); // let it start

        const first = bp.dispose();
        const second = bp.dispose();
        const third = bp.dispose();

        await Promise.all([first, second, third]);

        assert.strictEqual(finishedCount, 1, "the in-flight action should run exactly once");
    });


    await test("processAction() after dispose() throws ObjectDisposedException", async () =>
    {
        const bp = new BackgroundProcessor(noopErrorHandler, 10);
        await bp.dispose();

        assert.throws(
            () => bp.processAction(async () => { /* noop */ }),
            ObjectDisposedException
        );
    });


    await test("dispose() on an idle processor resolves immediately", async () =>
    {
        const bp = new BackgroundProcessor(noopErrorHandler, 10);

        const start = Date.now();
        await bp.dispose();
        const elapsed = Date.now() - start;

        assert.ok(elapsed < 50, `idle dispose should be near-instant, elapsed ${elapsed}ms`);
    });


    await test("default error handler is invoked when action rejects", async () =>
    {
        const errors: Array<Error> = [];
        const bp = new BackgroundProcessor(async (e) => { errors.push(e); }, 10);

        const failure = new Error("boom");
        bp.processAction(() => Promise.reject(failure));

        await bp.dispose();

        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], failure);
    });


    await test("custom per-action error handler takes precedence over the default", async () =>
    {
        const defaultErrors: Array<Error> = [];
        const customErrors: Array<Error> = [];
        const bp = new BackgroundProcessor(async (e) => { defaultErrors.push(e); }, 10);

        const failure = new Error("custom");
        bp.processAction(
            () => Promise.reject(failure),
            async (e) => { customErrors.push(e); }
        );

        await bp.dispose();

        assert.strictEqual(defaultErrors.length, 0, "default handler must not be invoked when a custom one is supplied");
        assert.deepStrictEqual(customErrors, [failure]);
    });


    await test("synchronous throw from action is routed to error handler", async () =>
    {
        const errors: Array<unknown> = [];
        const bp = new BackgroundProcessor(async (e) => { errors.push(e); }, 10);

        const failure = new Error("sync-throw");
        bp.processAction((() =>
        {
            throw failure;
        }) as () => Promise<void>);

        await bp.dispose();

        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], failure);
    });


    await test("queueLength reflects pending actions before they are picked up", () =>
    {
        const bp = new BackgroundProcessor(noopErrorHandler, 60_000, false);

        assert.strictEqual(bp.queueLength, 0);
        bp.processAction(async () => { /* noop */ });
        bp.processAction(async () => { /* noop */ });
        assert.strictEqual(bp.queueLength, 2);

        // Clean up without waiting — dispose(true) drops the queue.
        return bp.dispose(true);
    });
});
