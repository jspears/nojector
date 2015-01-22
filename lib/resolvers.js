var slice = slice = Function.call.bind(Array.prototype.slice), camelToDash = require('./util').camelToDash;
function basicResolver(name) {
    return function basicResolver$return(ctx, settings, pos, param) {
        //does the function being resolved allow it to be?
        //obj, str, ctx, cb)

        if (('resolve' in settings) && !settings.resolve)
            return;
        if (param != null) {
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
    headers: function (ctx, settings, pos, param) {
        if (param != null) {
            return (ctx.headers || {})[camelToDash(param)]
        }
        return ctx.headers;
    },
    args: function (ctx, settings, pos, param) {
        return ctx.args && ctx.args.length ? ctx.args[param] || ctx.args[pos] : void(0);
    },

    require: function (ctx, settings, pos, param) {
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
        return require(p.join('/'));
    },
    none: function () {
        return null;
    },
    any: function (ctx, settings, parts) {
        var ret = this.resolveWrap.apply(this, [settings, this.settings.search].concat(parts));

        return ret.apply(this, arguments);
    }
}
module.exports = api;