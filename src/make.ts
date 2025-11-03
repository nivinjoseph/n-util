import { given } from "@nivinjoseph/n-defensive";

/**
 * Utility class providing various helper methods for common programming patterns
 * including retry logic, async/sync conversion, error handling, and random value generation.
 *
 * @example
 * ```typescript
 * // Retry example
 * const retryFetch = Make.retry(fetchData, 3);
 * const data = await retryFetch("https://api.example.com/data");
 *
 * // Random generation example
 * const code = Make.randomCode(8);
 * ```
 */
export abstract class Make // static class
{
    /**
     * Private constructor to prevent instantiation.
     * @static
     */
    private constructor() { }


    /**
     * Creates a retry wrapper for an async function that will retry the operation
     * a specified number of times if it fails.
     *
     * @template T - The return type of the function
     * @param func - The async function to retry
     * @param numberOfRetries - Number of retry attempts
     * @param errorPredicate - Optional function to determine if an error should trigger a retry
     * @returns A new function that wraps the original with retry logic
     *
     * @example
     * ```typescript
     * const retryFetch = Make.retry(fetchData, 3);
     * const data = await retryFetch("https://api.example.com/data");
     * ```
     */
    public static retry<T>(func: (...params: Array<any>) => Promise<T>, numberOfRetries: number, errorPredicate?: (error: any) => boolean): (...params: Array<any>) => Promise<T>
    {
        given(func, "func").ensureHasValue().ensureIsFunction();
        given(numberOfRetries, "numberOfRetries").ensureHasValue().ensureIsNumber().ensure(t => t > 0);
        given(errorPredicate, "errorPredicate").ensureIsFunction();

        const numberOfAttempts = numberOfRetries + 1;

        const result = async function (...p: Array<any>): Promise<T>
        {
            let successful = false;
            let attempts = 0;

            let funcResult: any;
            let error: any;

            while (successful === false && attempts < numberOfAttempts)
            {
                attempts++;

                try
                {
                    funcResult = await func(...p);
                    successful = true;
                }
                catch (err)
                {
                    error = err;
                    if (errorPredicate && !errorPredicate(error))
                        break;
                }
            }

            if (successful)
                return funcResult as T;

            throw error;
        };

        return result;
    }

    /**
     * Creates a retry wrapper with a fixed delay between attempts.
     *
     * @template T - The return type of the function
     * @param func - The async function to retry
     * @param numberOfRetries - Number of retry attempts
     * @param delayMS - Delay in milliseconds between attempts
     * @param errorPredicate - Optional function to determine if an error should trigger a retry
     * @returns A new function that wraps the original with retry and delay logic
     *
     * @example
     * ```typescript
     * const retryWithDelay = Make.retryWithDelay(fetchData, 3, 1000);
     * const data = await retryWithDelay("https://api.example.com/data");
     * ```
     */
    public static retryWithDelay<T>(func: (...params: Array<any>) => Promise<T>, numberOfRetries: number, delayMS: number, errorPredicate?: (error: any) => boolean): (...params: Array<any>) => Promise<T>
    {
        given(func, "func").ensureHasValue().ensureIsFunction();
        given(numberOfRetries, "numberOfRetries").ensureHasValue().ensureIsNumber().ensure(t => t > 0);
        given(errorPredicate, "errorPredicate").ensureIsFunction();

        const numberOfAttempts = numberOfRetries + 1;

        const result = async function (...p: Array<any>): Promise<T>
        {
            let successful = false;
            let attempts = 0;

            let funcResult: any;
            let error: any;

            const executeWithDelay = (delay: number): Promise<unknown> =>
            {
                return new Promise((resolve, reject) =>
                {
                    setTimeout(() =>
                    {
                        func(...p)
                            .then(t => resolve(t))
                            .catch(err => reject(err));
                    }, delay);
                });

            };

            while (successful === false && attempts < numberOfAttempts)
            {
                attempts++;

                try
                {
                    funcResult = await executeWithDelay(attempts === 1 ? 0 : delayMS);
                    successful = true;
                }
                catch (err)
                {
                    error = err;
                    if (errorPredicate && !errorPredicate(error))
                        break;
                }
            }

            if (successful)
                return funcResult as T;

            throw error;
        };

        return result;
    }

