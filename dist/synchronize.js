import { given } from "@nivinjoseph/n-defensive";
import { Duration } from "./duration.js";
import { Delay } from "./delay.js";
import { Mutex } from "./mutex.js";
import { ApplicationException } from "@nivinjoseph/n-exception";
export function synchronize(delayOrTarget, context) {
    if (delayOrTarget instanceof Duration) {
        const delay = delayOrTarget;
        given(delay, "delay").ensureIsObject().ensureIsInstanceOf(Duration)
            .ensure(t => t.toMilliSeconds() > 0, "delay should be greater than 0ms");
        const decorator = function (target, context) {
            return createReplacementMethod(target, context, delay);
        };
        return decorator;
    }
    const target = delayOrTarget;
    if (context == null)
        throw new ApplicationException("Context should not be null or undefined");
    return createReplacementMethod(target, context, null);
}
function createReplacementMethod(target, context, delay) {
    const { name, kind } = context;
    given(kind, "kind").ensureHasValue().ensureIsString().ensure(t => t === "method", "synchronize decorated can only be used on a method");
    const mutexKey = Symbol.for(`@nivinjoseph/n-util/synchronize/${String(name)}/mutex`);
    context.addInitializer(function () {
        this[mutexKey] = new Mutex();
    });
    return async function (...args) {
        const mutex = this[mutexKey];
        await mutex.lock();
        try {
            const result = await target.call(this, ...args);
            return result;
        }
        finally {
            if (delay != null)
                await Delay.milliseconds(delay.toMilliSeconds());
            mutex.release();
        }
    };
}
//# sourceMappingURL=synchronize.js.map