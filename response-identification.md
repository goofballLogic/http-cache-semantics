## Identifying a cached response

The HTTP specification identifies "primary" and "secondary" cache keys to be used for the identification of a cached response.

> The primary cache key consists of the request method and target URI. However, since HTTP caches in common use today are typically limited to caching responses to GET, many caches simply decline other methods and use only the URI as the primary cache key.

[_from RFC 7234, section 2_][7234.2]

[7234.2]: http://httpwg.org/specs/rfc7234.html#caching.overview

