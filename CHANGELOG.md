# Get-Consent changelog

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
