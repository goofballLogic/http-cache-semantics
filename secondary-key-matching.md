### Matching a secondary key
The secondary key is an array of two elements. The first is a list of headers identfied by the `Vary` header of the initial response. The second is a corresponding list of values to match. The HTTP specification allows for some transformation of header values prior to comparison ([RFC 7234, section 4.1][7234.4.1]) In particular, note the following conventions:

1. the same header occurring more than once is semantically equivalent to a comma-separated list of those header values. (per [RFC 7230, section 3.2.2][7230.3.2.2])
2. in this implementation, a missing header is treated as semantically equivalent to a blank header.

Other rules may also be applied based on known semantics of particular headers (see [RFC 7230, section 3.2.4][7230.3.2.4]), but these are beyond the scope of this guide, and good caching performance may be achieved without their implementation.

An example implementation:

```javascript
function matchSecondaryKey(cachePolicy, req){
	const [headers,values]=cachePolicy.key()[2];
    for(let i=0;i<headers.length;i++){
    	// the cached header and value
    	const cacheHeader = headers[i];
        const cacheValue = values[i];
        // find all request headers matching the cached one
        const requestValues = Object.keys(req.headers)
        	.filter(reqHeader => reqHeader.toLowerCase()===cacheHeader)
            .map(reqHeader => req.headers[reqHeader]);
        // a CSV of the located request headers
        const requestValue = requestValues.length ? requestValues.join(',') : '';
        // values must be equal, otherwise the match fails 
        if(cacheValue!==requestValue) {
        	return false;
        }
    }
    // all headers match
    return true;
}
```
