import sinon from "sinon";
import sleep from "sleep-promise";
import {
    getConsentData,
    getConsentString,
    getGoogleConsent,
    getVendorConsentData,
    onConsentData,
    onConsentString,
    onGoogleConsent,
    onVendorConsent
} from "../source/accessors.js";
import consentData from "./consent.json";
import vendorData from "./vendorConsents.json";
import googleConsentData from "./googleConsent.json";

describe("accessors", function() {
    let win, hasConsent, time, successful;

    beforeEach(function() {
        time = 150;
        hasConsent = true;
        successful = true;
        win = {
            __cmp: sinon.stub().callsFake((a, b, c) => {
                if (a === "getConsentData") {
                    setTimeout(() => {
                        c(successful ? consentData : null, successful);
                    }, time);
                    return;
                } else if (a === "getVendorConsents") {
                    setTimeout(() => {
                        c(successful ? vendorData : null, successful);
                    }, time);
                    return;
                } else if (a === "getGooglePersonalization") {
                    setTimeout(() => {
                        b(successful ? googleConsentData : null, successful);
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

    describe("onConsentData", function() {
        it("returns a removal function", function() {
            const remove = onConsentData(() => {}, "", win);
            expect(typeof remove).toBe("function");
            remove();
        });

        it("executes callback with consent data", function() {
            const cb = sinon.spy();
            const remove = onConsentData(cb, "", win);
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(1);
                const [err, payload] = cb.firstCall.args;
                expect(err).toBe(null);
                expect(payload).toEqual(consentData);
                remove();
            });
        });

        it("executes callback with error", function() {
            successful = false;
            const cb = sinon.spy();
            const remove = onConsentData(cb, "", win);
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(1);
                const [err, payload] = cb.firstCall.args;
                expect(payload).toBe(null);
                expect(err.message).toMatch(/Invalid consent/i);
                remove();
            });
        });
    });

    describe("onConsentString", function() {
        it("returns a removal function", function() {
            const remove = onConsentString(() => {}, win);
            expect(typeof remove).toBe("function");
            remove();
        });

        it("executes callback with consent string", function() {
            const cb = sinon.spy();
            const remove = onConsentString(cb, win);
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(1);
                const [err, payload] = cb.firstCall.args;
                expect(err).toBe(null);
                expect(payload).toEqual(consentData.consentData);
                remove();
            });
        });

        it("executes callback with error", function() {
            successful = false;
            const cb = sinon.spy();
            const remove = onConsentString(cb, win);
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(1);
                const [err, payload] = cb.firstCall.args;
                expect(payload).toBe(null);
                expect(err.message).toMatch(/Invalid consent/i);
                remove();
            });
        });
    });

    describe("onGoogleConsent", function() {
        it("returns a removal function", function() {
            const remove = onGoogleConsent(() => {}, win);
            expect(typeof remove).toBe("function");
            remove();
        });

        it("executes callback with consent string", function() {
            const cb = sinon.spy();
            const remove = onGoogleConsent(cb, win);
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(1);
                const [err, payload] = cb.firstCall.args;
                expect(err).toBe(null);
                expect(payload).toBe(1);
                remove();
            });
        });

        it("executes callback with error", function() {
            successful = false;
            const cb = sinon.spy();
            const remove = onGoogleConsent(cb, win);
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(1);
                const [err, payload] = cb.firstCall.args;
                expect(payload).toBe(null);
                expect(err.message).toMatch(/Invalid consent/i);
                remove();
            });
        });
    });

    describe("onVendorConsent", function() {
        it("returns a removal function", function() {
            const remove = onVendorConsent(() => {}, win);
            expect(typeof remove).toBe("function");
            remove();
        });

        it("executes callback with vendor consent data", function() {
            const cb = sinon.spy();
            const remove = onVendorConsent(cb, win);
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(1);
                const [err, payload] = cb.firstCall.args;
                expect(err).toBe(null);
                expect(payload).toEqual(vendorData);
                remove();
            });
        });

        it("executes callback with error", function() {
            successful = false;
            const cb = sinon.spy();
            const remove = onVendorConsent(cb, win);
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(1);
                const [err, payload] = cb.firstCall.args;
                expect(payload).toBe(null);
                expect(err.message).toMatch(/Invalid consent/i);
                remove();
            });
        });
    });
});
