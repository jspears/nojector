"use strict";

var _u = require('underscore'),
    slice = Function.call.bind(Array.prototype.slice),
    funcRe = /\s*function\s*.*\((.*)\).*/, paramRe = /(\/\*\$([^]*?)\$\*\/|\/\*[^]*?\*\/)?\s*([^,]*)?\s*,?\s*/g,
    w = require('./when'), whenCB = w.whenCB, promise = w.promise, isPromise = w.isPromise
    ;

function extractArgNames(f) {
    if (!f) return [];
    paramRe.lastIndex = funcRe.lastIndex = 0;
    //javascript wtf?
    var me = funcRe.exec(f.toString())[1], match, ret = [];
    while ((match = paramRe.exec(me)) != null && (match[1] || match[2] || match[3] || match[4])) {
        ret.push(_u.compact(match.slice(2)).join('$'));
    }
    return ret;
}


var defSettings = {
    search: ['args', 'session', 'query', 'params', 'body', 'meta'],

    resolvers: require('./resolvers')
};

function keys(obj) {
    if (Array.isArray(obj)) return obj
    if (typeof obj === 'string') return obj.split(/,\s*/);
    return Object.keys(obj);
}
function onEachResolverMap(settings, v, pos) {
    var parts = v.split('$'), resolvers = parts.length > 1 ? [parts.shift()] : settings.search;
    return this.resolveWrap(settings, pos, resolvers, parts);
};

