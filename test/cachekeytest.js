'use strict';

const assert = require('assert');
const CachePolicy = require('..');

const explicitPortRequest = {method:'GET',headers:{host:'www.w3c.org:80'},url:'/Protocols/rfc2616/rfc2616-sec14.html'};
const httpRequest = {method:'GET',headers:{host:'www.w3c.org'},url:'/Protocols/rfc2616/rfc2616-sec14.html'};
const httpsRequest = {method:'GET',secure:true,headers:{host:'www.w3c.org'},url:'/Protocols/rfc2616/rfc2616-sec14.html'};

const cacheableResponse = {headers:{'cache-control':'max-age=111'}};
const cacheableWithVaryResponse = {headers:{
    'cache-control':'max-age=5',
    'vary':'moon-phase, weather, Sun',
    'Sun':'shining',
    'Weather':'nice',
    'weather':'bright'
}};
const strongAndWeakValidatorResponse = {headers:Object.assign({'etag':'"123456789"','last-modified':'Tue, 15 Nov 1994 12:45:56 GMT'},cacheableResponse.headers)};

//const cacheSample = new CachePolicy(httpRequest,{headers:Object.assign({},cacheableWithVaryResponse.headers,strongAndWeakValidatorResponse.headers)});
//console.log( cacheSample.key() );

describe('Cache key', function() {
    // key schema version
    it('contains version', function() {
        const cache = new CachePolicy(httpRequest, cacheableResponse);
        assert.deepEqual(cache.key()[0],1);
    });
    // primary cache key: "presented effective request URI (Section 5.5 of [RFC7230])"
    it('contains effective request URI', function(){
        const cache = new CachePolicy(explicitPortRequest, cacheableResponse);
        assert.deepEqual(cache.key()[1],'http://www.w3c.org:80/Protocols/rfc2616/rfc2616-sec14.html');
    });
    it('contains default http port if implied', function() {
        const cache = new CachePolicy(httpRequest, cacheableResponse);
        assert.deepEqual(cache.key()[1],'http://www.w3c.org:80/Protocols/rfc2616/rfc2616-sec14.html');
    });
    it('contains default https port and protocol if implied', function() {
        const cache = new CachePolicy(httpsRequest, cacheableResponse);
        assert.deepEqual(cache.key()[1],'https://www.w3c.org:443/Protocols/rfc2616/rfc2616-sec14.html');
    });
    // secondary cache key: "all of the selecting header fields nominated by the Vary header"
    it('contains alpha sorted vary headers with basic key normalisations applied', function(){
        const cache = new CachePolicy(httpRequest, cacheableWithVaryResponse);
        assert.deepEqual(cache.key()[2][0],['moon-phase','sun','weather']);
    });
    it('contains vary headers with basic value normalisations applied', function(){
        const cache = new CachePolicy(httpRequest, cacheableWithVaryResponse);
        /*
            Multiple message-header fields with the same field-name MAY be present in a message if and only if the entire field-value for that header field is defined as a comma-separated list [i.e., #(values)].
            It MUST be possible to combine the multiple header fields into one "field-name: field-value" pair, without changing the semantics of the message, by appending each subsequent field-value to the first, each separated by a comma.
            The order in which header fields with the same field-name are received is therefore significant to the interpretation of the combined field value, and thus a proxy MUST NOT change the order of these field values when a message is forwarded
        */
        assert.deepEqual(cache.key()[2][1],['','shining','nice,bright']);
    });
    // freshening criteria
    it('contains specified validators', function(){
        const cache = new CachePolicy(httpRequest, strongAndWeakValidatorResponse);
        assert.deepEqual(cache.key()[3],{'etag':'"123456789"'});
        assert.deepEqual(cache.key()[4],{'last-modified':'Tue, 15 Nov 1994 12:45:56 GMT'});
    });
});
    