import sinon from "sinon";
import {
    getConsentData,
    getConsentString,
    getGoogleConsent,
    getVendorConsentData
} from "../source/accessors.js";
import consentData from "./consent.json";
import vendorData from "./vendorConsents.json";
import googleConsentData from "./googleConsent.json";

describe("accessors", function() {
    let win, hasConsent, time;

    beforeEach(function() {
        time = 150;
        hasConsent = true;
        win = {
            __cmp: sinon.stub().callsFake((a, b, c) => {
                if (a === "getConsentData") {
                    setTimeout(() => {
                        c(consentData, true);
                    }, time);
                    return;
                } else if (a === "getVendorConsents") {
                    setTimeout(() => {
                        c(vendorData, true);
                    }, time);
                    return;
                } else if (a === "getGooglePersonalization") {
                    setTimeout(() => {
                        b(googleConsentData, true);
                    }, time);
                    return;
                }
                throw new Error("Unknown CMP command");
            }),
            addEventListener: sinon.spy(),
            postMessage: sinon.spy(),
            removeEventListener: sinon.spy()
        };
        win.top = win;
    });

    describe("getConsentData", function() {
        it("returns consent data (default)", function() {
            return getConsentData({ win }).then(cData => {
                expect(cData).toEqual(consentData);
            });
        });

        it("throws when no consent available (timeout)", function() {
            hasConsent = false;
            time = 500;
            return getConsentData({ timeout: 200, win }).then(
                () => {
                    throw new Error("Should not have resolved");
                },
                err => {
                    expect(err.message).toMatch(/Timed-out/);
                }
            );
        });

        it("resolves without consent data if set to 'resolve' (timeout)", function() {
            hasConsent = false;
            time = 500;
            return getConsentData({ noConsent: "resolve", timeout: 200, win }).then(cData => {
                expect(cData).toEqual(null);
            });
        });

        it("returns vendor consent data", function() {
            return getConsentData({ type: "vendor", win }).then(cData => {
                expect(cData).toEqual(vendorData);
            });
        });

        it("returns Google consent data", function() {
            return getConsentData({ type: "google", win }).then(cData => {
                expect(cData).toEqual(googleConsentData);
            });
        });
    });

    describe("getConsentString", function() {
        it("returns the consent string", function() {
            return getConsentString({ win }).then(result => {
                expect(result).toEqual(consentData.consentData);
            });
        });
    });

    describe("getGoogleConsent", function() {
        it("returns the consent value", function() {
            return getGoogleConsent({ win }).then(result => {
                expect(result).toEqual(1);
            });
        });
    });

    describe("getVendorConsentData", function() {
        it("returns the consent data", function() {
            return getVendorConsentData({ win }).then(result => {
                expect(result).toEqual(vendorData);
            });
        });
    });
});