var Injector = function (options) {
    if (!(this instanceof Injector)) {
        return new Injector(options);
    }
    options = options || {};
    this.settings = _u.extend({}, defSettings, options);

    this.settings.resolvers = _u.extend({}, defSettings.resolvers, options.resolvers);
}
_u.extend(Injector.prototype, {
    split: /\/+?/gi,
    idField: '_id',
    extractArgNames: extractArgNames,

    /**
     * Returns an array of functions, that correspond to the resolvers.
     * @param fn
     * @param settings
     * @param args
     * @returns [function(ctx)];
     */
    extractResolvers: function invoke$extractResolvers(fn) {
        return extractArgNames(fn).map(onEachResolverMap.bind(this, this.settings));
    },
    resolve: function invoke$resolve(fn, scope, ctx) {
        var p = promise();
        this.resolveCB.apply(this, [p.resolve.bind(p)].concat(slice(arguments)));
        return p;
    },
    _resolveCB: function inject$_resolveCB(cb, fn, scope, ctx) {
        var api = this;
        var resolvers = this.extractResolvers(fn);
        whenCB(function (e, args) {
            if (e) {
                return cb(e);
            }
            try {
                cb(null, fn.apply(scope, args));
            } catch (e) {
                cb(e);
            }
        }, resolvers.map(function inject$resolveCB$map(f) {
            return f.call(api, ctx);
        }));

    },
    resolveCB: function inject$resolveCB(cb, fn, scope, ctx) {
        ctx = ctx || {};
        var args = slice(arguments, 4);
        if (args.length)
            ctx.args = args;
        this._resolveCB(cb, fn, scope, ctx);

    },

    resolveBind: function invoke$resolveBind(fn, scope) {
        var resolveBindCB$func = this.resolveBindCB(fn, scope);
        return function invoke$resolveBind$return(ctx) {
            var p = promise();
            var args = [p.resolve.bind(p), ctx].concat(slice(arguments, 1));
            resolveBindCB$func.apply(null, args);
            return p;
        }
    },
    resolveBindCB: function invoke$resolveBind(fn, scope) {
        var resolvers = this.extractResolvers(fn), api = this;
        return function invoke$resolveBindCB$return(cb, ctx) {
            var args = slice(arguments, 2);
            if (args.length)
                ctx.args = args;
            whenCB(function resolveBindCB$when(e, args) {
                if (e) {
                    return cb(e);
                }
                try {
                    cb(null, fn.apply(scope, args));
                } catch (e1) {
                    console.trace(e1);
                    cb(e1);
                }
            }, resolvers.map(function (f) {
                //should the error propogate, I think so... catch it from the caller.
                return f.call(api, ctx);
            }));
        }
    },
    /**
     * It will resolve from right to left.  The first resolver to not return undefined, the value is used.   This
     * can be null.  This will be performance critical
     * @param settings
     * @param resolvers
     * @param parts
     * @returns {Function}
     */
    resolveWrap: function invoke$resolveWrap(settings, pos, resolvers, parts) {
        var res = settings.resolvers || [], api = this, resolvers = resolvers || [];

        return function invoke$resolveWrap$return(ctx) {
            var args = [ctx, settings, pos].concat(parts);
            for (var i = resolvers.length - 1; i > -1; i--) {
                var ret = res[resolvers[i]].apply(api, args);
                if (ret !== void(0)) {
                    return ret;
                }
            }
            //returning undefined to follow contract.
            return;
        }
    },

    isExec: function (o) {
        if (o != null && typeof o !== 'string' && typeof o !== 'number')
            return typeof o.exec === 'function';
        return false;
    },
    advice: function inject$advice(str, ctx, obj, next, bv) {
        return next(bv);
    },

    invoke: function invoke(obj, str, ctx, advice) {
        var p = promise();
        this.invokeCB.apply(this, [p.resolve.bind(p)].concat(slice(arguments)));
        return p;

    },
    invokeCB: function invokeCB(cb, obj, str, ctx, advice) {
        ctx = ctx || {};

        if (!advice) {
            advice = this.advice;
        }
        ctx.args = slice(arguments, 5);
        if (str && _u.isString(str)) {
            str = str.split(this.split);
        }

        this._invokeInternal.apply(this, [cb, str, ctx, advice, obj]);

    },
    _invokeInternal: function (cb, str, ctx, advice, obj) {

        //Short circuit on null values.   Not an error just not anything else we can do.
        if (obj == null)
            return cb(null, obj);//might be undefined.

        //Short circuit on error, won't descend on them;
        if (obj instanceof Error) {
            obj._errorPath = str.join('.');
            return cb(obj);
        }
        var self = this, bound = function (e, robj) {
            if (e) {
                return cb(e);
            }
            return advice.call(self, str, ctx, obj, self._invokeInternal.bind(self, cb, str, ctx, advice), robj);
        }
        //Duck type check for promise
        if (isPromise(obj)) {
            return obj.then(bound.bind(null, null), cb);
        }

        //Check for execs.
        if (this.isExec(obj)) {
            return obj.exec(bound);

        }
        if (typeof obj === 'function') {
            return this._resolveCB(bound, obj, null, ctx);
        }
        //create a new context, so parent does not disappear in the async bits.
        var current = str.shift();
        ctx = _u.extend({}, ctx, {parent: obj});
        //not an object (maybe a number or bool?) nothing else we can do...
        if (!_u.isObject(obj)) {
            return str.length ? cb(new Error("not an object and could not descend " + str)) : cb(null, obj);
        }
        if (typeof current === 'function') {
            return this._resolveCB(bound, current, obj, ctx)
        }

        //arrays an objects can be returned when there's nothing else to do.

        if (typeof obj[current] === 'function') {
            return this._resolveCB(bound, obj[current], obj, ctx);
        }


        if (current === void(0)) {
            cb(null, obj);
            return;
        }

        if (Array.isArray(obj)) {
            //is it not an index property try finding it by id.
            if (!/^\d+?$/.test(current)) {
                var id = current;
                if (typeof obj.id === 'function') {
                    var node = obj.id(id);
                    if (node !== void(0))
                        return bound(null, node);
                }
            }
        }
        //Perhaps it is a property on the array 0,1,2 or anything else.
        return bound(null, obj[current]);

    },
    stringify: function (obj, ctx, promises, ret) {
        promises = promises || [];
        ret = ret || {};
        var oret = ret, p = promise(), self = this;
        _u.each(function (v, k) {
            if (isPromise(v)) {
                promises.push(v.then(function (ret) {
                    promises.push(self.stringify(ret, ctx, promises, ret).then(function (v) {
                        ret[k] = v;
                    }))
                }))
            } else if (typeof v === 'function') {
                promises.push(this.resolve(v, this, ctx).then(function (res) {
                    self.stringify(ret, ctx, promises, ret).then(function (v) {
                        ret[k] = v;
                    });
                }))
            }
        }, obj);

        return p.when(promises).then(function () {
            return oret;
        });
    }

});

return (module.exports = Injector);