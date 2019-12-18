import sinon from "sinon";
import { getCookieValue } from "../source/cookie.js";

describe("cookie", function() {
    let win;

    beforeEach(function() {
        win = {
            document: {
                cookie:
                    "_ga=GA1.2.388359608.1543305257; _octo=GH1.1.639453252.1543305257; tz=Europe%2FHelsinki; us_privacy=1YN-"
            }
        };
    });

    describe("getCookieValue", function() {
        it("returns correct value", function() {
            expect(getCookieValue(win, "us_privacy")).toEqual("1YN-");
            expect(getCookieValue(win, "_ga")).toEqual("GA1.2.388359608.1543305257");
        });

        it("returns the default value if not found", function() {
            expect(getCookieValue(win, "not-here", false)).toBe(false);
        });
    });
});
