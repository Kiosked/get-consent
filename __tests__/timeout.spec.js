import sinon from "sinon";
import { createTimeoutTrigger, timeoutPromise } from "../source/timeout.js";

describe("timeout", function() {
    describe("createTimeoutTrigger", function() {
        it("returns a triggerable object", function() {
            const trigger = createTimeoutTrigger();
            const cb = sinon.spy();
            trigger._cbs.push(cb);
            expect(trigger.active).toBe(false);
            trigger.activate();
            expect(cb.callCount).toBe(1);
            expect(trigger.active).toBe(true);
        });
    });

    describe("timeoutPromise", function() {
        it("throws a TimeoutError if the Promise times out", function() {
            return timeoutPromise(new Promise(() => {}), 75).then(
                () => {
                    throw new Error("Should not resolve");
                },
                err => {
                    expect(err.message).toMatch(/timed-out/i);
                    expect(err.name).toEqual("TimeoutError");
                }
            );
        });

        it("does not affect successful promise execution", function() {
            return timeoutPromise(new Promise(res => setTimeout(res, 75)), 150);
        });

        it("times-out within expected time-frame", function() {
            const start = Date.now();
            return timeoutPromise(new Promise(() => {}), 200).catch(() => {
                const duration = Date.now() - start;
                expect(duration).toBeGreaterThanOrEqual(200);
                expect(duration).toBeLessThan(275);
            });
        });

        it("times-out within expected time-frame when using delayed triggers", function() {
            const trigger = createTimeoutTrigger();
            const start = Date.now();
            setTimeout(() => trigger.activate(), 150);
            return timeoutPromise(new Promise(() => {}), 150, { trigger }).catch(() => {
                const duration = Date.now() - start;
                expect(duration).toBeGreaterThanOrEqual(300);
                expect(duration).toBeLessThan(375);
            });
        });

        it("has no affect when using triggers after a promise is resolved", function() {
            const trigger = createTimeoutTrigger();
            trigger.activate();
            return timeoutPromise(new Promise(res => setTimeout(res, 75)), 150, { trigger });
        });
    });
});
