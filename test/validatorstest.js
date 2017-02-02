'use strict';

const assert = require('assert');
const CachePolicy = require('..');

const simpleRequest = {method:'GET',headers:{host:'www.w3c.org'},url:'/Protocols/rfc2616/rfc2616-sec14.html'};

const cacheableResponse = {headers:{'cache-control':'max-age=111'}};

const strongEtag = '"123456789"';
const weakEtag = 'W/'+strongEtag;
const etaggedResponse = {headers:Object.assign({'etag':strongEtag},cacheableResponse.headers)};
const weaklyEtaggedResponse = {headers:Object.assign({'etag':weakEtag},cacheableResponse.headers)};

const lastModifiedDate = 'Tue, 15 Nov 1994 12:45:26 GMT';
const lastModifiedResponse = {headers:Object.assign({'last-modified':lastModifiedDate},cacheableResponse.headers)};
const lastModifiedPlusMuchMoreRecentDateResponse = {headers:Object.assign({'date':'Tue, 15 Nov 1994 12:46:26 GMT'},lastModifiedResponse.headers)};
const lastModifiedPlusCloseDateResponse = {headers:Object.assign({'date':'Tue, 15 Nov 1994 12:45:56 GMT'},lastModifiedResponse.headers)};

const stronglyEtaggedAndLastModifiedResponse = {headers:Object.assign({}, etaggedResponse.headers, lastModifiedPlusMuchMoreRecentDateResponse.headers)};

describe('Validators', function() {
    it('last-modified is weak', function(){
        const cache = new CachePolicy(simpleRequest,lastModifiedResponse);
        assert.deepEqual(cache.validators(),{weak:{'last-modified':lastModifiedDate}});
    });
    it('last-modified plus significantly more recent date is strong', function(){
        const cache = new CachePolicy(simpleRequest,lastModifiedPlusMuchMoreRecentDateResponse);
        assert.deepEqual(cache.validators(),{strong:{'last-modified':lastModifiedDate}});
    });
    it('last-modified plus a close date is weak', function(){
        const cache = new CachePolicy(simpleRequest,lastModifiedPlusCloseDateResponse);
        assert.deepEqual(cache.validators(),{weak:{'last-modified':lastModifiedDate}});
    });
    it('etag is normally strong', function(){
        const cache = new CachePolicy(simpleRequest,etaggedResponse);
        assert.deepEqual(cache.validators(),{strong:{'etag':strongEtag}});
    });
    it('etag with indicated weakness is weak', function(){
        const cache = new CachePolicy(simpleRequest,weaklyEtaggedResponse);
        assert.deepEqual(cache.validators(),{weak:{'etag':weakEtag}});
    });
    it('strong etag plus strong last-modified', function(){
        const cache = new CachePolicy(simpleRequest,stronglyEtaggedAndLastModifiedResponse);
        assert.deepEqual(cache.validators(),{strong:{'etag':strongEtag,'last-modified':lastModifiedDate}});
    })
});
