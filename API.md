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
<dd><p>GDPR consent data</p>
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
    * [.attachToWindow([win])](#ConsentStringFetcher.attachToWindow) ⇒ [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)
    * [.off(eventType, callback)](#ConsentStringFetcher.off)
    * [.on(eventType, callback)](#ConsentStringFetcher.on) ⇒ [<code>OnMethodReturnValue</code>](#OnMethodReturnValue)
    * [.shutdown()](#ConsentStringFetcher.shutdown)
    * [.waitForConsent()](#ConsentStringFetcher.waitForConsent) ⇒ [<code>Promise.&lt;CMPConsentData&gt;</code>](#CMPConsentData)
    * [.waitForConsentString()](#ConsentStringFetcher.waitForConsentString) ⇒ <code>Promise.&lt;String&gt;</code>
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
The last successfully fetched consent data object

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
<a name="ConsentStringFetcher.waitForConsent"></a>

### ConsentStringFetcher.waitForConsent() ⇒ [<code>Promise.&lt;CMPConsentData&gt;</code>](#CMPConsentData)
Wait for consent data

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Returns**: [<code>Promise.&lt;CMPConsentData&gt;</code>](#CMPConsentData) - Promise that resolves with consent data
 from the CMP system. Be aware that the promise may never resolve if consent
 data is never received.  
<a name="ConsentStringFetcher.waitForConsentString"></a>

### ConsentStringFetcher.waitForConsentString() ⇒ <code>Promise.&lt;String&gt;</code>
Wait for a consent string

**Kind**: static method of [<code>ConsentStringFetcher</code>](#ConsentStringFetcher)  
**Returns**: <code>Promise.&lt;String&gt;</code> - Promise that resolves with a consent string
 from the CMP system.  
**See**: waitForConsent  
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
GDPR consent data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| consentData | <code>String</code> | GDPR consent string |
| gdprApplies | <code>Boolean</code> | Whether GDPR applies in the current context |
| hasGlobalScope | <code>Boolean</code> | "true if the vendor consent data is retrieved from the global cookie, false if from a publisher-specific (or publisher-group-specific) cookie" |

<a name="OnMethodReturnValue"></a>

## OnMethodReturnValue
.on() return value

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| remove | <code>function</code> | Remove method to cancel the listener |

