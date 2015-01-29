var nojector = require('../lib/nojector'), invoker = nojector(),
    should = require('should'),
    promise = require('../lib/when').promise,
    assert = require('assert'), slice = Function.call.bind(Array.prototype.slice), when = require('../lib/when').when;

function IdArray() {
    var nu = Array.apply(null, arguments);
    nu.__proto__ = IdArray.prototype;
    return nu;
}

IdArray.prototype = {
    __proto__: Array.prototype,
    id: function (id) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i]._id == id) {
                return this[i];
            }
        }

    }
}


var obj = {
    property: 1,


    stuff: [
        {a: 1},
        {b: 2},
        {
            c: {
                f: function () {
                    return 1;
                }
            }
        },
        {_id: 'abc', c: 1}

    ],
    func: function (str) {
        return {
            abc: str,
            def: function (s, s2) {
                var ret = {}
                ret[str] = s2;
                return ret;
            }
        }
    },
    nullvalue: null,
    nested: {
        property: 1
    },
    array: [1, 2, 3],
    deep: {
        fail: function onFailDeep() {
            throw new Error("hello");
        },
        g: function (query$abc) {
            return query$abc;
        }
    },
    arrayWithId: IdArray.apply(null,
        'abc'.split('').map(function (v) {
            return {
                _id: v
            }
        }))

}

