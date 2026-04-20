import { given } from "@nivinjoseph/n-defensive";
import { Duration } from "./duration.js";
import { Delay } from "./delay.js";
import { ApplicationException } from "@nivinjoseph/n-exception";
export function debounce(delayOrTarget, context) {
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
    given(kind, "kind").ensureHasValue().ensureIsString().ensure(t => t === "method", "debounce decorator can only be used on a method");
    const activeKey = Symbol.for(`@nivinjoseph/n-util/debounce/${String(name)}/isActive`);
    const scheduledCallKey = Symbol.for(`@nivinjoseph/n-util/debounce/${String(name)}/scheduledCall`);
    // Mirror the initialization pattern used by throttle/dedupe: explicitly set
    // the backing fields on each instance rather than relying on the
    // `undefined`-is-falsy coincidence. Makes a future tightening of the
    // in-loop checks (e.g. `=== null` instead of `!= null`) safe.
    context.addInitializer(function () {
        this[activeKey] = false;
        this[scheduledCallKey] = null;
    });
    return async function (...args) {
        this[scheduledCallKey] = async () => {
            await target.call(this, ...args);
        };
        if (this[activeKey])
            return;
        while (this[scheduledCallKey] != null && !this[activeKey]) {
            this[activeKey] = true;
            if (delay != null)
                await Delay.milliseconds(delay.toMilliSeconds());
            const currentCall = this[scheduledCallKey];
            this[scheduledCallKey] = null;
            try {
                await currentCall();
            }
            finally {
                this[activeKey] = false;
            }
        }
    };
}
//# sourceMappingURL=debounce.js.map