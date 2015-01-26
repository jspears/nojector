var util = require('../lib/when'), Promise = require('mpromise'), should = require('should'), promise = util.promise;

function resolve(promise, val, timeout) {
    setTimeout(function () {
        promise.resolve(null, val);
    }, timeout);
}
function resolveErr(promise, val, timeout) {
    setTimeout(function () {
        promise.resolve(val);
    }, timeout);
}
describe('when', function () {
    describe('next', function () {
        function make(val) {
            var p = promise();
            resolve(p, val, 100);
            return p;
        }

        it('should resolve a promise', function () {
            var scope = {};
            return promise().next(make(make(make(2))), scope, 1, 3).then(function (v) {
                v.should.be.eql(2);
            })
        });
        it('should continue resolving', function () {
            var p = promise();
            setTimeout(function () {
                p.resolve(null, make(10));
            }, 100);
            return p.next(function (ret) {
                return ret;
            }).then(function (res) {
                res.should.be.eql(10);
            });

        });
        it('should continue resolving with value', function () {
            var p = promise();

            p.resolve(null, 10);

            return p.next(function (ret) {
                return ret;
            }).then(function (res) {
                res.should.be.eql(10);
            });

        })
        it('should continue resolving with value returned promise', function () {
            var p = promise();

            p.resolve(null, 10);

            return p.next(function (ret) {
                return make(ret);
            }).then(function (res) {
                res.should.be.eql(10);
            });

        })
        it('should continue resolving with value returned promise and with promise', function () {
            var p = promise();

            p.resolve(null, make(10));

            return p.next(function (ret) {
                return make(ret);
            }).then(function (res) {
                res.should.be.eql(10);
            });

        })

    })
    describe('when', function () {
        it('should resolve a promise when all children have been resolved', function () {

            var p1 = new Promise(), p2 = new Promise(), p3 = new Promise();
            var p = util.when([p1, p2, p3]).then(function (ret) {
                ret.should.have.lengthOf(3);
            });
            resolve(p1, 1, 300);
            resolve(p2, 2, 100);
            resolve(p3, 3, 200);
            return p;
        });
        it('should work with a resolved promise', function () {

            var p1 = new Promise(), p2 = new Promise(), p3 = new Promise();
            p2.resolve(null, 2);
            var w = util.when([p1, p2, p3]).then(function (ret) {
                ret.should.have.lengthOf(3);
            });
            resolve(p1, 1, 300);
            resolve(p3, 3, 200);
            return w;
        });
        it('should work with all resolved promises', function () {

            var p1 = new Promise(), p2 = new Promise(), p3 = new Promise();
            p2.resolve(null, 2);
            p3.resolve(null, 3);
            p1.resolve(null, 1);
            return util.when([p1, p2, p3]).then(function (ret) {
                ret.should.have.lengthOf(3);
            });
        });
        it('should work with one resolved promise', function () {

            var p1 = new Promise();
            p1.resolve(null, 1);
            return util.when([p1]).then(function (ret) {
                ret.should.have.lengthOf(1);
            });
        });
        it('should work with one resolved promise in error', function (done) {

            var p1 = new Promise();
            p1.reject(1);
            var error;
            util.when([p1]).then(function () {
                error = new Error("should not have executed");
            }, function (ret) {
                ret.should.eql(1);
                error = false;
            });
            setTimeout(function () {
                if (error) return done(error);
                if (error !== false) {
                    done(new Error("Should not have been called"))
                } else {
                    done();
                }

            }, 1000);
        });

        it('should short circuit on error', function (done) {

            var p1 = new Promise(), p2 = new Promise(), p3 = new Promise();
            util.when([p1, p2, p3]).then(function (ret) {
            }, function (e) {
                done();
            });
            resolveErr(p1, 1, 300);
            resolve(p2, 2, 100);
            resolve(p3, 3, 200);

        });
        it('should resolve the value when it is not a promise', function () {
            var p1 = new Promise(), p2 = new Promise(), p3 = 3;
            var w = util.when(p1, p2, p3).then(function (values) {
                values.should.have.property(0, 1);
                values.should.have.property(1, 2);
                values.should.have.property(2, 3);
            });
            resolve(p1, 1, 300);
            resolve(p2, 2, 100);
            return w;
        })
        it('should reject the value when the value is an error', function (done) {
            var p1 = new Promise(), p2 = new Promise(), p3 = new Error();
            util.when(p1, p2, p3).then(function (e) {
                done(new Error('should have not been called'));
            }, function (e) {
                done();
            });
            resolve(p1, 1, 300);
            resolve(p2, 2, 100);
        })
        it('should resolve when there are no promises', function () {
            return util.when();
        });
        it('should resolve when there are no promises []', function () {
            return util.when([]);
        });
        it('should resolve when there are no promises in multiple args', function () {
            return util.when([], []);
        })
        it('should resolve when there are no promises and values', function () {
            return util.when([1, 2, 3]).then(function (args) {
                args.should.have.property(0, 1);
                args.should.have.property(1, 2);
                args.should.have.property(2, 3);
                args.should.have.property('length', 3);
            });
        })
        it('should resolve when there are no promises and values are functions', function () {
            var f1 = function () {
                return 1;
            }, f2 = function () {
                return 2;
            };
            return util.when(f1, f2).then(function (args) {
                args.should.have.property(0, f1);
                args.should.have.property(1, f2);
                args.should.have.property('length', 2);
            });
        })
    })
    describe('chain', function () {
        function add1(a) {
            return a + 1;
        }

        it('should resolve no args', function () {
            return util.chain().then(function (v) {
                should.not.exist(v)
            });
        });
        it('should resolve a list of functions', function () {
            return util.chain(1, add1, add1, add1).then(function (v) {
                ({v: v}).should.have.property('v', 4);
            });
        });

        it('should resolve a list of functions some return promise', function (done) {
            util.chain(1, add1, function (v) {
                var p = util.promise();
                v += 2;
                setTimeout(p.resolve.bind(p, null, v), 100);
                return p;

            }, add1).then(function (v) {
                ({v: v}).should.have.property('v', 5);
                done();
            });
        });
        it('should resolve a list of functions some and use a promise', function () {
            return util.promise(function (e, v) {
                should.not.exist(e);
                ({v: v}).should.have.property('v', 5);
            }).chain(1, add1, function (v) {
                var p = util.promise();
                v += 2;
                setTimeout(p.resolve.bind(p, null, v), 100);
                return p;

            }, add1);
        });
        it('should an error resolve a list of functions some and use a promise', function (done) {
            util.promise(function (e, v) {
                e.should.be.eql('failed');

                done();
            }).chain(1, add1, function (v) {
                var p = util.promise();
                setTimeout(p.reject.bind(p, "failed"), 100);
                return p;

            }, add1);
        });
        it('should resolve a list of functions some and use a promise as last element', function () {
            return util.promise(function (e, v) {
                should.not.exist(e);
                ({v: v}).should.have.property('v', 4);
            }).chain(1, add1, function (v) {
                var p = util.promise();
                v += 2;
                setTimeout(p.resolve.bind(p, null, v), 100);
                return p;

            });
        });


        it('should resolve a chain of promises', function () {

            var f = function (v) {
                v = v || 0;
                var p = util.promise();
                v += 2;
                setTimeout(p.resolve.bind(p, null, v), 100);
                return p;
            }
            return util.promise(function (e, v) {
                should.not.exist(e);
                ({v: v}).should.have.property('v', 6);
            }).chain(f, f, f);
        });
    });
});