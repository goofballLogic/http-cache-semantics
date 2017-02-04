## Revalidation and Invalidation

So, your response isn't fresh? What next?<br>
_or_<br>
You want to do a POST that might alter the response you've previously cached? How do you flush invalid entries? 

Fear not... as well as determining the freshness of a cached response, the HTTP specification identifies mechanisms for:

1. Validation of a stale, cached response and the subsequent freshening and invalidation of related cached responses: [RFC 7234, section 4.3][7234.4.3]
2. The invalidation of cached responses due to the success of an "unsafe" request (i.e. POST, PUT etc.): [RFC 7234, section 4.4][7234.4.4]

### A worked example

Request:
```
GET / HTTP/1.1
Host: localhost
Accept: text/html,*/*;q=0.9
Accept-Encoding: gzip
Accept-Language: en-US,en;q=0.8,de;q=0.6
```
Response:
```
HTTP/1.1 200 OK
Vary: X-TenantId,Accept-Encoding
Content-Type: text/plain; charset=utf-8
Content-Length: 11
ETag: W/"b-XrY7u+Ae7tCTyyK7j1rNww"
Date: Sat, 04 Feb 2017 20:58:41 GMT
```

### Identifying a cached response

The HTTP specification tells us what "primary" and "secondary" cache keys to use when looking up a cached response. (_See [here](./response-identification.md) for more details._)

For our example response, the primary key would be:
```
http://localhost:80/
```
and the secondary key would be:
```
Accept-Encoding: gzip
X-TenantId:
```

The primary and secondary keys can be extracted from the `key()` method of the CachePolicy object (the 2nd and 3rd array elements respectively):

```javascript
const cache = new CachePolicy(req, res);
const cacheKey = cache.key();
/*
   the Primary key is element 2:
   cacheKey[1] === 'http://localhost:80/'
   
   the Secondary key is element 3:
   cacheKey[2] === [['accept-encoding','x-tenantid'],['gzip','']]
*/
```

### Looking up a request in the cache
In order to see if your request is stored in the cache, the following sequence is recommended:

1. Look up your "effective request uri" ([RFC7230 5.5][7230.5.5]) against the _primary key_ of your cache policies.
2. Search the results for a matching [_secondary key_](./response-identification.md).
3. Verify freshness of the located cached response

### Validating a stale cache response
If your cached response is stale, normal cache behaviour is to validate the response with the originating server.

However, per the HTTP specification, only certain responses can be validated ([RFC 7234, section 4.3][7234.4.3]). For example, your cached response must contain at least one validator (an Etag or Last-Modified header).

To see whether a CachePolicy can be validated, you can call the `validationRequest()` method. If the cached response can be validated, the method will return the request you need to send. Otherwise, it will return `null`.

```javascript
// find any caches for this URI
const effectiveUri = fullUri(req); // 'http://localhost:80/'
const cachedResponses = await db.findCachedByUri(effectiveUri);

// must also match the secondary cache key
const matchedCache = cachedResponses.find(cachePolicy => matchSecondaryKey(cachePolicy,req));
if(!matchedCache){
	// no cached policy matches
    return null;
}

// fresh?
if(!matchedCache.stale()){
	// fresh - we're done :)
    return matchedCache
}

// can this stale request be validated?
const validationRequest = matchedCache.validationRequest();
if(!validationRequest){
	// can't be validated and should be thrown away :(
    await invalidate(matchedCache);
    return fetch(req);
} else {
	// can be validated, all is not lost :)
    return await validate(validationRequest,matchedCache);
}
```

Notes on matching the secondary key, along with an example implementation can be found [here](./secondary-key-matching.md).

### Handling a Validation Response

Once you receive a validation response, any successful response other than a 304 means that validation has failed, and your cached response is now invalid and should be thrown away.

For example:
```javascript
function async validate(validationRequest,matchedCache){
   const validationResponse = await fetch(validationRequest);
   if(validationResponse.status<400){
       // the matched cache is now invalid and should be thrown away
       await invalidate(matchedCache);
       return validationResponse;
   } else if(validationResponse.status===403){
       // can be freshened!
       return await freshen(matchedCache,validationResponse);
   } else {
       // an error
       debug('Cache response validation failed',validationResponse);
       throw new Error(`Cache response validation failed: ${validationResponse.status}`);
   }
}
```       


## Freshening cached responses
TBD

## Invalidation
TBD

[7234.4.3]: http://httpwg.org/specs/rfc7234.html#validation.model
[7234.4.4]: http://httpwg.org/specs/rfc7234.html#invalidation
[7234.4.1]: http://httpwg.org/specs/rfc7234.html#rfc.section.4.1
[7230.5.5]: http://httpwg.org/specs/rfc7230.html#effective.request.uri
[7230.3.2.2]: http://httpwg.org/specs/rfc7230.html#rfc.section.3.2.2
[7230.3.2.4]: http://httpwg.org/specs/rfc7230.html#rfc.section.3.2.4