    /**
     * Creates a retry wrapper with exponential backoff between attempts.
     *
     * @template T - The return type of the function
     * @param func - The async function to retry
     * @param numberOfRetries - Number of retry attempts
     * @param errorPredicate - Optional function to determine if an error should trigger a retry
     * @returns A new function that wraps the original with exponential backoff retry logic
     *
     * @example
     * ```typescript
     * const retryWithBackoff = Make.retryWithExponentialBackoff(fetchData, 3);
     * const data = await retryWithBackoff("https://api.example.com/data");
     * ```
     */
    public static retryWithExponentialBackoff<T>(func: (...params: Array<any>) => Promise<T>, numberOfRetries: number, errorPredicate?: (error: any) => boolean): (...params: Array<any>) => Promise<T>
    {
        given(func, "func").ensureHasValue().ensureIsFunction();
        given(numberOfRetries, "numberOfRetries").ensureHasValue().ensureIsNumber().ensure(t => t > 0);
        given(errorPredicate, "errorPredicate").ensureIsFunction();

        const numberOfAttempts = numberOfRetries + 1;

        const result = async function (...p: Array<any>): Promise<T>
        {
            let successful = false;
            let attempts = 0;
            let delayMS = 0;

            let funcResult: any;
            let error: any;

            const executeWithDelay = (delay: number): Promise<unknown> =>
            {
                return new Promise((resolve, reject) =>
                {
                    setTimeout(() =>
                    {
                        func(...p)
                            .then(t => resolve(t))
                            .catch(err => reject(err));
                    }, delay);
                });

            };

            while (successful === false && attempts < numberOfAttempts)
            {
                attempts++;

                try
                {
                    funcResult = await executeWithDelay(delayMS);
                    successful = true;
                }
                catch (err)
                {
                    error = err;
                    if (errorPredicate && !errorPredicate(error))
                        break;
                    // delayMS = (delayMS + Make.getRandomInt(200, 500)) * attempts;
                    delayMS = delayMS + (Make.randomInt(400, 700) * attempts);
                    // delayMS = 1000 * attempts;
                }
            }

            if (successful)
                return funcResult as T;

            throw error;
        };

        return result;
    }

    /**
     * Converts a synchronous function to an async function.
     *
     * @template T - The return type of the function
     * @param func - The synchronous function to convert
     * @returns An async version of the function
     *
     * @example
     * ```typescript
     * const syncFunc = (x) => x * 2;
     * const asyncFunc = Make.syncToAsync(syncFunc);
     * const result = await asyncFunc(5); // 10
     * ```
     */
    public static syncToAsync<T>(func: (...params: Array<any>) => T): (...params: Array<any>) => Promise<T>
    {
        given(func, "func").ensureHasValue().ensureIsFunction();

        const result = function (...p: Array<any>): Promise<T>
        {
            try
            {
                const val = func(...p);
                return Promise.resolve(val);
            }
            catch (error)
            {
                return Promise.reject(error);
            }
        };

        return result;
    }

    /**
     * Converts a callback-style function to a promise-based function.
     *
     * @template T - The return type of the promise
     * @param func - The callback-style function to convert
     * @returns A promise-based version of the function
     *
     * @example
     * ```typescript
     * const callbackFunc = (x, callback) => callback(null, x * 2);
     * const promiseFunc = Make.callbackToPromise(callbackFunc);
     * const result = await promiseFunc(5); // 10
     * ```
     */
    public static callbackToPromise<T>(func: (...params: Array<any>) => void): (...params: Array<any>) => Promise<T>
    {
        given(func, "func").ensureHasValue().ensureIsFunction();

        const result = function (...p: Array<any>): Promise<T>
        {
            const promise = new Promise<T | undefined>((resolve, reject) =>
                func(...p, (err: Error | null, ...values: Array<any>) =>
                    err
                        ? reject(err)
                        : values.length === 0
                            ? resolve(undefined)
                            : values.length === 1
                                ? resolve(values[0])
                                : resolve(values as unknown as T)));

            return promise as Promise<T>;
        };

        return result;
    }

    /**
     * Executes a function a specified number of times.
     *
     * @param func - The function to execute
     * @param numberOfTimes - Number of times to execute the function
     *
     * @example
     * ```typescript
     * Make.loop((index) => console.log(index), 5);
     * ```
     */
    public static loop(func: (index: number) => void, numberOfTimes: number): void
    {
        given(func, "func").ensureHasValue().ensureIsFunction();
        given(numberOfTimes, "numberOfTimes").ensureHasValue().ensureIsNumber().ensure(t => t > 0);

        for (let i = 0; i < numberOfTimes; i++)
            func(i);
    }

    /**
     * Executes an async function multiple times with optional parallelism.
     *
     * @param asyncFunc - The async function to execute
     * @param numberOfTimes - Number of times to execute the function
     * @param degreesOfParallelism - Optional number of concurrent executions
     *
     * @example
     * ```typescript
     * await Make.loopAsync(async (index) => {
     *     await processItem(index);
     * }, 10, 3); // Process 10 items with max 3 concurrent
     * ```
     */
    public static async loopAsync(asyncFunc: (index: number) => Promise<void>, numberOfTimes: number, degreesOfParallelism?: number): Promise<void>
    {
        given(asyncFunc, "asyncFunc").ensureHasValue().ensureIsFunction();
        given(numberOfTimes, "numberOfTimes").ensureHasValue().ensureIsNumber().ensure(t => t > 0);

        const taskManager = new TaskManager<void>(numberOfTimes, asyncFunc, degreesOfParallelism ?? null, false);
        await taskManager.execute();
    }

