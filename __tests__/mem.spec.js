import sinon from "sinon";
import { createMem, mem } from "../source/mem.js";

describe("mem", function() {
    describe("createMem", function() {
        it("creates an array", function() {
            expect(Array.isArray(createMem())).toBe(true);
        });
    });

    describe("mem", function() {
        function addSlow(a, b) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(a + b);
                }, 50);
            });
        }

        it("passes the correct result", function() {
            const memInst = createMem();
            return mem(memInst, addSlow, [1, 2], [1, 2]).then(res => {
                expect(res).toEqual(3);
            });
        });

        it("calls the method only once", function() {
            const memInst = createMem();
            const meth = sinon.stub().returns(Promise.resolve());
            const args = [1];
            return mem(memInst, meth, args, args)
                .then(() => mem(memInst, meth, args, args))
                .then(() => mem(memInst, meth, args, args))
                .then(() => {
                    expect(meth.callCount).toEqual(1);
                });
        });

        it("caches calls by cache keys", function() {
            const memInst = createMem();
            const meth1 = sinon.stub().returns(Promise.resolve());
            const meth2 = sinon.stub().returns(Promise.resolve());
            return mem(memInst, meth1, [1], [1])
                .then(() => mem(memInst, meth1, [2], [1]))
                .then(() => mem(memInst, meth2, [3], [1]))
                .then(() => {
                    expect(meth1.callCount).toEqual(1);
                    expect(meth2.callCount).toEqual(1);
                });
        });

        it("supports underscore function handler", function() {
            const memInst = [];
            memInst._ = sinon
                .stub()
                .onFirstCall()
                .returns({ c: "a" })
                .onSecondCall()
                .returns({ c: "b" });
            const fn = sinon.stub();
            const res1 = mem(memInst, fn, [], [1]);
            const res2 = mem(memInst, fn, [], [2]);
            expect(fn.callCount).toBe(0);
            expect(memInst._.callCount).toBe(2);
            expect(res1).toEqual("a");
            expect(res2).toEqual("b");
        });
    });
});
