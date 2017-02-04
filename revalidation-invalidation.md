## Revalidation and Invalidation

So, your response isn't fresh? What next?<br>
_or_<br>
You want to do a POST that might alter the response you've previously cached? How do you flush invalid entries? 

Fear not... as well as determining the freshness of a cached response, the HTTP specification identifies mechanisms for:

1. Validation of a stale, cached response and the subsequent freshening and invalidation of related cached responses: [RFC 7234, section 4.3][7234.4.3]
2. The invalidation of cached responses due to the success of an "unsafe" request (i.e. POST, PUT etc.): [RFC 7234, section 4.4][7234.4.4]

### Identifying a cached response

The HTTP specification identifies "primary" and "secondary" cache keys to be used for the identification of a cached response.

> The primary cache key consists of the request method and target URI. However, since HTTP caches in common use today are typically limited to caching responses to GET, many caches simply decline other methods and use only the URI as the primary cache key.

[_from RFC 7234, section 2_][7234.2]



[7234.4.3]: http://httpwg.org/specs/rfc7234.html#validation.model
[7234.4.4]: http://httpwg.org/specs/rfc7234.html#invalidation
[7234.2]: http://httpwg.org/specs/rfc7234.html#caching.overview

