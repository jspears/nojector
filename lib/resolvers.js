var slice = slice = Function.call.bind(Array.prototype.slice), camelToDash = require('./util').camelToDash;
function basicResolver(name) {
    return function basicResolver$return(ctx,  pos, param) {
        //does the function being resolved allow it to be?
        //obj, str, ctx, cb)
        ctx = ctx.req || {};

        if (arguments.length > 2) {
            return (ctx[name] || {})[param];
        }
        return ctx[name];
    }
};


var api = {
    query: basicResolver('query'),
    session: basicResolver('session'),
    body: basicResolver('body'),
    params: basicResolver('params'),
    meta: basicResolver('meta'),
    method:function(ctx){
      if (ctx.req) return ctx.req.method;
    },
    headers: function (ctx,  pos, param) {
        var headers = ctx.req.headers;
        if (arguments.length > 2) {
            return (headers || {})[camelToDash(param)]
        }
        return headers;
    },
    args: function (ctx,  pos, param) {
        return ctx.args && ctx.args.length ? ctx.args[param] || ctx.args[pos] : void(0);
    },

    require: function (ctx,  pos, param) {
        console.log(__dirname + '')
        var path = slice(arguments, 3).map(function (v) {
            return v ? v : '.'
        });
        var p = [], last = '';

        for (var i = 0, l = path.length; i < l; i++) {
            var c = path[i];
            if (c === '.') {
                last += c;
                continue;
            } else if (last) {
                p.push(last);
                last = '';
            }
            p.push(c);
        }
        if (p[0] === '.'){
            p[0]= process.cwd();
        }
        return require(p.join('/'));
    },
    none: function () {
        return null;
    },
    any: function (ctx, pos, param, parts) {
        var ret = this._resolveWrap.apply(this, [this.settings.search].concat(slice(arguments,3)));

        return ret.apply(this, arguments);
    }
}
module.exports = api;