describe('inject', function () {

    describe('configure', function () {
        it('should be able to add custom resolvers', function () {
            var conf = nojector({
                //custom resolvers
                resolvers: {
                    hello: function (ctx, pos, param) {
                        return 'hello ' + param;
                    }
                }
            });
            var a = function (hello$world) {
                return hello$world;
            }
            return conf.resolve(a).then(function (val) {
                val.should.eql('hello world');

            });

        });
        it('should be trivial to create a bean resolver', function () {
            return nojector().alias('bean', obj).resolve(function (bean$deep$g) {
                return bean$deep$g;
            }, null, {req: {query: {abc: 123}}}, 'a', 'b').then(function (val) {
                val.should.eql(123);

            });
        });
    })
    describe('invoke', function () {
        it('should invoke a nested functions', function () {
            return invoker.invoke(obj, 'func/def/a', {}, null, 'a', 'b').then(function (ret) {
                ret.should.eql('b');
            });
        });
        it('should invoke a nested function', function () {
            return invoker.invoke(obj, 'stuff/2/c/f').then(function (ret) {
                ret.should.eql(1);
            });
        });
        it('should invoke a nested function with args', function () {
            return invoker.invoke(obj, 'func/abc', {}, null, 1).then(function (ret) {
                ret.should.eql(1);

            });
        });
        it('should invoke callback on execption', function () {
            return invoker.invoke(obj, 'deep/fail').then(null, function (e) {
                e.should.have.property('message', 'hello');

            })
        });
        it('should return null', function () {
            return invoker.invoke(obj, 'nullvalue').then(function (v) {
                should.not.exist(v);
            })
        });
        it('should return nested property', function () {
            return invoker.invoke(obj, 'nested/property').then(function (v) {
                v.should.eql(1)
            })
        });
        it('should return nested property obj', function () {
            return invoker.invoke(obj, 'nested/property').then(function (v) {
                v.should.eql(1)
            })
        });

        it('should return array by index', function () {
            return invoker.invoke(obj, 'array/0').then(function (v) {
                v.should.eql(1)

            })
        });
        it('should allow for id array arrayWithId', function () {
            return invoker.invoke(obj, 'arrayWithId/b').then(function (v) {
                v.should.have.property('_id', 'b');
            })
        });
        it('should return array by index and property', function () {
            return invoker.invoke(obj, 'stuff/1/b').then(function (v) {
                v.should.eql(2)
            })
        });

        it('should extract a single parameter', function () {
            var ret = invoker.extractArgNames(function (query$name) {
            });
            ret.should.have.property(0, 'query$name');
        });
        it('should extract a single parameter with a named function', function () {
            var ret = invoker.extractArgNames(function query$name(query$name) {
            });
            ret.should.have.property(0, 'query$name');
        });
    });
    describe('resolve', function () {
        it('should resolve query arguments', function () {
            // this.timeout(400000);
            var scope = {
                req: {
                    query: {a: 1}
                }
            }
            return invoker.resolve(function aFineQuery$here(query$a) {
                return slice(arguments).concat(this);
            }, {junk: 1}, scope).then(function (args) {
                assert.strictEqual(args[0], 1, "resolved query$a");
                assert.strictEqual(args[1].junk, 1, "resolved module.junk ");
            });
        });
        it('should resolve a function that returns a function', function () {
            var ctx = {
                req: {
                    query: {a: 1},
                    session: {a: 3, b: 2},
                    body: {a: 3, du: 3, b: 2}
                }
            };
            return invoker.resolve(function (query$a) {
                return function (session$b, session$a) {
                    return query$a + ' ' + session$b + ' ' + session$a;
                }
            }, null, ctx).then(function (ret) {
                ret.should.be.eql('1 2 3');
            })

        });
        it('should resolve a function that returns a promise', function () {
            var ctx = {
                req: {
                    query: {a: 1},
                    session: {a: 3, b: 2},
                    body: {a: 3, du: 3, b: 2}
                }
            };
            return invoker.resolve(function (query$a) {
                var p = promise();
                setTimeout(p.resolve.bind(p, null, query$a), 100);
                return p;
            }, null, ctx).then(function (ret) {
                ret.should.be.eql(1);
            })

        });
        it('should resolve arguments', function () {
            // this.timeout(400000);
            var scope = {
                req: {
                    query: {a: 1},
                    session: {a: 2, b: 1},
                    body: {a: 3, du: 3, b: 2}
                }
            }
            return invoker.resolve(function aFineQuery$here(query$a, session$a, body$du, none, query$none, any$b, b, require$$$tests$support$junk) {
                return slice(arguments).concat(this);
            }, {junk: 1}, scope).then(function (args) {
                assert.strictEqual(args[0], 1, "resolved query$a");
                assert.strictEqual(args[1], 2, "resolved session$a");
                assert.strictEqual(args[2], 3, "resolved body$du");
                assert.strictEqual(args[3], null, "resolved none");
                assert.strictEqual(args[4], void(0), "resolved query$none");
                assert.strictEqual(args[5], 2, "resolved any$b");
                //   assert.strictEqual(args[6], 2, "resolved b");
                //     assert.strictEqual(args[6], 2, "resolved any b");
                assert.strictEqual(args[8].junk, 1, "resolved module.junk ");
            });
        });
        it('should inject args for non resolved patterns', function () {

            var scope = {
                req: {
                    query: {a: 1},
                    session: {a: 2, b: 1},
                    body: {a: 4, du: 4, b: 2}
                }
            }
            return invoker.resolve(function aFineQuery$here(query$a, a1, a2, body$a, a3) {
                return slice(arguments).concat(this);
            }, {junk: 1}, scope, 0, 2, 3).then(function (args) {
                assert.strictEqual(args[0], 1, "resolved query$a");
                assert.strictEqual(args[1], 2, "resolved args$a1");
                assert.strictEqual(args[2], 3, "resolved args$a2");
                assert.strictEqual(args[3], 4, "resolved body$a");
                assert.strictEqual(args[4], void(0), "resolved a3");
                //     assert.strictEqual(args[6], 2, "resolved any b");
                assert.strictEqual(args[5].junk, 1, "resolved module.junk ");
            });
        })
        it('should inject args for all non resolved patterns', function () {

            return invoker.resolve(function aFineQuery$here(a, b, c) {
                return slice(arguments).concat(this);
            }, {junk: 1}, {}, 0, 1, 2).then(function (args) {
                assert.strictEqual(args[0], 0, "resolved query$a");
                assert.strictEqual(args[1], 1, "resolved args$a1");
                assert.strictEqual(args[2], 2, "resolved args$a2");
            });
        });
        it('should work with async resolvers', function () {
            var conf = nojector({
                //custom resolvers
                resolvers: {
                    async: function (ctx, pos, param) {
                        var obj = {};
                        obj[param] = ctx.args[pos];
                        var p = promise();
                        setTimeout(function () {
                            p.resolve(null, obj);
                        }, 100);
                        return p;
                    }
                }
            });
            //method you want to inject
            var a = function (async$user) {
                return async$user;
            }
            return conf.resolve(a, {}, null, 2).then(function (val) {
                val.should.have.property('user', 2);

            });
        });

    });
    describe('stringify', function () {

        it('should stringify resolved promises', function () {
            return invoker.stringify({
                a: {
                    stuff: function (query$abc) {
                        return query$abc;
                    },
                    prom: function () {
                        var p = promise();
                        setTimeout(p.resolve.bind(p, null, {
                            a: function (query$abc) {
                                var a = {};
                                a[query$abc] = 'd';
                                return a;
                            },
                            b: 'b'

                        }), 100);
                        return p;
                    }
                }
            }, {
                req: {
                    query: {
                        abc: 'def'
                    }
                }
            }).then(function (res) {
                //   res = JSON.parse(res);
                res.should.have.property('a');

                //res.a.should.have.property('stuff', 'def');

                res.a.should.have.property('prom');
            });
        })
        it('should stringify a simple function', function () {

            return invoker.stringify({
                a: {
                    stuff: function (query$abc) {
                        return query$abc;
                    },
                    prom: false
                }
            }, {
                req: {
                    query: {
                        abc: 'def'
                    }
                }
            }).then(function (res) {
                //   res = JSON.parse(res);
                res.should.have.property('a');

                res.a.should.have.property('stuff', 'def');

                //res.a.should.have.property('prom', false);
            });


        });
    });

});
