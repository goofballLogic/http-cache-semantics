'use strict';

const assert = require('assert');
const CachePolicy = require('..');

const httpRequest = {method:'GET',headers:{host:'www.w3c.org'},url:'/Protocols/rfc2616/rfc2616-sec14.html'};

const cacheableResponse = {headers:{'cache-control':'max-age=111'}};

const validationResponseWithVary = {
    url:'/Protocols/rfc2616/rfc2616-sec14.html',
    headers:{
        'host':'www.w3c.org',
        'cache-control':'max-age=5',
        'vary':'sun',
        'sun':'shining'
    }
};
const validationResponseWithVaryAndStrongValidator = {
    url:'/Protocols/rfc2616/rfc2616-sec14.html',
    headers:Object.assign({'etag':'"123456789"'},validationResponseWithVary.headers)
};
const validationResponseWithVaryAndWeakValidator = {
    url:'/Protocols/rfc2616/rfc2616-sec14.html',
    headers:Object.assign({'etag':'W/"123456789"'},validationResponseWithVary.headers)
};
const validationResponseWithVaryAndStrongAndWeakValidators = {
    url:'/Protocols/rfc2616/rfc2616-sec14.html',
    headers:Object.assign({'etag':'"123456789"','last-modified':'Tue, 15 Nov 1994 12:45:26 GMT'},validationResponseWithVary.headers)
}

// "The stored response to update is identified by using the first match (if any) of the following:"
describe('Selectors', function() {
    // "If the new response contains a strong validator (see Section 2.1 of [RFC7232]), then that strong validator identifies the selected representation for update. 
    // All of the stored responses with the same strong validator are selected. 
    // If none of the stored responses contain the same strong validator, then the cache MUST NOT use the new response to update any stored responses."
    it("with strong validator -> cache key + strong validator", function(){
        const cache = new CachePolicy(httpRequest,cacheableResponse);
        const selector = cache.selector(validationResponseWithVaryAndStrongValidator);
        assert.deepEqual(selector,[
            1,
            'http://www.w3c.org:80/Protocols/rfc2616/rfc2616-sec14.html',
            [['sun'],['shining']],
            {'etag':'"123456789"'},
            null
        ]);
    });
    it("with strong and weak validators -> cache key + strong validator", function(){
        const cache = new CachePolicy(httpRequest,cacheableResponse);
        const selector = cache.selector(validationResponseWithVaryAndStrongAndWeakValidators);
        assert.deepEqual(selector,[
            1,
            'http://www.w3c.org:80/Protocols/rfc2616/rfc2616-sec14.html',
            [['sun'],['shining']],
            {'etag':'"123456789"'},
            null
        ]);
    });
    // "If the new response contains a weak validator and that validator corresponds to one of the cache's stored responses, then the most recent of those matching stored responses is selected for update"
    it("with weak validator -> cache key + weak validator", function(){
        const cache = new CachePolicy(httpRequest,cacheableResponse);
        const selector = cache.selector(validationResponseWithVaryAndWeakValidator);
        assert.deepEqual(selector,[
            1,
            'http://www.w3c.org:80/Protocols/rfc2616/rfc2616-sec14.html',
            [['sun'],['shining']],
            null,
            {'etag':'W/"123456789"'}
        ]);
    });
    // "If the new response does not include any form of validator (such as in the case where a client generates an If-Modified-Since request from a source other than the Last-Modified response header field), 
    // and there is only one stored response, and that stored response also lacks a validator, then that stored response is selected for update."
    it("with no validators -> cache key without validators", function(){
        const cache = new CachePolicy(httpRequest,cacheableResponse);
        const selector = cache.selector(validationResponseWithVary);
        assert.deepEqual(selector,[
            1,
            'http://www.w3c.org:80/Protocols/rfc2616/rfc2616-sec14.html',
            [['sun'],['shining']],
            null,
            null
        ]);
    });
});
    