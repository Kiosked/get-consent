import sleep from "sleep-promise";
import sinon from "sinon";
import { expandTimings, startTimer, stopTimer } from "../source/timer.js";

describe("timer", function() {
    describe("expandTimings", function() {
        it("does not affect numerical values", function() {
            expect(expandTimings([100, 200])).toEqual([100, 200]);
        });

        it("expands string format", function() {
            expect(expandTimings(["2x100", "1x1000", "3x350"])).toEqual([
                100,
                100,
                1000,
                350,
                350,
                350
            ]);
        });

        it("expands mixed format", function() {
            expect(expandTimings(["2x100", 500])).toEqual([100, 100, 500]);
        });
    });

    describe("startTimer", function() {
        it("fires the callback the expected number of times", function() {
            const cb = sinon.spy();
            const timer = startTimer(cb, ["2x50", "1x100", "5x200"]);
            return sleep(250).then(() => {
                stopTimer(timer);
                expect(cb.callCount).toBe(3);
            });
        });
    });

    describe("stopTimer", function() {
        it("stops the timer", function() {
            const cb = sinon.spy();
            const timer = startTimer(cb, [50]);
            return sleep(55)
                .then(() => {
                    stopTimer(timer);
                    return sleep(55);
                })
                .then(() => {
                    expect(cb.calledOnce).toBe(true);
                });
        });

        it("stops the timer before it has started", function() {
            const cb = sinon.spy();
            const timer = startTimer(cb, [50]);
            return sleep(10)
                .then(() => {
                    stopTimer(timer);
                    return sleep(50);
                })
                .then(() => {
                    expect(cb.notCalled).toBe(true);
                });
        });
    });
});
