import sinon from "sinon";
import sleep from "sleep-promise";
import ConsentStringFetcher from "../source/ConsentStringFetcher.js";

const SAMPLE_CONSENT_DATA = Object.freeze({
    consentData: "BN5lERiOMYEdiAOAWeFRAAYAAaAAptQ",
    gdprApplies: true,
    hasGlobalScope: true
});

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
            consentFetcher._lastSuccessfulData = Object.assign({}, SAMPLE_CONSENT_DATA);
            expect(consentFetcher.consentData).toEqual(SAMPLE_CONSENT_DATA);
        });
    });

    describe("on", function() {
        let consentFetcher, win;

        beforeEach(function() {
            win = {};
            consentFetcher = new ConsentStringFetcher(win);
        });

        afterEach(function() {
            consentFetcher.shutdown();
        });

        function mockCMP(success = true) {
            win.__cmp = sinon.stub().callsFake((meth, param, cb) => {
                setTimeout(() => {
                    if (success) {
                        cb(SAMPLE_CONSENT_DATA, true);
                    } else {
                        cb(null, false);
                    }
                }, 0);
            });
        }

        describe("consentData event", function() {
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
                        expect(win.__cmp.callCount).toBe(1);
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

        describe("consentString event", function() {
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
                        expect(win.__cmp.callCount).toBe(1);
                    });
            });
        });
    });
});
