"use strict";

var __ = require('lodash'),
    slice = Function.call.bind(Array.prototype.slice),
    extractArgNames = require('./util').extractArgNames,
    w = require('./when'), whenCB = w.whenCB, promise = w.promise, isPromise = w.isPromise
    ;

function isExec(o) {
    if (o != null && typeof o !== 'string' && typeof o !== 'number')
        return typeof o.exec === 'function';
    return false;
}

var defSettings = {
    search: ['args', 'session', 'query', 'params', 'body'],

    resolvers: require('./resolvers')
};

function onEachResolverMap(v, pos) {
    var parts = v.split('$');
    return this._resolveWrap(pos, parts.shift(), parts);
}
/**
 * Returns an array of functions, that correspond to the resolvers.
 * @private
 * @param fn
 * @param args
 * @returns [function(ctx)];
 */
function extractResolvers(scope, fn) {
    return extractArgNames(fn).map(onEachResolverMap, scope);
}
/**
 * @typedef {Object} Context
 */
/**
 * A dot notation path
 * @typedef {(String|Array<String>)} PathString
 */
/**
 * Resolvers can return a value, or a promise if they are async.
 * @typedef {Function} Resolver
 *
 */
/**
 * This callback is displayed as part of the Requester class.
 * @callback Callback
 * @param {Error} [error] - Null if not in error.
 * @param {*} [value] - undefined if in error, otherwise a value, or possible undefined.
 */

