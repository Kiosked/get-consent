import sinon from "sinon";
import { waitForConsentData } from "../source/consent.js";
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
    describe("waitForConsentData", function() {
        let win;

        describe("using standard window reference", function() {
            let cmpSpy;

            beforeEach(function() {
                const time = 150;
                cmpSpy = sinon.spy();
                win = {
                    __cmp: (a, b, c) => {
                        cmpSpy(a, b, c);
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
                    },
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
            });
        });
    });
});
