import assert from "node:assert";
import { describe, test } from "node:test";
import { BackgroundProcessor, Delay } from "../src/index.js";


await describe("BackgroundProcessor tests", async () =>
{
    await test("Should work fine (check console output)", async () =>
    {
        const bp = new BackgroundProcessor((e) =>
        {
            if ((e as any) === 4)
                throw new Error("4 is bad");
            console.log(e, "default error handler");
            return Promise.resolve();
        }, 1000, false);


        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((t) =>
        {
            bp.processAction(() =>
            {
                if ((t % 2) === 0)
                    throw t;
                console.log(t);
                return Promise.resolve();
            }, t > 5 ? async (e): Promise<void> =>
            {
                if ((e as any) === 8)
                    throw new Error("8 is also bad");
                console.log(e, "custom error handler");
            } : undefined);
        });

        console.log("delaying 5000ms");
        await Delay.milliseconds(5000);
        console.log("disposing");
        await bp.dispose();

        await Delay.seconds(8);
        assert.ok(true);
    });
});