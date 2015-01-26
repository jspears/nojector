var Promise = require('mpromise'),
    flatten = Function.apply.bind(Array.prototype.concat, []),
    slice = Function.call.bind(Array.prototype.slice)
    , _u = require('underscore'), inherits = require('util').inherits;

function promise(cb) {
    return new Promise(cb);
}

function isPromise(val) {
    if (!_u.isObject(val)) {
        return false;
    }
    return typeof val.then === 'function';
}
function whenCB(cb, subordinates) {
    subordinates = flatten(slice(arguments, 1));
    var length = subordinates.length, i = 0, current = length, values = Array(length), sub, emitted;
    for (; i < length; i++) {
        sub = subordinates[i];
        //speeding things up by not creating anonymous function when it is not a promise;
        if (!isPromise(sub)) {
            if (sub instanceof Error) {
                return cb(sub, values);
            } else {
                values[i] = sub;

                if (0 === (--current)) {
                    return cb(null, values);
                }
                continue;
            }
        }
        if ((emitted = sub.emitted) && ( emitted.fulfill || emitted.rejected)) {
            if (emitted.fulfill && emitted.fulfill) {
                values[i] = emitted.fulfill[0];
                if (0 === (--current)) {
                    return cb(null, values);
                }
            } else {
                return cb(emitted.rejected[0], values);
            }
            continue;
        }
        (function when$each(c, sub) {

            sub.then(function (val) {
                values[c] = val;
                if (0 === (--current)) {
                    current = -1;
                    return cb(null, values);
                }
            }, function (e) {
                current = -1;
                cb(e, values);
            });

        }(i, sub));


    }
    if (0 === current) {
        cb(null, values);
    }
}
function ifThenCB(cb, sub) {
    if (!isPromise(sub)) {
        if (sub instanceof Error) {
            return cb(sub, null);
        } else {
            return cb(null, sub);
        }
    }

    if ((emitted = sub.emitted)) {
        if (emitted.fulfill && emitted.fulfill.length) {
            return cb(null, emitted.fulfill[0]);
        } else if (emitted.rejected && emitted.rejected.length) {
            return cb(emitted.rejected[0], null);
        }
    }
    sub.then(cb.bind(null, null), cb.bind(null));
}
function ifThen(sub) {
    var pro = this instanceof Promise ? this : promise();
    ifThenCB(pro.resolve.bind(pro), sub);
    return pro;
}
function when(subordinates) {
    var pro = this instanceof Promise ? this : promise();
    whenCB(pro.resolve.bind(pro), flatten(arguments));
    return pro;

}

/**
 * Takes a value and a list of functions, values or promises, and
 * attempts to resolve them in order....
 *
 * @param cb
 * @param subordinates
 */

function chainCB(cb, subordinates) {
    subordinates = flatten(slice(arguments, 1));
    var length = subordinates.length;

    function _handleChain(p, val, sub) {
        sub = sub || subordinates[p];
        if (isPromise(sub)) {
            sub.then(function (v) {
                _handleChain(p + 1, v);
            }, cb);
            return;
        }
        if (typeof sub === 'function') {
            var ret = sub(val);
            if (isPromise(ret)) {
                _handleChain(p, val, ret);
            } else {
                _handleChain(p + 1, ret || val);
            }

            return;
        }
        if (length <= p || p && val == null) {
            return cb(null, val);
        }

        _handleChain(p + 1, sub);

    };

    _handleChain(0);


}
function chain(subordinates) {
    var pro = this instanceof Promise ? this : promise();
    chainCB(pro.resolve.bind(pro), flatten(arguments));

    return pro;
}
/**
 * Returns a new promise, with a promise.
 * it continues down the promises until a promise
 * is resolved with a non promise.
 *
 * If it is called in context of a Promise than
 * the first argument can be a function, in which
 * case when that function returns, it will wait
 * until it returns a non promise.
 *
 * @param p
 * @returns {*}
 */
function next(p) {
    var pro = promise();
    if (this instanceof Promise) {
        this.then(next$nextThen);
    }
    if (typeof p === 'function') {
        pro.then(p)
    } else {
        next$nextThen(p);
    }
    function next$nextThen(np) {
        if (isPromise(np)) {
            np.then(next$nextThen, pro.resolve.bind(pro));
        } else {
            pro.resolve(null, np);
        }
    }

    return pro;
}
function nextIf(p){
    if (typeof p === 'function' || isPromise(p))
        return next(p);
    return p;
}
Promise.prototype.when = when;
Promise.prototype.chain = chain;
Promise.prototype.next = next;
Promise.prototype.nextIf = nextIf;
module.exports = {
    promise: promise,
    chain: chain,
    when: when,
    whenCB: whenCB,
    chainCB: chainCB,
    isPromise: isPromise,
    next: next,
    ifThen: ifThen,
    ifThenCB: ifThenCB,
    nextIf:nextIf
}
