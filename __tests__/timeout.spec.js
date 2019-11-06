import sinon from "sinon";
import { timeoutPromise } from "../source/timeout.js";

describe("timeout", function() {
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
    });
});
