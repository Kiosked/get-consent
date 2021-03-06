# Get-Consent changelog

## v1.5.1
_2020-01-16_

 * Fix `postMessage` communication (#9)

## v1.5.0
_2019-12-30_

 * USP override via `window.__uspStrOvr`

## v1.4.0
_2019-12-27_

 * `uspOptsOut` method for detecting if a USP string opts out of data sales

## v1.3.0
_2019-12-18_

 * **CCPA** support:
   * `getUSPString`, `onUSPString` and `uspApplies` methods for dealing with the US Privacy framework from IAB

## v1.2.0
_2019-11-13_

 * Support `__cmp` consent callbacks specifying `undefined` for _success_ parameter

## v1.1.0
_2019-11-07_

 * Mem `_` override for cached values

## v1.0.0
_2019-11-06_

 * Brand new library and structure
   * Functional, not class-based
 * Memoized results
 * Iframe support via `window.top.postMessage`

## v0.5.0
_2019-10-16_

 * `NoConsentError` for handling failures where consent is not available from the CMP

## v0.4.0
_2019-09-26_

 * SourcePoint CMP support for Google consent

## v0.3.0
_2019-09-16_

 * Google consent detection via `waitForGoogleConsent`

## v0.2.3
_2019-02-28_

 * **Bugfix**: Adding multiple `fetcher.on(/* ... */)` listeners would result in some callbacks _not_ being fired

## v0.2.2
_2018-09-28_

 * Remove `p-timeout` dependency

## v0.2.1
_2018-09-28_

 * **Bugfix**: `waitForConsent` (and thusly `waitForConsentString`) would not resolve if called _after_ the `__cmp` method was located and requested
 * Added `waitForVendorConsents` to return vendor consents
 * Added event for `vendorConsentsData` which returns vendor consents
 * Added timeout support for all waitFor* methods

## v0.1.1
_2018-09-19_

 * Improve timers for `__cmp()` check

## v0.1.0
_2018-09-18_

 * Initial release
