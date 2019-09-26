# Get-Consent
> GDPR consent string fetcher

[![Build Status](https://travis-ci.org/Kiosked/get-consent.svg?branch=master)](https://travis-ci.org/Kiosked/get-consent) [![npm version](https://badge.fury.io/js/get-consent.svg)](https://www.npmjs.com/package/get-consent)

## About
**Get-Consent** is a helper library to make collecting GDPR consent data from CMPs easier. Consent data is typically collected from a [`window.__cmp()` function call](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/CMP%20JS%20API%20v1.1%20Final.md#what-api-will-need-to-be-provided-by-the-cmp-) by providing certain parameters. This is tedious as the function may arrive (be assigned and ready) later, or may never arrive at all. This library wraps a smart interface around the `__cmp()` call for fetching consent so that you don't have to worry about the details.

### Google Personalization
Get-Consent also recognises Google consent for use with personalized ads. Currently the following CMPs are recognised and supported:

 * [Quantcast](https://www.quantcast.com/blog/quantcast-choice-your-solution-for-gdpr-consent/) (**recommended**)
 * [SourcePoint](https://www.sourcepoint.com/cmp/)

## Installation

```shell
npm install get-consent --save-dev
```

## Usage
The examples below detail the basic usage of the library. If you're looking for more detailed information, consider reading the [API documentation](API.md);

Fetch using events:

```javascript
import { ConsentStringFetcher } from "get-consent";

const fetcher = ConsentStringFetcher.attachToWindow();
fetcher.on("consentData", data => {
    // {
    //     consentData: "BN5lERiOMYEdiAOAWeFRAAYAAaAAptQ",
    //     gdprApplies: true,
    //     hasGlobalScope: true
    // }
});
```

Fetch by using a Promise and custom `Window` reference:

```javascript
import { ConsentStringFetcher } from "get-consent";

const fetcher = new ConsentStringFetcher(myWin);
fetcher.waitForConsent().then(consentData => {
    // {
    //     consentData: "BN5lERiOMYEdiAOAWeFRAAYAAaAAptQ",
    //     gdprApplies: true,
    //     hasGlobalScope: true
    // }
});
```

**NB**: You can remove listeners in two ways:
 1. Calling the `remove` method returned in the object by `.on()`
 2. Calling `fetcher.off(eventName, callback)`

**NB**: Attaching event listeners too late after instantiating a new `ConsentStringFetcher` may result in the event listeners never being called (as there was already an update emitted, but your listener may not have been attached so early). You should always check for the data before attaching the listener, or by simply using the `waitForConsent` type of methods.

### Fetching the consent string directly
If you're just after the consent string itself, there are some more _direct_ methods to get it:

```javascript
import { ConsentStringFetcher } from "get-consent";

const fetcher = ConsentStringFetcher.attachToWindow();

fetcher.waitForConsentString().then(consentStr => {
    // "BN5lERiOMYEdiAOAWeFRAAYAAaAAptQ"
});

fetcher.on("consentString", data => {
    // "BN5lERiOMYEdiAOAWeFRAAYAAaAAptQ"
});
```

### Vendor consents
It's possible to fetch individual vendor consent flags using this library:

```javascript
import { ConsentStringFetcher } from "get-consent";

const fetcher = new ConsentStringFetcher();

fetcher.on("vendorConsentsData", data => {
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
});

fetcher.waitForVendorConsents().then(data => {
    const hasConsent = !!data.vendorConsents[VENDORID.toString(10)];
});
```

### Google Consent
`get-consent` can also detect consent for Google ads, if the current CMP supports it.

```javascript
import { ConsentStringFetcher } from "get-consent";

const fetcher = new ConsentStringFetcher();

fetcher.waitForGoogleConsent(250)
    .then(hasConsent => {
        // hasConsent is a boolean, where `true` indicates consent
    })
    .catch(err => {
        // The CMP either doesnt support Google consent or the request
        // timed out
    });
```

### Timeouts
All of the waitFor* methods can be timed-out using a parameter, for example:

```javascript
fetcher.waitForConsent(150)
    .then(() => {
        // called if CMP gets back to us in under 150ms
    })
    .catch(err => {
        // err is a TimeoutError if the CMP takes longer
        // than 150ms
    });
```

## Compatibility
This library is built using Webpack and Babel, and is designed to work on IE10 and upwards. No support will be provided for IE versions less than 10, nor other obscure browsers and versions.
