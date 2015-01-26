"use strict";

var __ = require('lodash'),
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
        ret.push(__.compact(match.slice(2)).join('$'));
    }
    return ret;
}


var defSettings = {
    search: ['args', 'session', 'query', 'params', 'body', 'meta'],

    resolvers: require('./resolvers')
};

function onEachResolverMap(v, pos) {
    var parts = v.split('$');
    return this.resolveWrap(pos, parts.shift(), parts);
};
/**
 * Returns an array of functions, that correspond to the resolvers.
 * @param fn
 * @param args
 * @returns [function(ctx)];
 */
function extractResolvers(scope, fn) {
    return extractArgNames(fn).map(onEachResolverMap, scope);
}

var Injector = function (options) {
    if (!(this instanceof Injector)) {
        return new Injector(options);
    }
    options = options || {};
    this.settings = __.extend({}, defSettings, options);

    this.settings.resolvers = __.extend({}, defSettings.resolvers, options.resolvers);

/*
    this.settings.resolvers.ctx =  function(ctx, pos, param) {
        return ctx;
    }
    this.alias('req', function(ctx){
       return ctx.req;
    });
*/
    //this.alias('query', 'req$query')
}
__.extend(Injector.prototype, {
    split: /\/+?/gi,
    idField: '_id',
    extractArgNames: extractArgNames,
    alias: function (name, val) {
        var self = this;
        if (typeof name !== 'string') {
            __.each(name, function (v, k) {
                this.alias(k, v);
            }, this)
            return this;
        }
        if (typeof val === 'string') {
            // pos, resolvers, parts
            this.settings.resolvers[name] = function alias$string$return(ctx, pos, param) {
//                var parts = val.split('$');
 //               return this.settings.resolvers[parts.shift()].apply(self, [ctx,pos].concat(parts, slice(arguments,2)));
                return onEachResolverMap.call(self, val, pos).apply(self, arguments);
            }
        } else {
            this.settings.resolvers[name] = function alias$obj$return(ctx, pos, param) {
                return val == null ? val : self.invoke(val, slice(arguments, 2), ctx);
            }
        }
        return this;
    },

    resolve: function invoke$resolve(fn, scope, ctx) {
        var p = promise();
        this.resolveCB.apply(this, [p.resolve.bind(p)].concat(slice(arguments)));
        return p;
    },
    /**
     * Returns the args that are resolved.   Does not execute function fn.
     *
     * @param cb
     * @param fn
     * @param scope
     * @param ctx
     */
    _resolveArgsCB: function inject$_resolveArgs(cb, fn, scope, ctx) {
        var api = this;
        var resolvers = extractResolvers(this, fn);
        whenCB(cb, resolvers.map(function inject$resolveCB$map(f) {
            return f.call(api, ctx);
        }));
    },
    _resolveCB: function inject$_resolveCB(cb, fn, scope, ctx) {
        this._resolveArgsCB(function (e, args) {
            if (e) {
                return cb(e);
            }
            try {
                cb(null, fn.apply(scope, args));
            } catch (e) {
                cb(e);
            }
        }, fn, scope, ctx);

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
        var resolvers = extractResolvers(this, fn), api = this;
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
     * @param resolvers
     * @param parts
     * @returns {Function}
     */
    resolveWrap: function invoke$resolveWrap(pos, resolver, parts) {
        var resolvers = this.settings.resolvers, api = this, search = this.settings.search;

        return function invoke$resolveWrap$return(ctx) {
            var args = [ctx, pos].concat(parts && parts.length ? parts : [null]), cresolver, ret;
            if (resolver in resolvers) {
                ret = resolvers[resolver].apply(api, args);
                if (ret !== void(0)) {
                    return ret;
                }
            }
            for (var i = search.length - 1; i > -1; i--) {
                var cresolver = search[i];
                if (cresolver === resolver) continue;
                var ret = resolvers[cresolver].apply(api, args);
                if (ret !== void(0)) {
                    return ret;
                }
            }
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
        if (str && __.isString(str)) {
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
        //   ctx = __.extend({}, ctx, {parent: obj});
        //not an object (maybe a number or bool?) nothing else we can do...
        if (!__.isObject(obj)) {
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
    /**
     * Returns a promise.  Use this to convert a graph with functions,
     * into an serializable object graph.
     *
     * @param obj
     * @param ctx
     * @returns {MPromise}
     */
    stringify: function (obj, ctx) {
        return w.next(this._stringify(ctx, null, null, obj));
    },
    /**
     * May return a Promise or a value.
     * @param obj
     * @param ctx
     * @returns {MPromise|*}
     * @private
     */
    _stringify: function (ctx, pObj, pKey, obj) {
        var ret;

        switch (typeof obj) {
            case "string":
            case "number":
                if (pObj) {
                    pObj[pKey] = obj;
                }
                return obj;
            case "function":
                return this.resolve(obj, null, ctx).then(this._stringify.bind(this, ctx, pObj, pKey));
            default:
            {
                if (isPromise(obj)) {
                    return obj.then(this._stringify.bind(this, ctx, pObj, pKey));
                }

                if (obj == null || obj instanceof Date) {
                    ret = obj;
                } else if (Array.isArray(obj)) {
                    ret = [];
                } else {
                    ret = {};
                }

                if (pObj != null) {
                    pObj[pKey] = ret;
                }
            }
        }


        return w.when(__.map(obj, function (v, k) {
            return this._stringify(ctx, ret, k, v);
        }, this)).then(function () {
            return ret;
        });
    }
})
;
function resolveF(ret, k) {
    return function resolveF$resolve(o) {
        ret[k] = o;
    };
}

return (module.exports = Injector);