var util = require('../lib/util'), should = require('should'), __ = require('underscore');

describe('util', function () {

    describe('camelToDash', function () {
        __.each({
            'xAuthHeader': 'X-Auth-Header'
        }, function (v, k) {

            it('should convert "' + k + '" to "' + v + '"', function () {
                util.camelToDash(k).should.be.eql(v);
            });

        })


    });
});