    /**
     * Creates an error-suppressed version of a function that returns a default value on error.
     *
     * @template T - The function type
     * @template U - The return type
     * @param func - The function to wrap
     * @param defaultValue - Optional default value to return on error
     * @returns An error-suppressed version of the function
     *
     * @example
     * ```typescript
     * const safeFunc = Make.errorSuppressed(riskyFunc, "default");
     * const result = safeFunc(); // Returns "default" if error occurs
     * ```
     */
    public static errorSuppressed<T extends (...params: Array<any>) => U, U>(func: T, defaultValue: U | null = null): T
    {
        given(func, "func").ensureHasValue().ensureIsFunction();

        const result = function (...p: Array<any>): any
        {
            try
            {
                return func(...p);
            }
            catch (e)
            {
                console.error(e);
                return defaultValue;
            }
        };

        return result as T;
    }

    /**
     * Creates an error-suppressed version of an async function that returns a default value on error.
     *
     * @template T - The function type
     * @template U - The return type
     * @param asyncFunc - The async function to wrap
     * @param defaultValue - Optional default value to return on error
     * @returns An error-suppressed version of the async function
     *
     * @example
     * ```typescript
     * const safeAsyncFunc = Make.errorSuppressedAsync(riskyAsyncFunc, "default");
     * const result = await safeAsyncFunc(); // Returns "default" if error occurs
     * ```
     */
    public static errorSuppressedAsync<T extends (...params: Array<any>) => Promise<U>, U>(asyncFunc: T, defaultValue: U | null = null): T
    {
        given(asyncFunc, "asyncFunc").ensureHasValue().ensureIsFunction();

        const result = async function (...p: Array<any>): Promise<any>
        {
            try
            {
                return await asyncFunc(...p);
            }
            catch (e)
            {
                console.error(e);
                return defaultValue;
            }
        };

        return result as T;
    }

    /**
     * Generates a random integer between min (inclusive) and max (exclusive).
     *
     * @param min - Minimum value (inclusive)
     * @param max - Maximum value (exclusive)
     * @returns A random integer
     *
     * @example
     * ```typescript
     * const random = Make.randomInt(1, 100); // 1 to 99
     * ```
     */
    public static randomInt(min: number, max: number): number
    {
        given(min, "min").ensureHasValue().ensureIsNumber();
        given(max, "max").ensureHasValue().ensureIsNumber()
            .ensure(t => t > min, "value has to be greater than min");

        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
    }

    /**
     * Generates a random alphanumeric code of specified length.
     *
     * @param numChars - Number of characters in the code
     * @returns A random alphanumeric string
     *
     * @example
     * ```typescript
     * const code = Make.randomCode(8); // 8-character code
     * ```
     */
    public static randomCode(numChars: number): string
    {
        given(numChars, "numChars").ensureHasValue().ensureIsNumber()
            .ensure(t => t > 0, "value has to be greater than 0");

        // let allowedChars = "0123456789-abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ~".split("");
        let allowedChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

        const shuffleTimes = Make.randomInt(1, 10);
        const shuffleAmount = Make.randomInt(7, 17);
        Make.loop(() => allowedChars = [...allowedChars.skip(shuffleAmount), ...allowedChars.take(shuffleAmount)],
            shuffleTimes);

        if ((Date.now() % 2) === 0)
            allowedChars = allowedChars.reverse();

        const result: Array<string> = [];

        Make.loop(() =>
        {
            const random = Make.randomInt(0, allowedChars.length);
            result.push(allowedChars[random]);
        }, numChars);

        return result.join("");
    }

