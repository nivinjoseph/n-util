import assert from "node:assert";
import { describe, test } from "node:test";
import { Observer, Delay } from "../src/index.js";


/**
 * Waits for all scheduled microtasks / nextTick callbacks to run.
 * Observer delivers notifications via `process.nextTick`, which runs
 * before the next macrotask; a zero-ms macrotask delay is sufficient.
 */
const flushDelivery = (): Promise<void> => Delay.milliseconds(0);


await describe("Observer", async () =>
{
    await describe("construction", async () =>
    {
        await test("throws on null / undefined / empty event name", () =>
        {
            assert.throws(() => new Observer<number>(null as any));
            assert.throws(() => new Observer<number>(undefined as any));
        });

        await test("exposes trimmed event name", () =>
        {
            const o = new Observer<number>("  clicked  ");
            assert.strictEqual(o.event, "clicked");
        });

        await test("starts with no subscriptions", () =>
        {
            const o = new Observer<number>("x");
            assert.strictEqual(o.hasSubscriptions, false);
        });
    });


    await describe("subscribe", async () =>
    {
        await test("returns a subscription carrying the event name", () =>
        {
            const o = new Observer<number>("changed");
            const sub = o.subscribe(() => { /* noop */ });
            assert.strictEqual(sub.event, "changed");
            assert.strictEqual(sub.isUnsubscribed, false);
        });

        await test("hasSubscriptions flips to true after subscribe", () =>
        {
            const o = new Observer<number>("x");
            o.subscribe(() => { /* noop */ });
            assert.strictEqual(o.hasSubscriptions, true);
        });

        await test("throws on null / non-function callback", () =>
        {
            const o = new Observer<number>("x");
            assert.throws(() => o.subscribe(null as any));
            assert.throws(() => o.subscribe("not a function" as any));
        });
    });


    await describe("notify", async () =>
    {
        await test("invokes every subscriber with the event data", async () =>
        {
            const o = new Observer<number>("x");
            const received: Array<number> = [];
            o.subscribe((n) => received.push(n));
            o.subscribe((n) => received.push(n * 10));

            o.notify(7);
            await flushDelivery();

            assert.deepStrictEqual(received.slice().sort((a, b) => a - b), [7, 70]);
        });

        await test("delivers asynchronously — no subscriber runs on the notify() call stack", () =>
        {
            const o = new Observer<number>("x");
            let ran = false;
            o.subscribe(() => { ran = true; });

            o.notify(1);
            assert.strictEqual(ran, false, "callback must not run synchronously inside notify()");
        });

        await test("supports void event data type", async () =>
        {
            const o = new Observer<void>("ping");
            let count = 0;
            o.subscribe(() => { count++; });

            o.notify();
            o.notify();
            await flushDelivery();

            assert.strictEqual(count, 2);
        });

        await test("is a no-op when there are no subscribers", () =>
        {
            const o = new Observer<number>("x");
            assert.doesNotThrow(() => o.notify(1));
        });

        await test("does not deliver to a subscriber that was added AFTER the notify() call", async () =>
        {
            const o = new Observer<number>("x");
            const received: Array<number> = [];
            o.subscribe((n) => received.push(n));

            o.notify(1);
            // Added between notify() and the actual nextTick delivery.
            // notify() enumerates the subscriber set synchronously on call,
            // so this subscriber is NOT part of that notification.
            o.subscribe((n) => received.push(n * 100));

            await flushDelivery();

            assert.deepStrictEqual(received, [1]);
        });
    });


    await describe("unsubscribe (single)", async () =>
    {
        await test("stops further deliveries to the cancelled subscriber", async () =>
        {
            const o = new Observer<number>("x");
            const received: Array<number> = [];
            const sub = o.subscribe((n) => received.push(n));

            o.notify(1);
            await flushDelivery();
            sub.unsubscribe();
            o.notify(2);
            await flushDelivery();

            assert.deepStrictEqual(received, [1]);
        });

        await test("flips isUnsubscribed to true on the returned subscription", () =>
        {
            const o = new Observer<number>("x");
            const sub = o.subscribe(() => { /* noop */ });
            assert.strictEqual(sub.isUnsubscribed, false);
            sub.unsubscribe();
            assert.strictEqual(sub.isUnsubscribed, true);
        });

        await test("second unsubscribe() call is a no-op", () =>
        {
            const o = new Observer<number>("x");
            const sub = o.subscribe(() => { /* noop */ });
            sub.unsubscribe();
            assert.doesNotThrow(() => sub.unsubscribe());
            assert.strictEqual(sub.isUnsubscribed, true);
        });

        await test("hasSubscriptions goes false after the last unsubscribe", () =>
        {
            const o = new Observer<number>("x");
            const sub = o.subscribe(() => { /* noop */ });
            sub.unsubscribe();
            assert.strictEqual(o.hasSubscriptions, false);
        });

        await test("only the cancelled subscriber is affected", async () =>
        {
            const o = new Observer<number>("x");
            const receivedA: Array<number> = [];
            const receivedB: Array<number> = [];
            const subA = o.subscribe((n) => receivedA.push(n));
            o.subscribe((n) => receivedB.push(n));

            subA.unsubscribe();
            o.notify(42);
            await flushDelivery();

            assert.deepStrictEqual(receivedA, []);
            assert.deepStrictEqual(receivedB, [42]);
        });
    });


    await describe("cancel (all)", async () =>
    {
        await test("terminates every active subscription", async () =>
        {
            const o = new Observer<number>("x");
            const received: Array<number> = [];
            const subs = [
                o.subscribe((n) => received.push(n)),
                o.subscribe((n) => received.push(n)),
                o.subscribe((n) => received.push(n))
            ];

            o.cancel();
            o.notify(1);
            await flushDelivery();

            assert.deepStrictEqual(received, []);
            for (const sub of subs)
                assert.strictEqual(sub.isUnsubscribed, true, "every subscription should be marked cancelled");
        });

        await test("hasSubscriptions becomes false", () =>
        {
            const o = new Observer<number>("x");
            o.subscribe(() => { /* noop */ });
            o.subscribe(() => { /* noop */ });
            o.subscribe(() => { /* noop */ });

            assert.strictEqual(o.hasSubscriptions, true);
            o.cancel();
            assert.strictEqual(o.hasSubscriptions, false);
        });

        await test("is safe to call on an observer with no subscribers", () =>
        {
            const o = new Observer<number>("x");
            assert.doesNotThrow(() => o.cancel());
        });

        await test("safely handles the iterate-while-mutate path (regression)", () =>
        {
            // The cancel() implementation snapshots keys before iterating because
            // _cancel deletes from _subMap. This locks the contract in even if
            // the internal iteration style changes.
            const o = new Observer<number>("x");
            for (let i = 0; i < 100; i++)
                o.subscribe(() => { /* noop */ });

            assert.strictEqual(o.hasSubscriptions, true);
            o.cancel();
            assert.strictEqual(o.hasSubscriptions, false);
        });

        await test("re-subscribing after cancel works normally", async () =>
        {
            const o = new Observer<number>("x");
            o.subscribe(() => { /* noop */ });
            o.cancel();

            const received: Array<number> = [];
            o.subscribe((n) => received.push(n));
            o.notify(9);
            await flushDelivery();

            assert.deepStrictEqual(received, [9]);
        });
    });
});
