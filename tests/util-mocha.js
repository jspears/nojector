var util = require('../lib/util'), should = require('should'), __ = require('lodash');

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

    describe('extractArgNames', function () {
        __.each({
            'req': function hello(req) {
            },
            'req$': function hello(req$) {
            },
            'req$stuff': function (req$stuff) {
            },
            'req$stuff$': function (req$stuff$) {
            },
            'req,stuff': function hello(req, stuff) {
            },
            'req$,stuff$': function hello(req$, stuff$) {
            },
            'req$stuff,req': function (req$stuff, req) {
            },
            'req$stuff$,req': function (req$stuff$, req) {
            }

        }, function (v, k) {
            var parts = k.split(',');
            it('should extract ' + parts.length + ' "' + k + '" ', function () {
                var names = util.extractArgNames(v);
                names.should.have.property('length', parts.length);
                parts.forEach(function (v, i) {
                    names[i].should.be.eql(v);
                });
            });
        })
    })
});