    /**
     * Generates a random text code of specified length.
     *
     * @param numChars - Number of characters in the code
     * @param caseInsensitive - Whether to use only lowercase letters
     * @returns A random text string
     *
     * @example
     * ```typescript
     * const code = Make.randomTextCode(6); // 6-letter code
     * const lowercaseCode = Make.randomTextCode(6, true); // Lowercase only
     * ```
     */
    public static randomTextCode(numChars: number, caseInsensitive = false): string
    {
        given(numChars, "numChars").ensureHasValue().ensureIsNumber()
            .ensure(t => t > 0, "value has to be greater than 0");

        given(caseInsensitive, "caseInsensitive").ensureHasValue().ensureIsBoolean();

        let allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        if (caseInsensitive)
            allowedChars = "abcdefghijklmnopqrstuvwxyz".split("");

        const shuffleTimes = Make.randomInt(1, 10);
        const shuffleAmount = Make.randomInt(7, 11);
        Make.loop(() => allowedChars = [...allowedChars.skip(shuffleAmount), ...allowedChars.take(shuffleAmount)],
            shuffleTimes);

        if ((Date.now() % 2) === 0)
            allowedChars = allowedChars.reverse();

        const result: Array<string> = [];

        Make.loop(() =>
        {
            const random = Make.randomInt(0, allowedChars.length);
            result.push(allowedChars[random]);
        }, numChars);

        return result.join("");
    }

    /**
     * Generates a random numeric code of specified length.
     *
     * @param numChars - Number of digits in the code
     * @returns A random numeric string
     *
     * @example
     * ```typescript
     * const code = Make.randomNumericCode(4); // 4-digit code
     * ```
     */
    public static randomNumericCode(numChars: number): string
    {
        given(numChars, "numChars").ensureHasValue().ensureIsNumber()
            .ensure(t => t > 0, "value has to be greater than 0");

        let allowedChars = "0123456789".split("");

        const shuffleTimes = Make.randomInt(1, 10);
        const shuffleAmount = Make.randomInt(3, 7);
        Make.loop(() => allowedChars = [...allowedChars.skip(shuffleAmount), ...allowedChars.take(shuffleAmount)],
            shuffleTimes);

        if ((Date.now() % 2) === 0)
            allowedChars = allowedChars.reverse();

        const result: Array<string> = [];

        Make.loop(() =>
        {
            const random = Make.randomInt(0, allowedChars.length);
            result.push(allowedChars[random]);
        }, numChars);

        return result.join("");
    }
}


class TaskManager<T>
{
    private readonly _numberOfTimes: number;
    private readonly _taskFunc: (index: number) => Promise<any>;
    private readonly _taskCount: number;
    private readonly _captureResults: boolean;
    private readonly _tasks: Array<Task<T>>;
    private readonly _results: Array<any> = [];


    public constructor(numberOfTimes: number, taskFunc: (index: number) => Promise<any>, taskCount: number | null, captureResults: boolean)
    {
        this._numberOfTimes = numberOfTimes;
        this._taskFunc = taskFunc;
        this._taskCount = !taskCount || taskCount <= 0 ? numberOfTimes : taskCount;
        this._captureResults = captureResults;

        this._tasks = [];
        for (let i = 0; i < this._taskCount; i++)
            this._tasks.push(new Task<T>(this, i, this._taskFunc, captureResults));

        if (this._captureResults)
            this._results = [];
    }


    public async execute(): Promise<void>
    {
        for (let i = 0; i < this._numberOfTimes; i++)
        {
            if (this._captureResults)
                this._results.push(null);
            await this._executeTaskForItem(i);
        }

        await this._finish();
    }

    public addResult(itemIndex: number, result: any): void
    {
        this._results[itemIndex] = result;
    }

    public getResults(): Array<any>
    {
        return this._results;
    }


    private async _executeTaskForItem(itemIndex: number): Promise<void>
    {
        let availableTask = this._tasks.find(t => t.isFree);
        if (!availableTask)
        {
            const task = await Promise.race(this._tasks.map(t => t.promise!));
            task.free();
            availableTask = task;
        }

        availableTask.execute(itemIndex);
    }

    private _finish(): Promise<any>
    {
        return Promise.all(this._tasks.filter(t => !t.isFree).map(t => t.promise!));
    }
}

class Task<T>
{
    private readonly _manager: TaskManager<T>;
    // @ts-expect-error: not used atm
    private readonly _id: number;
    private readonly _taskFunc: (index: number) => Promise<any>;
    private readonly _captureResult: boolean;
    private _promise: Promise<Task<T>> | null;


    public get promise(): Promise<Task<T>> | null { return this._promise; }
    public get isFree(): boolean { return this._promise == null; }


    public constructor(manager: TaskManager<T>, id: number, taskFunc: (index: number) => Promise<any>, captureResult: boolean)
    {
        this._manager = manager;
        this._id = id;
        this._taskFunc = taskFunc;
        this._captureResult = captureResult;
        this._promise = null;
    }


    public execute(itemIndex: number): void
    {
        this._promise = new Promise((resolve, reject) =>
        {
            this._taskFunc(itemIndex)
                .then((result) =>
                {
                    if (this._captureResult)
                        this._manager.addResult(itemIndex, result);
                    resolve(this);
                })
                .catch((err) => reject(err));
        });
    }

    public free(): void
    {
        this._promise = null;
    }
}