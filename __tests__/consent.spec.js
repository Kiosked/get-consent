import sinon from "sinon";
import {
    isCMPPing,
    isConsentPayload,
    isGooglePayload,
    isVendorPayload,
    waitForConsentData
} from "../source/consent.js";
import consentData from "./consent.json";
import vendorData from "./vendorConsents.json";
import googleConsentData from "./googleConsent.json";

googleConsentData.googlePersonalizationData.created = new Date(
    googleConsentData.googlePersonalizationData.created
);
googleConsentData.googlePersonalizationData.lastUpdated = new Date(
    googleConsentData.googlePersonalizationData.created
);

describe("consent", function() {
    describe("isCMPPing", function() {
        it("recognises a ping response", function() {
            expect(
                isCMPPing({
                    gdprAppliesGlobally: false,
                    cmpLoaded: true
                })
            ).toBe(true);
        });
    });

    describe("isConsentPayload", function() {
        it("recognises a consent response", function() {
            expect(isConsentPayload(consentData)).toBe(true);
        });
    });

    describe("isGooglePayload", function() {
        it("recognises a Google consent response", function() {
            expect(isGooglePayload(googleConsentData)).toBe(true);
        });
    });

    describe("isVendorPayload", function() {
        it("recognises a vendor response", function() {
            expect(isVendorPayload(vendorData)).toBe(true);
        });
    });

    describe("waitForConsentData", function() {
        describe("using standard window reference", function() {
            let win;

            beforeEach(function() {
                const time = 150;
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

            describe("requesting getConsentData (default)", function() {
                it("returns expected data", function() {
                    return waitForConsentData({ win }).then(res => {
                        expect(res).toEqual(consentData);
                    });
                });

                it("calls __cmp with expected parameters", function() {
                    return waitForConsentData({ win }).then(res => {
                        expect(win.__cmp.calledWith("getConsentData", null)).toBe(true);
                        expect(typeof win.__cmp.firstCall.args[2]).toBe("function");
                    });
                });
            });

            describe("requesting getVendorConsents", function() {
                it("returns expected data", function() {
                    return waitForConsentData({
                        cmpCmd: "getVendorConsents",
                        validate: isVendorPayload,
                        win
                    }).then(res => {
                        expect(res).toEqual(vendorData);
                    });
                });

                it("calls __cmp with expected parameters", function() {
                    return waitForConsentData({
                        cmpCmd: "getVendorConsents",
                        validate: isVendorPayload,
                        win
                    }).then(res => {
                        expect(win.__cmp.calledWith("getVendorConsents", null)).toBe(true);
                        expect(typeof win.__cmp.firstCall.args[2]).toBe("function");
                    });
                });
            });

            describe("requesting getGooglePersonalization", function() {
                it("returns expected data", function() {
                    return waitForConsentData({
                        cmpCmd: "getGooglePersonalization",
                        cmpParam: false,
                        validate: isGooglePayload,
                        win
                    }).then(res => {
                        expect(res).toEqual(googleConsentData);
                    });
                });

                it("calls __cmp with expected parameters", function() {
                    return waitForConsentData({
                        cmpCmd: "getGooglePersonalization",
                        cmpParam: false,
                        validate: isGooglePayload,
                        win
                    }).then(res => {
                        expect(win.__cmp.calledWith("getGooglePersonalization")).toBe(true);
                        expect(typeof win.__cmp.firstCall.args[1]).toBe("function");
                    });
                });
            });
        });

        describe("using postMessage", function() {
            let win;

            beforeEach(function() {
                const time = 100;
                const messageHandlers = [];
                win = {
                    addEventListener: sinon.stub().callsFake((name, cb) => {
                        if (name === "message") {
                            messageHandlers.push(cb);
                        }
                    }),
                    postMessage: sinon.stub().callsFake(msg => {
                        setTimeout(() => {
                            messageHandlers.forEach(hndlr =>
                                hndlr({
                                    data: msg
                                })
                            );
                        }, time);
                        try {
                            const payload = typeof msg === "string" ? JSON.parse(msg) : msg;
                            if (payload.__cmp) {
                                switch (payload.__cmp.command) {
                                    case "ping":
                                        win.postMessage(
                                            JSON.stringify({
                                                __cmpReturn: {
                                                    returnValue: {
                                                        gdprAppliesGlobally: false,
                                                        cmpLoaded: true
                                                    },
                                                    success: true
                                                }
                                            })
                                        );
                                        break;
                                    case "getConsentData":
                                        win.postMessage(
                                            JSON.stringify({
                                                __cmpReturn: {
                                                    returnValue: consentData,
                                                    success: true
                                                }
                                            })
                                        );
                                        break;
                                    case "getVendorConsents":
                                        win.postMessage(
                                            JSON.stringify({
                                                __cmpReturn: {
                                                    returnValue: vendorData,
                                                    success: true
                                                }
                                            })
                                        );
                                        break;
                                    default:
                                        throw new Error(
                                            `Unspecified CMP command: ${payload.__cmp.command}`
                                        );
                                }
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }),
                    removeEventListener: sinon.stub().callsFake((name, cb) => {
                        if (name === "message") {
                            const ind = messageHandlers.indexOf(cb);
                            if (ind >= 0) {
                                messageHandlers.splice(ind, 1);
                            }
                        }
                    })
                };
                win.top = win;
            });

            describe("requesting getConsentData (default)", function() {
                it("returns expected data", function() {
                    return waitForConsentData({ win }).then(res => {
                        expect(res).toEqual(consentData);
                    });
                });
            });

            describe("requesting getVendorConsents", function() {
                it("returns expected data", function() {
                    return waitForConsentData({
                        cmpCmd: "getVendorConsents",
                        validate: isVendorPayload,
                        win
                    }).then(res => {
                        expect(res).toEqual(vendorData);
                    });
                });
            });
        });

        describe("when SourcePoint CMP is active", function() {
            let win;

            beforeEach(function() {
                const time = 150;
                win = {
                    __cmp: sinon.stub().callsFake(() => {}),
                    document: {
                        cookie:
                            "firstSessionDate=Wed, 28 Aug 2019 10:32:49 GMT; _sp_enable_dfp_personalized_ads=true; sessionNumber=2"
                    },
                    addEventListener: sinon.spy(),
                    postMessage: sinon.spy(),
                    removeEventListener: sinon.spy()
                };
                win.top = win;
            });

            describe("requesting getGooglePersonalization", function() {
                it("returns expected data", function() {
                    return waitForConsentData({
                        cmpCmd: "getGooglePersonalization",
                        cmpParam: false,
                        validate: isGooglePayload,
                        win
                    }).then(res => {
                        expect(res).toHaveProperty("googlePersonalizationData.consentValue", 1);
                        expect(res).toHaveProperty("googlePersonalizationData.created", null);
                        expect(res).toHaveProperty("googlePersonalizationData.lastUpdated", null);
                    });
                });
            });
        });
    });
});
