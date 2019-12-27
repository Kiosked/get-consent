import { uspApplies, uspOptsOut } from "../source/usp.js";

describe("usp", function() {
    describe("uspApplies", function() {
        it("correctly identifies valid USP strings", function() {
            expect(uspApplies("1NNN")).toBe(true);
            expect(uspApplies("1N--")).toBe(true);
            expect(uspApplies("1YN-")).toBe(true);
        });

        it("correctly identifies invalid USP strings", function() {
            expect(uspApplies("")).toBe(false);
            expect(uspApplies("----")).toBe(false);
            expect(uspApplies("x")).toBe(false);
            expect(uspApplies()).toBe(false);
            expect(uspApplies(0)).toBe(false);
        });

        it("correctly identifies non-application USP string", function() {
            expect(uspApplies("1---")).toBe(false);
        });
    });

    describe("uspOptsOut", function() {
        it("correctly identifies strings that opt-out", function() {
            expect(uspOptsOut("1YYY")).toBe(true);
            expect(uspOptsOut("1YYN")).toBe(true);
            expect(uspOptsOut("1YY-")).toBe(true);
        });

        it("correctly identifies invalid USP strings", function() {
            expect(uspOptsOut("")).toBe(false);
            expect(uspOptsOut("----")).toBe(false);
            expect(uspOptsOut("x")).toBe(false);
            expect(uspOptsOut()).toBe(false);
        });

        it("correctly identifies strings that do not opt-out", function() {
            expect(uspOptsOut("1YNY")).toBe(false);
            expect(uspOptsOut("1YNN")).toBe(false);
            expect(uspOptsOut("1YN-")).toBe(false);
            expect(uspOptsOut("1Y--")).toBe(false);
            expect(uspOptsOut("1N--")).toBe(false);
            expect(uspOptsOut("1---")).toBe(false);
        });
    });
});
