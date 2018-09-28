import sinon from "sinon";
import sleep from "sleep-promise";
import ConsentStringFetcher from "../source/ConsentStringFetcher.js";
import vendorConsents from "./vendorConsents.json";

const SAMPLE_CONSENT_DATA = Object.freeze({
    consentData: "BN5lERiOMYEdiAOAWeFRAAYAAaAAptQ",
    gdprApplies: true,
    hasGlobalScope: true
});
const SAMPLE_VENDOR_CONSENTS = Object.freeze(vendorConsents);

describe("ConsentStringFetcher", function() {
    it("can be instantiated", function() {
        let fetcher;
        expect(() => {
            fetcher = new ConsentStringFetcher({});
        }).not.toThrow();
        fetcher.shutdown();
    });

    it("throws if no Window instance provided", function() {
        expect(() => {
            new ConsentStringFetcher();
        }).toThrow(/First parameter is required/i);
    });

    describe("get:consentData", function() {
        let consentFetcher;

        beforeEach(function() {
            consentFetcher = new ConsentStringFetcher({});
        });

        afterEach(function() {
            consentFetcher.shutdown();
        });

        it("returns null if no consent", function() {
            expect(consentFetcher.consentData).toBe(null);
        });

        it("returns the payload if present", function() {
            consentFetcher._lastConsentData = Object.assign({}, SAMPLE_CONSENT_DATA);
            expect(consentFetcher.consentData).toEqual(SAMPLE_CONSENT_DATA);
        });
    });

    describe("with mock CMP", function() {
        let consentFetcher, win;

        beforeEach(function() {
            win = {};
            consentFetcher = new ConsentStringFetcher(win);
        });

        afterEach(function() {
            consentFetcher.shutdown();
            win.__cmp = undefined;
        });

        function mockCMP(success = true) {
            win.__cmp = sinon.stub().callsFake((meth, param, cb) => {
                setTimeout(() => {
                    if (success) {
                        if (meth === "getConsentData") {
                            cb(SAMPLE_CONSENT_DATA, true);
                        } else if (meth === "getVendorConsents") {
                            cb(SAMPLE_VENDOR_CONSENTS);
                        } else {
                            throw new Error(`Unsupported/Unmocked __cmp method in tests: ${meth}`);
                        }
                    } else {
                        cb(null, false);
                    }
                }, 0);
            });
        }

        describe("on:consentData", function() {
            it("provides the consent data from the __cmp call", function() {
                return Promise.resolve()
                    .then(
                        () =>
                            new Promise(resolve => {
                                consentFetcher.on("consentData", resolve);
                                setTimeout(mockCMP, 100);
                            })
                    )
                    .then(consentData => {
                        expect(consentData).toEqual(SAMPLE_CONSENT_DATA);
                        expect(win.__cmp.calledWith("getConsentData")).toBe(true);
                        expect(win.__cmp.callCount).toBeGreaterThanOrEqual(1);
                    });
            });

            it("fires the event only once when CMP data becomes available", function() {
                const cb = sinon.spy();
                consentFetcher.on("consentData", cb);
                mockCMP();
                return sleep(1200).then(() => {
                    expect(cb.calledOnce).toBe(true);
                });
            });
        });

        describe("on:consentString", function() {
            it("provides the consent string from the __cmp call", function() {
                return Promise.resolve()
                    .then(
                        () =>
                            new Promise(resolve => {
                                consentFetcher.on("consentString", resolve);
                                setTimeout(mockCMP, 100);
                            })
                    )
                    .then(str => {
                        expect(str).toEqual(SAMPLE_CONSENT_DATA.consentData);
                        expect(win.__cmp.calledWith("getConsentData")).toBe(true);
                        expect(win.__cmp.callCount).toBeGreaterThanOrEqual(1);
                    });
            });
        });

        describe("waitForCMP", function() {
            it("resolves once the __cmp method has been detected", function() {
                setTimeout(mockCMP, 100);
                return consentFetcher.waitForCMP();
            });

            it("throws a TimeoutError if timeout reached", function() {
                return consentFetcher
                    .waitForCMP(100)
                    .then(() => {
                        throw new Error("Should have timed out");
                    })
                    .catch(err => {
                        expect(err.name).toBe("TimeoutError");
                    });
            });
        });

        describe("waitForConsent", function() {
            it("provides consent data", function() {
                const work = consentFetcher.waitForConsent();
                setTimeout(mockCMP, 100);
                return work.then(consentData => {
                    expect(consentData).toEqual(SAMPLE_CONSENT_DATA);
                });
            });

            it("fires after CMP data has been fetched", function() {
                mockCMP();
                return sleep(150)
                    .then(() => consentFetcher.waitForConsent())
                    .then(consentData => {
                        expect(consentData).toEqual(SAMPLE_CONSENT_DATA);
                    });
            });

            it("throws a TimeoutError if timeout reached", function() {
                return consentFetcher
                    .waitForConsent(100)
                    .then(() => {
                        throw new Error("Should have timed out");
                    })
                    .catch(err => {
                        expect(err.name).toBe("TimeoutError");
                    });
            });
        });

        describe("waitForConsent", function() {
            it("provides consent string", function() {
                const work = consentFetcher.waitForConsentString();
                setTimeout(mockCMP, 100);
                return work.then(consentString => {
                    expect(consentString).toEqual(SAMPLE_CONSENT_DATA.consentData);
                });
            });

            it("throws a TimeoutError if timeout reached", function() {
                return consentFetcher
                    .waitForConsentString(100)
                    .then(() => {
                        throw new Error("Should have timed out");
                    })
                    .catch(err => {
                        expect(err.name).toBe("TimeoutError");
                    });
            });
        });

        describe("waitForVendorConsents", function() {
            it("provides consent string", function() {
                const work = consentFetcher.waitForVendorConsents();
                setTimeout(mockCMP, 100);
                return work.then(vendorConsents => {
                    expect(vendorConsents).toEqual(SAMPLE_VENDOR_CONSENTS);
                });
            });

            it("throws a TimeoutError if timeout reached", function() {
                return consentFetcher
                    .waitForVendorConsents(100)
                    .then(() => {
                        throw new Error("Should have timed out");
                    })
                    .catch(err => {
                        expect(err.name).toBe("TimeoutError");
                    });
            });
        });
    });
});
