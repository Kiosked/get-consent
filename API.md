## Classes

<dl>
<dt><a href="#ConsentStringFetcher">ConsentStringFetcher</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#hasProperty">hasProperty(obj, propertyName)</a></dt>
<dd><p>Check if an object has a property</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#CMPConsentData">CMPConsentData</a> : <code>Object</code></dt>
<dd><p>GDPR consent data (from getConsentData)</p>
</dd>
<dt><a href="#CMPVendorConsentsData">CMPVendorConsentsData</a> : <code>Object</code></dt>
<dd><p>GDPR vendor consents (from getVendorConsents)</p>
</dd>
<dt><a href="#OnMethodReturnValue">OnMethodReturnValue</a></dt>
<dd><p>.on() return value</p>
</dd>
</dl>

<a name="ConsentStringFetcher"></a>

## ConsentStringFetcher
**Kind**: global class  

* [ConsentStringFetcher](#ConsentStringFetcher)
    * [new ConsentStringFetcher()](#new_ConsentStringFetcher_new)
    * [.module.exports](#ConsentStringFetcher.module.exports)
        * [new module.exports(win)](#new_ConsentStringFetcher.module.exports_new)
    * [.consentData](#ConsentStringFetcher.consentData) : [<code>CMPConsentData</code>](#CMPConsentData) \| <code>null</code>
    * [.vendorConsentsData](#ConsentStringFetcher.vendorConsentsData) : [<code>CMPVendorConsentsData</code>](#CMPVendorConsentsData) \| <code>null</code>
    * [.attachToWindow([win])](#ConsentStringFetcher.attachToWindow) ⇒ [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)
    * [.off(eventType, callback)](#ConsentStringFetcher.off)
    * [.on(eventType, callback)](#ConsentStringFetcher.on) ⇒ [<code>OnMethodReturnValue</code>](#OnMethodReturnValue)
    * [.shutdown()](#ConsentStringFetcher.shutdown)
    * [.waitForCMP(timeout)](#ConsentStringFetcher.waitForCMP) ⇒ <code>Promise</code>
    * [.waitForConsent(timeout)](#ConsentStringFetcher.waitForConsent) ⇒ [<code>Promise.&lt;CMPConsentData&gt;</code>](#CMPConsentData)
    * [.waitForConsentString(timeout)](#ConsentStringFetcher.waitForConsentString) ⇒ <code>Promise.&lt;String&gt;</code>
    * [.waitForVendorConsents(timeout)](#ConsentStringFetcher.waitForVendorConsents) ⇒ [<code>Promise.&lt;CMPVendorConsentsData&gt;</code>](#CMPVendorConsentsData)
    * [._fireCallback(type, data)](#ConsentStringFetcher._fireCallback)

<a name="new_ConsentStringFetcher_new"></a>

### new ConsentStringFetcher()
Consent String fetcher

<a name="ConsentStringFetcher.module.exports"></a>

### ConsentStringFetcher.module.exports
**Kind**: static class of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
<a name="new_ConsentStringFetcher.module.exports_new"></a>

#### new module.exports(win)
Constructor for the fetcher


| Param | Type | Description |
| --- | --- | --- |
| win | <code>Window</code> | The window instance (required) |

<a name="ConsentStringFetcher.consentData"></a>

### ConsentStringFetcher.consentData : [<code>CMPConsentData</code>](#CMPConsentData) \| <code>null</code>
The last successfully fetched consent data object (getConsentData)

**Kind**: static property of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Read only**: true  
<a name="ConsentStringFetcher.vendorConsentsData"></a>

### ConsentStringFetcher.vendorConsentsData : [<code>CMPVendorConsentsData</code>](#CMPVendorConsentsData) \| <code>null</code>
The last successfully fetched vendor consents payload (getVendorConsents)

**Kind**: static property of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Read only**: true  
<a name="ConsentStringFetcher.attachToWindow"></a>

### ConsentStringFetcher.attachToWindow([win]) ⇒ [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)
Create a fetcher attached to a window

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Returns**: [<code>ConsentStringFetcher</code>](#ConsentStringFetcher) - New fetcher instance  

| Param | Type | Description |
| --- | --- | --- |
| [win] | <code>Window</code> | The window to attach to |

<a name="ConsentStringFetcher.off"></a>

### ConsentStringFetcher.off(eventType, callback)
Remove event listener

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  

| Param | Type | Description |
| --- | --- | --- |
| eventType | <code>String</code> | The event type that was being listened to |
| callback | <code>function</code> | The callback function that was attached |

<a name="ConsentStringFetcher.on"></a>

### ConsentStringFetcher.on(eventType, callback) ⇒ [<code>OnMethodReturnValue</code>](#OnMethodReturnValue)
Attach an event

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Returns**: [<code>OnMethodReturnValue</code>](#OnMethodReturnValue) - Controls for the listener  

| Param | Type | Description |
| --- | --- | --- |
| eventType | <code>\*</code> | The type of event to listen to |
| callback | <code>\*</code> | The callback to fire when the event is triggered |

<a name="ConsentStringFetcher.shutdown"></a>

### ConsentStringFetcher.shutdown()
Shutdown the fetcher (detatch from window)

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
<a name="ConsentStringFetcher.waitForCMP"></a>

### ConsentStringFetcher.waitForCMP(timeout) ⇒ <code>Promise</code>
Wait for the appearance of a __cmp method

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Returns**: <code>Promise</code> - A promise that resolves once a CMP has been detected  
**Throws**:

- <code>TimeoutError</code> Throws a timeout error if the timeout is
 specified and it is reached


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| timeout | <code>Number</code> \| <code>null</code> | <code></code> | Timeout, in milliseconds, to wait for a  CMP to appear |

<a name="ConsentStringFetcher.waitForConsent"></a>

### ConsentStringFetcher.waitForConsent(timeout) ⇒ [<code>Promise.&lt;CMPConsentData&gt;</code>](#CMPConsentData)
Wait for consent data

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Returns**: [<code>Promise.&lt;CMPConsentData&gt;</code>](#CMPConsentData) - Promise that resolves with consent data
 from the CMP system  
**Throws**:

- <code>TimeoutError</code> Throws a timeout error if the timeout is
 specified and it is reached


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| timeout | <code>Number</code> \| <code>null</code> | <code></code> | Timeout, in milliseconds, for the fetching of  consent data |

<a name="ConsentStringFetcher.waitForConsentString"></a>

### ConsentStringFetcher.waitForConsentString(timeout) ⇒ <code>Promise.&lt;String&gt;</code>
Wait for a consent string

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Returns**: <code>Promise.&lt;String&gt;</code> - Promise that resolves with a consent string
 from the CMP system.  
**Throws**:

- <code>TimeoutError</code> Throws a timeout error if the timeout is
 specified and it is reached

**See**: waitForConsent  

| Param | Type | Description |
| --- | --- | --- |
| timeout | <code>Number</code> \| <code>null</code> | Timeout, in milliseconds, for the fetching of  a consent string |

<a name="ConsentStringFetcher.waitForVendorConsents"></a>

### ConsentStringFetcher.waitForVendorConsents(timeout) ⇒ [<code>Promise.&lt;CMPVendorConsentsData&gt;</code>](#CMPVendorConsentsData)
Wait for vendor consents (getVendorConsents)

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Returns**: [<code>Promise.&lt;CMPVendorConsentsData&gt;</code>](#CMPVendorConsentsData) - Promise that resolves with vendor
 consents once available  
**Throws**:

- <code>TimeoutError</code> Throws a timeout error if the timeout is
 specified and it is reached


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| timeout | <code>Number</code> \| <code>null</code> | <code></code> | Timeout, in milliseconds, for the fetching of  vendor consents |

<a name="ConsentStringFetcher._fireCallback"></a>

### ConsentStringFetcher._fireCallback(type, data)
Fire a callback

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Throws**:

- <code>Error</code> Throws if the callback type isn't recognised

**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | The callback type |
| data | <code>\*</code> | The data to provide to the callback |

<a name="hasProperty"></a>

## hasProperty(obj, propertyName)
Check if an object has a property

**Kind**: global function  

| Param | Type |
| --- | --- |
| obj | <code>Object</code> | 
| propertyName | <code>\*</code> | 

<a name="CMPConsentData"></a>

## CMPConsentData : <code>Object</code>
GDPR consent data (from getConsentData)

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| consentData | <code>String</code> | GDPR consent string |
| gdprApplies | <code>Boolean</code> | Whether GDPR applies in the current context or not |
| hasGlobalScope | <code>Boolean</code> | "true if the vendor consent data is retrieved from the global cookie, false if from a publisher-specific (or publisher-group-specific) cookie" |

<a name="CMPVendorConsentsData"></a>

## CMPVendorConsentsData : <code>Object</code>
GDPR vendor consents (from getVendorConsents)

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| gdprApplies | <code>Boolean</code> | Whether GDPR applies in the current context or not |
| hasGlobalScope | <code>Boolean</code> | "true if the vendor consent data is retrieved from the global cookie, false if from a publisher-specific (or publisher-group-specific) cookie" |
| purposeConsents | <code>Object</code> | Key-value object with purpose consent statuses. Key is vendor ID, value is true/false for consent. |
| vendorConsents | <code>Object</code> | Key-value object with vendor consent statuses. Key is vendor ID, value is true/false for consent. |

<a name="OnMethodReturnValue"></a>

## OnMethodReturnValue
.on() return value

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| remove | <code>function</code> | Remove method to cancel the listener |

