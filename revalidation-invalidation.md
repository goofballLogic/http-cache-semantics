## Revalidation and Invalidation

So, your response isn't fresh? What next?<br>
_or_<br>
You want to do a POST that might alter the response you've previously cached? How do you flush invalid entries? 

Fear not... as well as determining the freshness of a cached response, the HTTP specification identifies mechanisms for:

1. Validation of a stale, cached response and the subsequent freshening and invalidation of related cached responses: [RFC 7234, section 4.3][7234.4.3]
2. The invalidation of cached responses due to the success of an "unsafe" request (i.e. POST, PUT etc.): [RFC 7234, section 4.4][7234.4.4]

### Identifying a cached response

The HTTP specification tells us what "primary" and "secondary" cache keys to use when looking up a cached response.

_See [here](./response-identification.md) for more details._

[7234.4.3]: http://httpwg.org/specs/rfc7234.html#validation.model
[7234.4.4]: http://httpwg.org/specs/rfc7234.html#invalidation
