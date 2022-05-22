"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttle = void 0;
const tslib_1 = require("tslib");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const delay_1 = require("./delay");
const duration_1 = require("./duration");
function throttle(delayOrTarget, propertyKey, descriptor) {
    (0, n_defensive_1.given)(delayOrTarget, "delayMsOrTarget").ensureHasValue().ensureIsObject();
    if (delayOrTarget instanceof duration_1.Duration) {
        const delayMs = delayOrTarget.toMilliSeconds();
        return function (target, propertyKey, descriptor) {
            (0, n_defensive_1.given)(target, "target").ensureHasValue().ensureIsObject();
            (0, n_defensive_1.given)(propertyKey, "propertyKey").ensureHasValue().ensureIsString();
            (0, n_defensive_1.given)(descriptor, "descriptor").ensureHasValue().ensureIsObject();
            const original = descriptor.value;
            const activeKey = Symbol.for(`__$_${propertyKey}_throttleIsActive`);
            const scheduledCallKey = Symbol.for(`__$_${propertyKey}_throttleScheduledCall`);
            descriptor.value = function (...params) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this[scheduledCallKey] = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield original.call(this, ...params);
                    });
                    if (this[activeKey])
                        return;
                    while (this[scheduledCallKey] != null && !this[activeKey]) {
                        this[activeKey] = true;
                        const currentCall = this[scheduledCallKey];
                        this[scheduledCallKey] = null;
                        try {
                            yield currentCall();
                        }
                        finally {
                            yield delay_1.Delay.milliseconds(delayMs);
                            this[activeKey] = false;
                        }
                    }
                });
            };
        };
    }
    else {
        (0, n_defensive_1.given)(propertyKey, "propertyKey").ensureHasValue().ensureIsString();
        (0, n_defensive_1.given)(descriptor, "descriptor").ensureHasValue().ensureIsObject();
        const original = descriptor.value;
        const activeKey = Symbol.for(`__$_${propertyKey}_throttleIsActive`);
        const scheduledCallKey = Symbol.for(`__$_${propertyKey}_throttleScheduledCall`);
        descriptor.value = function (...params) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this[scheduledCallKey] = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield original.call(this, ...params);
                });
                if (this[activeKey])
                    return;
                while (this[scheduledCallKey] != null && !this[activeKey]) {
                    this[activeKey] = true;
                    const currentCall = this[scheduledCallKey];
                    this[scheduledCallKey] = null;
                    try {
                        yield currentCall();
                    }
                    finally {
                        this[activeKey] = false;
                    }
                }
            });
        };
    }
}
exports.throttle = throttle;
//# sourceMappingURL=throttle.js.map