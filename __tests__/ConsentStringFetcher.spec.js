import sinon from "sinon";
import sleep from "sleep-promise";
import ConsentStringFetcher from "../source/ConsentStringFetcher.js";

const SAMPLE_CONSENT_DATA = Object.freeze({
    consentData: "BN5lERiOMYEdiAOAWeFRAAYAAaAAptQ",
    gdprApplies: true,
    hasGlobalScope: true
});
const SAMPLE_VENDOR_CONSENTS = Object.freeze({
    metadata: "BAAAAAAAAAAAAAHABBAABeAAAAAAAA",
    hasGlobalScope: false,
    gdprApplies: true,
    purposeConsents: { "1": true, "2": true, "3": true, "4": true, "5": true },
    vendorConsents: {
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "6": false,
        "7": false,
        "8": false,
        "9": true,
        "10": false,
        "11": false,
        "12": false,
        "13": false,
        "14": false,
        "15": false,
        "16": false,
        "17": false,
        "18": false,
        "19": false,
        "20": false,
        "21": false,
        "22": false,
        "23": false,
        "24": false,
        "25": true,
        "26": false,
        "27": true,
        "28": true,
        "29": false,
        "30": true,
        "31": false,
        "32": false,
        "33": false,
        "34": false,
        "35": false,
        "36": false,
        "37": false,
        "38": false,
        "39": false,
        "40": false,
        "41": false,
        "42": false,
        "43": false,
        "44": false,
        "45": false,
        "46": false,
        "47": false,
        "48": false,
        "49": false,
        "50": false,
        "51": false,
        "52": false,
        "53": false,
        "55": false,
        "56": false,
        "57": false,
        "58": false,
        "59": false,
        "60": false,
        "61": false,
        "62": false,
        "63": false,
        "64": false,
        "65": false,
        "66": false,
        "67": false,
        "68": false,
        "69": false,
        "70": false,
        "71": false,
        "72": false,
        "73": false,
        "74": false,
        "75": false,
        "76": false,
        "77": false,
        "78": false,
        "79": false,
        "80": false,
        "81": false,
        "82": false,
        "83": false,
        "84": false,
        "85": false,
        "86": false,
        "87": false,
        "88": false,
        "89": false,
        "90": false,
        "91": false,
        "92": false,
        "93": false,
        "94": false,
        "95": false,
        "97": false,
        "98": false,
        "100": false,
        "101": false,
        "102": false,
        "104": false,
        "105": false,
        "108": false,
        "109": false,
        "110": false,
        "111": false,
        "112": false,
        "113": false,
        "114": false,
        "115": false,
        "119": false,
        "120": false,
        "122": false,
        "124": false,
        "125": false,
        "126": false,
        "127": false,
        "128": false,
        "129": false,
        "130": false,
        "131": false,
        "132": false,
        "133": false,
        "134": false,
        "136": false,
        "137": false,
        "138": false,
        "139": false,
        "140": false,
        "141": false,
        "142": false,
        "143": false,
        "144": false,
        "145": false,
        "147": false,
        "148": false,
        "149": false,
        "150": false,
        "151": false,
        "152": false,
        "153": false,
        "154": false,
        "155": false,
        "156": false,
        "157": false,
        "158": false,
        "159": false,
        "160": false,
        "161": false,
        "162": false,
        "163": false,
        "164": false,
        "165": false,
        "167": false,
        "168": false,
        "169": false,
        "170": false,
        "171": false,
        "173": false,
        "174": false,
        "175": false,
        "177": false,
        "178": false,
        "179": false,
        "180": false,
        "182": false,
        "183": false,
        "184": false,
        "185": false,
        "188": false,
        "189": false,
        "190": false,
        "191": false,
        "192": false,
        "193": false,
        "194": false,
        "195": false,
        "196": false,
        "197": false,
        "198": false,
        "199": false,
        "200": false,
        "201": false,
        "202": false,
        "203": false,
        "205": false,
        "206": false,
        "208": false,
        "209": false,
        "210": false,
        "211": false,
        "212": false,
        "213": false,
        "214": false,
        "215": false,
        "216": false,
        "217": false,
        "218": false,
        "221": false,
        "223": false,
        "224": false,
        "225": false,
        "226": false,
        "227": false,
        "228": false,
        "229": false,
        "230": false,
        "231": false,
        "232": false,
        "234": false,
        "235": false,
        "236": false,
        "237": false,
        "238": false,
        "239": false,
        "240": false,
        "241": false,
        "242": false,
        "243": false,
        "244": false,
        "245": false,
        "246": false,
        "248": false,
        "249": false,
        "250": false,
        "251": false,
        "252": false,
        "253": false,
        "254": false,
        "255": false,
        "256": false,
        "257": false,
        "258": false,
        "259": false,
        "260": false,
        "261": false,
        "262": false,
        "263": false,
        "264": false,
        "265": false,
        "266": false,
        "268": false,
        "269": false,
        "270": false,
        "272": false,
        "273": false,
        "274": false,
        "275": false,
        "276": false,
        "277": false,
        "278": false,
        "279": false,
        "280": false,
        "281": false,
        "282": false,
        "284": false,
        "285": false,
        "287": false,
        "288": false,
        "289": false,
        "290": false,
        "291": false,
        "293": false,
        "294": false,
        "295": false,
        "297": false,
        "298": false,
        "299": false,
        "301": false,
        "302": false,
        "303": false,
        "304": false,
        "308": false,
        "309": false,
        "310": false,
        "311": false,
        "312": false,
        "314": false,
        "315": false,
        "316": false,
        "317": false,
        "318": false,
        "319": false,
        "320": false,
        "321": false,
        "323": false,
        "325": false,
        "326": false,
        "328": false,
        "329": false,
        "330": false,
        "331": false,
        "333": false,
        "335": false,
        "336": false,
        "337": false,
        "338": false,
        "339": false,
        "340": false,
        "341": false,
        "343": false,
        "344": false,
        "345": false,
        "346": false,
        "347": false,
        "349": false,
        "350": false,
        "351": false,
        "354": false,
        "357": false,
        "358": false,
        "359": false,
        "360": false,
        "361": false,
        "362": false,
        "365": false,
        "366": false,
        "368": false,
        "369": false,
        "371": false,
        "373": false,
        "374": false,
        "375": false,
        "376": false,
        "377": false,
        "378": false,
        "380": false,
        "381": false,
        "382": false,
        "384": false,
        "385": false,
        "387": false,
        "388": false,
        "389": false,
        "390": false,
        "391": false,
        "392": false,
        "394": false,
        "395": false,
        "397": false,
        "398": false,
        "400": false,
        "402": false,
        "403": false,
        "404": false,
        "405": false,
        "407": false,
        "408": false,
        "409": false,
        "410": false,
        "412": false,
        "413": false,
        "415": false,
        "416": false,
        "418": false,
        "421": false,
        "422": false,
        "423": false,
        "424": false,
        "425": false,
        "426": false,
        "427": false,
        "428": false,
        "429": false,
        "430": false,
        "431": false,
        "434": false,
        "435": false,
        "436": false,
        "438": false,
        "440": false,
        "442": false,
        "443": false,
        "444": false,
        "447": false,
        "448": false,
        "449": false,
        "450": false,
        "452": false,
        "454": false,
        "455": false,
        "458": false,
        "459": false,
        "461": false,
        "462": false,
        "464": false,
        "465": false,
        "466": false,
        "467": false,
        "468": false,
        "469": false,
        "471": false,
        "473": false,
        "474": false,
        "475": false,
        "476": false,
        "478": false,
        "479": false,
        "480": false,
        "482": false,
        "484": false,
        "486": false,
        "488": false,
        "489": false,
        "490": false,
        "491": false,
        "492": false,
        "493": false,
        "494": false,
        "495": false,
        "496": false,
        "497": false,
        "499": false,
        "500": false,
        "502": false,
        "505": false,
        "507": false,
        "508": false,
        "511": false,
        "512": false,
        "513": false,
        "516": false,
        "517": false,
        "518": false
    }
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
