'use strict';

const assert = require('assert');
const CachePolicy = require('..');

const simpleRequest = {method:'GET',headers:{host:'www.w3c.org'},url:'/Protocols/rfc2616/rfc2616-sec14.html'};
const simpleRequestBut = overrides=>Object.assign({},simpleRequest,overrides);

const cacheableResponse = {headers:{'cache-control':'max-age=111'}};
const etaggedResponse = {headers:Object.assign({'etag':'"123456789"'},cacheableResponse.headers)};
const lastModifiedResponse = {headers:Object.assign({'last-modified':'Tue, 15 Nov 1994 12:45:26 GMT'},cacheableResponse.headers)};
const alwaysVariableResponse = {headers:Object.assign({'vary':'*'},cacheableResponse.headers)};

describe('Can be revalidated?', function() {
    it('not if method mismatch',function(){
       const cache = new CachePolicy(simpleRequest,etaggedResponse);
       assert(!cache.validationRequest(simpleRequestBut({method:'POST'})));
    });
    it('not if url mismatch',function(){
       const cache = new CachePolicy(simpleRequest,etaggedResponse);
       assert(!cache.validationRequest(simpleRequestBut({url:'/yomomma'}))); 
    });
    it('not if host mismatch',function(){
        const cache = new CachePolicy(simpleRequest,etaggedResponse);
        assert(!cache.validationRequest(simpleRequestBut({headers:{host:'www.w4c.org'}})))
    });
    it('not if vary fields prevent',function(){
       const cache = new CachePolicy(simpleRequest,alwaysVariableResponse);
       assert(!cache.validationRequest(simpleRequest));
    });
    it('when entity tag validator is present', function() {
        const cache = new CachePolicy(simpleRequest, etaggedResponse);
        assert(cache.validationRequest(simpleRequest));
    });
    it('when last-modified validator is present', function() {
       const cache = new CachePolicy(simpleRequest, lastModifiedResponse);
       assert(cache.validationRequest(simpleRequest));
    });
    it('not without validators', function() {
        const cache = new CachePolicy(simpleRequest, cacheableResponse);
        assert(!cache.validationRequest(simpleRequest));
    })

});