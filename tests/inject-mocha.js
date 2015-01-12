var invoker = require('../lib/nojector')(),
    should = require('should'),
    assert = require('assert'), slice = Function.call.bind(Array.prototype.slice), when = require('../lib/when').when;
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
            abc: str
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
        }
    }

}

describe('inject', function () {
    it('should invoke a nested function', function (done) {
        invoker.invoke(obj, 'stuff/2/c/f').then(function (ret) {
            ret.should.eql(1);
            done();
        });
    });
    it('should invoke a nested function with args', function (done) {
        invoker.invoke(obj, 'func/abc', {}, null, 1).then(function (ret) {
            ret.should.eql(1);
            done();
        });
    });
    it('should invoke callback on execption', function (done) {
        invoker.invoke(obj, 'deep/fail').then(null, function (e) {
            e.should.have.property('message', 'hello');
            done();
        })
    });
    it('should return null', function (done) {
        invoker.invoke(obj, 'nullvalue').then(function (v) {
            should.not.exist(v);
            done();
        })
    });
    it('should return nested property', function (done) {
        invoker.invoke(obj, 'nested/property').then(function (v) {
            v.should.eql(1)
            done();
        })
    });
    it('should return nested property obj', function (done) {
        invoker.invoke(obj, 'nested/property').then(function (v) {
            v.should.eql(1)
            done();
        })
    });

    it('should return array by index', function (done) {
        invoker.invoke(obj, 'array/0').then(function (v) {
            v.should.eql(1)
            done();
        })
    });
    it('should return array by index and property', function (done) {
        invoker.invoke(obj, 'stuff/1/b').then(function (v) {
            v.should.eql(2)
            done();
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


    it('should resolve arguments', function (done) {
        // this.timeout(400000);
        var scope = {
            query: {a: 1},
            session: {a: 2, b: 1},
            body: {a: 3, du: 3, b: 2}
        }
        invoker.resolve(function aFineQuery$here(query$a, session$a, body$du, none, query$none, any$b, b, require$$$tests$support$junk) {
            return slice(arguments).concat(this);
        }, {junk: 1}, scope).then(function (args) {
            assert.strictEqual(args[0], 1, "resolved query$a");
            assert.strictEqual(args[1], 2, "resolved session$a");
            assert.strictEqual(args[2], 3, "resolved body$du");
            assert.strictEqual(args[3], void(0), "resolved none");
            assert.strictEqual(args[4], void(0), "resolved query$none");
            assert.strictEqual(args[5], void(0), "resolved any$b");
            //     assert.strictEqual(args[6], 2, "resolved any b");
            assert.strictEqual(args[8].junk, 1, "resolved module.junk ");
            done();
        }, function (e) {
            done(new Error(e));
        });
    });
    it('should inject args for non resolved patterns', function (done) {

        var scope = {
            query: {a: 1},
            session: {a: 2, b: 1},
            body: {a: 4, du: 4, b: 2}
        }
        invoker.resolve(function aFineQuery$here(query$a, a1, a2, body$a, a3) {
            return slice(arguments).concat(this);
        }, {junk: 1}, scope, 0, 2, 3).then(function (args) {
            assert.strictEqual(args[0], 1, "resolved query$a");
            assert.strictEqual(args[1], 2, "resolved args$a1");
            assert.strictEqual(args[2], 3, "resolved args$a2");
            assert.strictEqual(args[3], 4, "resolved body$a");
            assert.strictEqual(args[4], void(0), "resolved a3");
            //     assert.strictEqual(args[6], 2, "resolved any b");
            assert.strictEqual(args[5].junk, 1, "resolved module.junk ");
            done();
        });
    })
});
