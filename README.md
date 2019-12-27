# Get-Consent
> GDPR consent string & US Privacy string fetcher

[![Build Status](https://travis-ci.org/Kiosked/get-consent.svg?branch=master)](https://travis-ci.org/Kiosked/get-consent) [![npm version](https://badge.fury.io/js/get-consent.svg)](https://www.npmjs.com/package/get-consent)

## About
**Get-Consent** is a helper library to make collecting GDPR consent data from CMPs easier. Consent data is typically collected from a [`window.__cmp()` function call](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/CMP%20JS%20API%20v1.1%20Final.md#what-api-will-need-to-be-provided-by-the-cmp-) by providing certain parameters. This is tedious as the function may arrive (be assigned and ready) later, or may never arrive at all. This library wraps a smart interface around the `__cmp()` call for fetching consent so that you don't have to worry about the details.

Get-Consent also handles being contained within an iframe, and will try to make `window.top.postMessage` requests to fetch CMP data. Note that Google personalization is **not** available in the circumstance that the script is contained within a frame.

Get-Consent supports fetching and processing [USP (US Privacy) strings](https://iabtechlab.com/standards/ccpa/) from CMP-style systems and cookies for supporting the [CCPA](https://en.wikipedia.org/wiki/California_Consumer_Privacy_Act).

Get-Consent is **10.8 KiB** minified.

### Google Personalization
Get-Consent also recognises Google consent for use with personalized ads. Currently the following CMPs are recognised and supported:

 * [Quantcast](https://www.quantcast.com/blog/quantcast-choice-your-solution-for-gdpr-consent/) (**recommended**)
 * [SourcePoint](https://www.sourcepoint.com/cmp/)

## Installation

```shell
npm install get-consent --save-dev
```

## Usage

The examples below detail the basic usage of the library. If you're looking for more detailed information, consider reading the [API documentation](API.md).

The simplest way to fetch consent data is to use one of the getter methods:

**Raw consent data:**

```javascript
import { getConsentData } from "get-consent";

getConsentData()
    .then(data => {
        // {
        //     consentData: "BN5lERiOMYEdiAOAWeFRAAYAAaAAptQ",
        //     gdprApplies: true,
        //     hasGlobalScope: true
        // }
    })
    .catch(err => {
        if (err.name === "TimeoutError") {
            // handle timeout
        } else if (err.name === "InvalidConsentError") {
            // Handle invalid/no consent
        }
    });
```

**Consent string:**

```javascript
import { getConsentString } from "get-consent";

(async function() {
    const cString = await getConsentString();
    // "BN5lERiOMYEdiAOAWeFRAAYAAaAAptQ"
})();
```

**Google consent:**

```javascript
import { getGoogleConsent } from "get-consent";

(async function() {
    const googleConsent = await getGoogleConsent();
    // 1 or 0
})();
```

_Google consent is always in number form - `1` meaning consent was granted, `0` meaning it was denied._

**Vendor consents:**

```javascript
import { getVendorConsentData } from "get-consent";

(async function() {
    const vendorConsentData = await getVendorConsentData();
    // {
    //     gdprApplies: true,
    //     hasGlobalScope: false,
    //     metaData: "AAAAAAAAAAAAAAAAAAAAAAA",
    //     purposeConsents: {
    //         "1": true,
    //         "2": true,
    //         "3": true
    //     },
    //     vendorConsents: {
    //         "1": false,
    //         "2": true,
    //         "3": false
    //     }
    // }
})();
```

The `get*` methods will all throw if they fail to fetch consent data, or if they time out. This can be changed by providing an extra option:

```javascript
const cString = await getConsentString({
    noConsent: "resolve" // Return `null` when consent fetching fails
});
```

The **timeout** can be adjusted by specifying it in the options:

```javascript
const googleConsent = await getGoogleConsent({
    timeout: 2500 // Default is no timeout
});
```

### USP Strings (CCPA)

Fetching the USP string is performed using different methods for the most part:

```javascript
import { getUSPString, onUSPString, uspApplies, uspOptsOut } from "get-consent";

// ...

const uspString = await getUSPString();// 1YN-
uspApplies(uspString); // true
uspOptsOut(uspString); // false

onUSPString(uspStr => { // 1---
    uspApplies(uspStr); // false
    uspOptsOut(uspStr); // false
});
```

The `uspApplies` and `uspOptsOut` methods provide detection for whether or not a US Privacy string is valid to use and how it affects data sales opt-out. The `uspApplies` method will return `true` for all valid USP strings that are **not** `1---`. The `uspOptsOut` will return true for all valid USP strings that specify **yes** (`Y`) for the 3rd character of the string.

_You can read more about the US Privacy string format in the [IAB specification](https://iabtechlab.com/wp-content/uploads/2019/11/U.S.-Privacy-String-v1.0-IAB-Tech-Lab.pdf)._

### Consent Callbacks

Other methods are available for using callbacks as a way to receive consent data:

```javascript
import {
    onConsentData,
    onConsentString,
    onGoogleConsent,
    onVendorConsent
} from "get-consent";

const remove = onConsentData((err, result) => {
    // Error is always first..
    // Second result paramter matches the same data structures
    //   as returned by the get* methods mentioned above..
}, { win: window.top });
```

### Caching

You can use memoization to cache consent fetching, so that multiple calls to some method don't make extra unnecessary CMP requests:

```javascript
import { createMem, getConsentString } from "get-consent";

const mem = createMem(); // Memoization store instance
getConsentString({ mem }).then(cString => {
    // ...
});

// Later..
getConsentString({ mem }); // Does not initiate another CMP request,
    // but merely reuses the previous requests result and returns that.
```

## Compatibility
This library is built using Webpack and Babel, and is designed to work on IE10 and upwards. No support will be provided for IE versions less than 10, nor other obscure browsers and versions.
