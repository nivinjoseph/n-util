"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundProcessor = void 0;
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const delay_1 = require("./delay");
const n_exception_1 = require("@nivinjoseph/n-exception");
// public
class BackgroundProcessor {
    constructor(defaultErrorHandler, breakIntervalMilliseconds = 1000, breakOnlyWhenNoWork = true) {
        this._actionsToProcess = new Array();
        this._actionsExecuting = new Array();
        this._isDisposed = false;
        this._timeout = null;
        n_defensive_1.given(defaultErrorHandler, "defaultErrorHandler").ensureHasValue().ensureIsFunction();
        n_defensive_1.given(breakIntervalMilliseconds, "breakIntervalMilliseconds").ensureHasValue().ensureIsNumber().ensure(t => t >= 0);
        n_defensive_1.given(breakOnlyWhenNoWork, "breakOnlyWhenNoWork").ensureHasValue().ensureIsBoolean();
        this._defaultErrorHandler = defaultErrorHandler;
        this._breakIntervalMilliseconds = breakIntervalMilliseconds || 0;
        this._breakOnlyWhenNoWork = breakOnlyWhenNoWork;
        this.initiateBackgroundProcessing();
    }
    get queueLength() { return this._actionsToProcess.length; }
    processAction(action, errorHandler) {
        if (this._isDisposed)
            throw new n_exception_1.ObjectDisposedException(this);
        n_defensive_1.given(action, "action").ensureHasValue().ensureIsFunction();
        n_defensive_1.given(errorHandler, "errorHandler").ensureIsFunction();
        this._actionsToProcess.push(new Action(action, errorHandler || this._defaultErrorHandler));
    }
    dispose(killQueue = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isDisposed)
                return;
            this._isDisposed = true;
            if (this._timeout)
                clearTimeout(this._timeout);
            if (!killQueue) {
                while (this._actionsToProcess.length > 0) {
                    const action = this._actionsToProcess.shift();
                    this._actionsExecuting.push(action);
                    action.execute(() => this._actionsExecuting.remove(action));
                }
            }
            while (this._actionsExecuting.length > 0)
                yield delay_1.Delay.seconds(3);
        });
    }
    initiateBackgroundProcessing() {
        if (this._isDisposed)
            return;
        let timeout = this._breakIntervalMilliseconds;
        if (this._breakOnlyWhenNoWork && this._actionsToProcess.length > 0)
            timeout = 0;
        this._timeout = setTimeout(() => {
            if (this._actionsToProcess.length > 0) {
                const action = this._actionsToProcess.shift();
                this._actionsExecuting.push(action);
                action.execute(() => {
                    this._actionsExecuting.remove(action);
                    this.initiateBackgroundProcessing();
                });
            }
            else {
                this.initiateBackgroundProcessing();
            }
        }, timeout);
    }
}
exports.BackgroundProcessor = BackgroundProcessor;
class Action {
    constructor(action, errorHandler) {
        n_defensive_1.given(action, "action").ensureHasValue().ensureIsFunction();
        n_defensive_1.given(errorHandler, "errorHandler").ensureHasValue().ensureIsFunction();
        this._action = action;
        this._errorHandler = errorHandler;
    }
    execute(postExecuteCallback) {
        n_defensive_1.given(postExecuteCallback, "postExecuteCallback").ensureHasValue().ensureIsFunction();
        try {
            this._action()
                .then(() => {
                postExecuteCallback();
            })
                .catch((error) => {
                try {
                    this._errorHandler(error)
                        .then(() => postExecuteCallback())
                        .catch((error) => {
                        console.error(error);
                        postExecuteCallback();
                    });
                }
                catch (error) {
                    console.error(error);
                    postExecuteCallback();
                }
            });
        }
        catch (error) {
            try {
                this._errorHandler(error)
                    .then(() => postExecuteCallback())
                    .catch((error) => {
                    console.error(error);
                    postExecuteCallback();
                });
            }
            catch (error) {
                console.error(error);
                postExecuteCallback();
            }
        }
    }
}
//# sourceMappingURL=background-processor.js.map