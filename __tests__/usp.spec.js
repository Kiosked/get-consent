import { uspApplies } from "../source/usp.js";

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
});
