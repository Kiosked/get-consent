## Modules

<dl>
<dt><a href="#module_GetConsent">GetConsent</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#getUSPCookieValue">getUSPCookieValue([win])</a> ⇒ <code>String</code> | <code>null</code></dt>
<dd><p>Get the cookie value for the USP string</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#GetConsentDataOptions">GetConsentDataOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#OnUSPStringOptions">OnUSPStringOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#ConsentPayload">ConsentPayload</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#VendorConsentPayload">VendorConsentPayload</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#GoogleConsentPayload">GoogleConsentPayload</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#WaitForConsentDataOptions">WaitForConsentDataOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#Mem">Mem</a> : <code>Array</code></dt>
<dd><p>Memoized function collection</p>
</dd>
</dl>

<a name="module_GetConsent"></a>

## GetConsent

* [GetConsent](#module_GetConsent)
    * [.exports.getConsentData([options])](#module_GetConsent.exports.getConsentData) ⇒ <code>Promise.&lt;(null\|ConsentPayload\|VendorConsentPayload\|GoogleConsentPayload)&gt;</code>
    * [.exports.getConsentString([options])](#module_GetConsent.exports.getConsentString) ⇒ <code>Promise.&lt;(String\|null)&gt;</code>
    * [.exports.getGoogleConsent([options])](#module_GetConsent.exports.getGoogleConsent) ⇒ <code>Promise.&lt;(Number\|null)&gt;</code>
    * [.exports.getUSPString([options])](#module_GetConsent.exports.getUSPString) ⇒ <code>Promise.&lt;(String\|null)&gt;</code>
    * [.exports.getVendorConsentData([options])](#module_GetConsent.exports.getVendorConsentData) ⇒ <code>Promise.&lt;(VendorConsentPayload\|null)&gt;</code>
    * [.exports.onConsentData(cb, [options])](#module_GetConsent.exports.onConsentData) ⇒ <code>function</code>
    * [.exports.onConsentString(cb, [options])](#module_GetConsent.exports.onConsentString) ⇒ <code>function</code>
    * [.exports.onGoogleConsent(cb, [options])](#module_GetConsent.exports.onGoogleConsent) ⇒ <code>function</code>
    * [.exports.onUSPString(cb, [options])](#module_GetConsent.exports.onUSPString) ⇒ <code>function</code>
    * [.exports.onVendorConsent(cb, [options])](#module_GetConsent.exports.onVendorConsent) ⇒ <code>function</code>
    * [.exports.createMem()](#module_GetConsent.exports.createMem) ⇒ [<code>Mem</code>](#Mem)
    * [.exports.uspApplies(str)](#module_GetConsent.exports.uspApplies) ⇒ <code>Boolean</code>
    * [.exports.uspOptsOut(str)](#module_GetConsent.exports.uspOptsOut) ⇒ <code>Boolean</code>

<a name="module_GetConsent.exports.getConsentData"></a>

### GetConsent.exports.getConsentData([options]) ⇒ <code>Promise.&lt;(null\|ConsentPayload\|VendorConsentPayload\|GoogleConsentPayload)&gt;</code>
Get consent data from a CMP

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>Promise.&lt;(null\|ConsentPayload\|VendorConsentPayload\|GoogleConsentPayload)&gt;</code> - A promise that resolves with consent data, or null if appropriate  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>GetConsentDataOptions</code>](#GetConsentDataOptions) | Options for the CMP/consent  request |

<a name="module_GetConsent.exports.getConsentString"></a>

### GetConsent.exports.getConsentString([options]) ⇒ <code>Promise.&lt;(String\|null)&gt;</code>
Get the current consent string, if available

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>GetConsentDataOptions</code>](#GetConsentDataOptions) | Options for the lookup |

<a name="module_GetConsent.exports.getGoogleConsent"></a>

### GetConsent.exports.getGoogleConsent([options]) ⇒ <code>Promise.&lt;(Number\|null)&gt;</code>
Get the current Google consent state, if available

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>Promise.&lt;(Number\|null)&gt;</code> - Returns 1 or 0 for Google consent,
 or null if not available and specified not to throw  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>GetConsentDataOptions</code>](#GetConsentDataOptions) | Options for the lookup |

<a name="module_GetConsent.exports.getUSPString"></a>

### GetConsent.exports.getUSPString([options]) ⇒ <code>Promise.&lt;(String\|null)&gt;</code>
Get the USP string, if available (CCPA)

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>Promise.&lt;(String\|null)&gt;</code> - The USP string if found or
 null  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>GetConsentDataOptions</code>](#GetConsentDataOptions) | Options for the lookup |

<a name="module_GetConsent.exports.getVendorConsentData"></a>

### GetConsent.exports.getVendorConsentData([options]) ⇒ <code>Promise.&lt;(VendorConsentPayload\|null)&gt;</code>
Get the current vendors consent state, if available

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>GetConsentDataOptions</code>](#GetConsentDataOptions) | Options for the lookup |

<a name="module_GetConsent.exports.onConsentData"></a>

### GetConsent.exports.onConsentData(cb, [options]) ⇒ <code>function</code>
Listen for consent data and fire a callback once received

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>function</code> - Function to call to stop listening  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | The callback to fire - receives the  `ConsentPayload` |
| [options] | [<code>GetConsentDataOptions</code>](#GetConsentDataOptions) | Options for the lookup |

**Example**  
```js
const remove = onConsentData(
     (err, data) => {
         if (err) {
             console.error(err);
         } else {
             console.log("Consent payload:", data);
         }
     },
     { win: window.top }
 );
 // Later:
 remove();
```
<a name="module_GetConsent.exports.onConsentString"></a>

### GetConsent.exports.onConsentString(cb, [options]) ⇒ <code>function</code>
Listen for consent data and fire a callback with the
 consent string once received

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>function</code> - Removal function  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to fire - receives  just the consent string or an error if not avail. |
| [options] | [<code>GetConsentDataOptions</code>](#GetConsentDataOptions) |  |

<a name="module_GetConsent.exports.onGoogleConsent"></a>

### GetConsent.exports.onGoogleConsent(cb, [options]) ⇒ <code>function</code>
Listen for consent data and fire a callback with the
 consent string once received

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>function</code> - Removal function  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to fire - receives  just the consent string or an error if not avail. |
| [options] | [<code>GetConsentDataOptions</code>](#GetConsentDataOptions) |  |

<a name="module_GetConsent.exports.onUSPString"></a>

### GetConsent.exports.onUSPString(cb, [options]) ⇒ <code>function</code>
Listen for a USP string and fire a callback with
 the privacy string once received

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>function</code> - Removal function  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to fire - called  with (error, uspString): error if failed, or  null and with uspString as following argument |
| [options] | [<code>OnUSPStringOptions</code>](#OnUSPStringOptions) |  |

<a name="module_GetConsent.exports.onVendorConsent"></a>

### GetConsent.exports.onVendorConsent(cb, [options]) ⇒ <code>function</code>
Listen for consent data and fire a callback with
 vendor consent data once received

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>function</code> - Removal function  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to fire - receives  vendor consent data or an error if not avail. |
| [options] | [<code>GetConsentDataOptions</code>](#GetConsentDataOptions) |  |

<a name="module_GetConsent.exports.createMem"></a>

### GetConsent.exports.createMem() ⇒ [<code>Mem</code>](#Mem)
Create a new memoization instance

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
<a name="module_GetConsent.exports.uspApplies"></a>

### GetConsent.exports.uspApplies(str) ⇒ <code>Boolean</code>
Detect whether or not a value is indicative of
USP applying to the user (does not detect
whether or not the string disables data sales).

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>Boolean</code> - Whether or not a value is a
 USP string and whether or not USP applies due
 to it  
**See**: uspOptsOut  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>String</code> \| <code>\*</code> | The USP string or value |

**Example**  
```js
uspApplies("1---") // false
 uspApplies("1YN-") // true
```
<a name="module_GetConsent.exports.uspOptsOut"></a>

### GetConsent.exports.uspOptsOut(str) ⇒ <code>Boolean</code>
Detect whether or not a USP string opts a user
out of data sales.

**Kind**: static method of [<code>GetConsent</code>](#module_GetConsent)  
**Returns**: <code>Boolean</code> - True if the value is a USP
 string that opts the user out from the sale
 of their data  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>String</code> \| <code>\*</code> | The USP string or value |

**Example**  
```js
uspOptsOut("1---") // false
 uspOptsOut("1YYN") // true
```
<a name="getUSPCookieValue"></a>

## getUSPCookieValue([win]) ⇒ <code>String</code> \| <code>null</code>
Get the cookie value for the USP string

**Kind**: global function  
**Returns**: <code>String</code> \| <code>null</code> - The USP string or null if
 not found  

| Param | Type | Description |
| --- | --- | --- |
| [win] | <code>Window</code> | Optional window override |

<a name="GetConsentDataOptions"></a>

## GetConsentDataOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [mem] | [<code>Mem</code>](#Mem) | Memoization collection for caching results |
| [noConsent] | <code>String</code> | Action to take when no consent or fetching  times-out. When set to "reject" (default), an error is thrown. When set  to "resolve", null is returned. |
| timeout | <code>Number</code> \| <code>null</code> | Timeout in milliseconds. Defaults to  null (no timeout). |
| [type] | <code>String</code> | Type of consent data to fetch. Defaults to ""  (generic CMP consent data). Can be set to "google" for Google consent  data, "usp" for USP strings or "vendor" for vendors consent data. |
| [win] | <code>Window</code> | Optional window override. |

<a name="OnUSPStringOptions"></a>

## OnUSPStringOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [mem] | [<code>Mem</code>](#Mem) | Optional mem instance override |
| [win] | <code>Window</code> | Optional window instance override |

<a name="ConsentPayload"></a>

## ConsentPayload : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| consentData | <code>String</code> | Consent string for the user |
| gdprApplies | <code>Boolean</code> | Whether or not GDPR consent applies for  this particular user |
| hasGlobalConsent | <code>Boolean</code> | ? |
| hasGlobalScope | <code>Boolean</code> | Whether or not the publisher is  participating in the global scope for the IAB's consent framework |

<a name="VendorConsentPayload"></a>

## VendorConsentPayload : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| gdprApplies | <code>Boolean</code> | Whether or not GDPR consent applies for  this particular user |
| hasGlobalConsent | <code>Boolean</code> | ? |
| hasGlobalScope | <code>Boolean</code> | Whether or not the publisher is  participating in the global scope for the IAB's consent framework |
| metadata | <code>String</code> | Base64 encoded header information |
| purposeConsents | <code>Object.&lt;String, Boolean&gt;</code> | Key-value list of  purposes that the user has consented to. Key is a purpose ID, value  is whether or not consent was granted. |
| vendorConsents | <code>Object.&lt;String, Boolean&gt;</code> | Key-value list of  vendor IDs that the user has consented to |

<a name="GoogleConsentPayload"></a>

## GoogleConsentPayload : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| googlePersonalizationData | <code>Object</code> | Data related to Google  personalization state |
| googlePersonalizationData.consentValue | <code>Number</code> | Either 1 or  0, indicating whether or not Google personalization consent was  granted |
| googlePersonalizationData.created | <code>Date</code> \| <code>null</code> | When the consent state was created for this  user |
| googlePersonalizationData.lastUpdated | <code>Date</code> \| <code>null</code> | When the consent state was last updated  for this user |

<a name="WaitForConsentDataOptions"></a>

## WaitForConsentDataOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [cmpCmd] | <code>String</code> | CMP command to execute (default: "getConsentData") |
| cmpParam | <code>null</code> \| <code>Boolean</code> | Extra parameter to send to CMP (default: null). If  set to false it will not be provided in the __cmp call. |
| [validate] | <code>Boolean</code> | Validate CMP payload (only necessary for "getConsentData")  (default: true) |
| [win] | <code>Window</code> | Optional window reference override |

<a name="Mem"></a>

## Mem : <code>Array</code>
Memoized function collection

**Kind**: global typedef  