/**
 * @type Nojector
 * @param {Object} [options]
 * @returns {Injector}
 * @constructor
 */
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
    /**
     * Aliases a string to a function resolver.
     * @example
     * nojector.alias('me', 'query$me');
     * nojector.alias('m', function(me){
     *   return me + m;
     * });
     *
     * @param {String}name
     * @param {(Resolver|String)} val
     * @returns {Injector}
     */
    alias: function (name, val) {
        if (typeof name !== 'string') {
            __.each(name, function (v, k) {
                this.alias(k, v);
            }, this)
            return this;
        }
        if (typeof val === 'string') {
            this.settings.resolvers[name] = function alias$string$return(ctx, pos, param) {
                return onEachResolverMap.call(this, val, pos).apply(this, arguments);
            }
        } else {
            this.settings.resolvers[name] = function alias$obj$return(ctx, pos, param) {
                return val == null ? val : this.invoke(val, slice(arguments, 2), ctx);
            }
        }
        return this;
    },
    /**
     * Resolves a function in a scope.   Looking at the query parameters.
     * @example
     *
     * nojector.resolve(function(query$name){
     *   return 'Hello '+ query$name
     * }, null {req:{query:{name:'Joe'}}}).then(function(val){
    *    //Hello Joe
     *   console.log(val);
     * });
     *
     *
     *
     * @param {Function} fn
     * @param {Object} [scope]
     * @param {Context} ctx
     * @returns {Promise}
     */
    resolve: function invoke$resolve(fn, scope, ctx) {
        var p = promise();
        this.resolveCB.apply(this, [p.resolve.bind(p)].concat(slice(arguments)));
        return p;
    },
    /**
     * Returns the args that are resolved.   Does not execute function fn.
     * @private
     *
     * @param {Callback} cb
     * @param {Function} fn
     * @param {Object} scope
     * @param {Context} ctx
     */
    _resolveArgsCB: function inject$_resolveArgs(cb, fn, scope, ctx) {
        var api = this;
        var resolvers = extractResolvers(this, fn);
        whenCB(cb, resolvers.map(function inject$resolveCB$map(f) {
            return f.call(api, ctx);
        }));
    },
    _resolveCB: function inject$_resolveCB(cb, scope, ctx, fn) {
        /* var resolve = this._resolveCB.bind(this, cb, scope, ctx);
         if (isPromise(fn)){
         return fn.then(resolve, cb);
         }else if (typeof fn !== 'function'){
         return cb(null, fn);
         }*/
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
    /**
     * Same as resolve, but uses a callback.
     * @param {Callback} cb
     * @param {Function} fn
     * @param {Object} [scope]
     * @param {Context} ctx
     */
    resolveCB: function inject$resolveCB(cb, fn, scope, ctx) {
        ctx = ctx || {};
        var args = slice(arguments, 4);
        if (args.length)
            ctx.args = args;
        this._resolveCB(cb, scope, ctx, fn);

    },
    /**
     * Same as resolve except returns a bound function.
     *
     * @param {Function} fn
     * @param {Object} scope
     * @returns {Function}
     */
    resolveBind: function invoke$resolveBind(fn, scope) {
        var resolveBindCB$func = this.resolveBindCB(fn, scope);
        /**
         * A function that resolve when invoked.
         * @param {Context} ctx
         * @param {...*} args
         * @returns {Promise}
         */
        return function invoke$resolveBind$return(ctx) {
            var p = promise();
            var args = [p.resolve.bind(p), ctx].concat(slice(arguments, 1));
            resolveBindCB$func.apply(null, args);
            return p;
        }
    },
    /**
     * Same as resolveBind except uses a callback.
     *
     * @param {Function} fn
     * @param {Object} scope
     * @returns {Function}
     */
    resolveBindCB: function invoke$resolveBind(fn, scope) {
        var resolvers = extractResolvers(this, fn), api = this;
        /**
         * A bound resolver using callback
         *
         * @param {Callback} cb
         * @param {Context} ctx
         *
         */
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
    }
    ,
    /**
     * It will resolve from right to left.  The first resolver to not return undefined, the value is used.   This
     * can be null.  This will be performance critical.
     *
     * @private
     * @param {number} pos - position
     * @param {Resolver} resolvers
     * @param {Array<String>} parts
     * @returns {Function}
     */
    _resolveWrap: function invoke$resolveWrap(pos, resolver, parts) {
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
                ret = resolvers[cresolver].apply(api, args);
                if (ret !== void(0)) {
                    return ret;
                }
            }
        }
    },
    /**
     * @typedef {Function} Advice
     * @param {String} str current path
     * @param {Context} ctx
     * @param {Object} obj scope
     * @param {Function} next
     * @param {*} bv
     * @returns {*}
     */

    advice: function inject$advice(str, ctx, obj, next, bv) {
        return next(bv);
    },

    /**
     * Invokes a method, with its parameters in injected.
     * @example
     * var obj = {
     *   a:{
     *     junk:function(query$name){
     *       return 'Junk '+query$name;
     *     }
     *   }
     * }
     *
     * nojector.invoke(obj, 'a/junk', {req:{query:{name:'stuff'}}}).then(function(val){
     *   //val is Junk stuff
     * }, function(e){
     *  //error
     * })
     *
     *
     * @param {Object} obj
     * @param {PathString} str
     * @param {Context} ctx
     * @param {Advice} advice
     * @returns {Promise}
     */
    invoke: function invoke(obj, str, ctx, advice) {
        var p = promise();
        this.invokeCB.apply(this, [p.resolve.bind(p)].concat(slice(arguments)));
        return p;

    },
    /**
     * Same as invoke, but uses a callback instead of promise.
     * @param {Callback} cb
     * @param {Object} obj
     * @param {PathString} str
     * @param {Context} ctx
     * @param {Advice} advice
     * @returns undefined
     */
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

    }
    ,
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
        if (isExec(obj)) {
            return obj.exec(bound);

        }
        if (typeof obj === 'function') {
            return this._resolveCB(bound, null, ctx, obj);
        }
        //create a new context, so parent does not disappear in the async bits.
        var current = str.shift();
        //   ctx = __.extend({}, ctx, {parent: obj});
        //not an object (maybe a number or bool?) nothing else we can do...
        if (!__.isObject(obj)) {
            return str.length ? cb(new Error("not an object and could not descend " + str)) : cb(null, obj);
        }
        if (typeof current === 'function') {
            return this._resolveCB(bound, obj, ctx, current)
        }

        //arrays an objects can be returned when there's nothing else to do.

        if (typeof obj[current] === 'function') {
            return this._resolveCB(bound, obj, ctx, obj[current]);
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

    }
    ,
    /**
     * Returns a promise.  Use this to convert a graph with functions,
     * into an serializable object graph.
     *
     * @param {Object} obj
     * @param {Context} ctx
     * @returns {Promise<Object>}
     */
    stringify: function (obj, ctx) {
        return w.next(this._stringify(ctx, null, null, obj));
    }
    ,
    /**
     * May return a Promise or a value.
     * @private
     * @param obj
     * @param pObj Object
     * @param pKey string
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

module.exports = Injector;