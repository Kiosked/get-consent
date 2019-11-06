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
import { createMem } from "../source/mem.js";
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

        it("supports memoization", function() {
            const mem = createMem();
            return getConsentData({ mem, win })
                .then(() => getConsentData({ mem, win }))
                .then(cData => {
                    expect(cData).toEqual(consentData);
                    expect(win.__cmp.callCount).toEqual(1);
                });
        });
    });

    describe("getConsentString", function() {
        it("returns the consent string", function() {
            return getConsentString({ win }).then(result => {
                expect(result).toEqual(consentData.consentData);
            });
        });

        it("supports memoization", function() {
            const mem = createMem();
            return getConsentString({ mem, win })
                .then(() => getConsentString({ mem, win }))
                .then(result => {
                    expect(result).toEqual(consentData.consentData);
                    expect(win.__cmp.callCount).toEqual(1);
                });
        });
    });

    describe("getGoogleConsent", function() {
        it("returns the consent value", function() {
            return getGoogleConsent({ win }).then(result => {
                expect(result).toEqual(1);
            });
        });

        it("supports memoization", function() {
            const mem = createMem();
            return getGoogleConsent({ mem, win })
                .then(() => getGoogleConsent({ mem, win }))
                .then(result => {
                    expect(result).toEqual(1);
                    expect(win.__cmp.callCount).toEqual(1);
                });
        });
    });

    describe("getVendorConsentData", function() {
        it("returns the consent data", function() {
            return getVendorConsentData({ win }).then(result => {
                expect(result).toEqual(vendorData);
            });
        });

        it("supports memoization", function() {
            const mem = createMem();
            return getVendorConsentData({ mem, win })
                .then(() => getVendorConsentData({ mem, win }))
                .then(result => {
                    expect(result).toEqual(vendorData);
                    expect(win.__cmp.callCount).toEqual(1);
                });
        });
    });

    describe("onConsentData", function() {
        it("returns a removal function", function() {
            const remove = onConsentData(() => {}, { win });
            expect(typeof remove).toBe("function");
            remove();
        });

        it("executes callback with consent data", function() {
            const cb = sinon.spy();
            const remove = onConsentData(cb, { win });
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
            const remove = onConsentData(cb, { win });
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(1);
                const [err, payload] = cb.firstCall.args;
                expect(payload).toBe(null);
                expect(err.message).toMatch(/Invalid consent/i);
                remove();
            });
        });

        it("supports memoization", function() {
            const cb = sinon.spy();
            const mem = createMem();
            const remove1 = onConsentData(cb, { mem, win });
            const remove2 = onConsentData(cb, { mem, win });
            return sleep(200).then(() => {
                expect(cb.callCount).toBe(2);
                expect(win.__cmp.callCount).toBe(1);
                const [err1, payload1] = cb.firstCall.args;
                const [err2, payload2] = cb.firstCall.args;
                expect(err1).toBe(null);
                expect(payload1).toEqual(consentData);
                expect(err2).toBe(null);
                expect(payload2).toEqual(consentData);
                remove1();
                remove2();
            });
        });
    });

    describe("onConsentString", function() {
        it("returns a removal function", function() {
            const remove = onConsentString(() => {}, { win });
            expect(typeof remove).toBe("function");
            remove();
        });

        it("executes callback with consent string", function() {
            const cb = sinon.spy();
            const remove = onConsentString(cb, { win });
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
            const remove = onConsentString(cb, { win });
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
            const remove = onGoogleConsent(() => {}, { win });
            expect(typeof remove).toBe("function");
            remove();
        });

        it("executes callback with consent string", function() {
            const cb = sinon.spy();
            const remove = onGoogleConsent(cb, { win });
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
            const remove = onGoogleConsent(cb, { win });
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
            const remove = onVendorConsent(() => {}, { win });
            expect(typeof remove).toBe("function");
            remove();
        });

        it("executes callback with vendor consent data", function() {
            const cb = sinon.spy();
            const remove = onVendorConsent(cb, { win });
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
            const remove = onVendorConsent(cb, { win });
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
