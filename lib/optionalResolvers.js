var resolvers = require('./resolvers'), slice = Function.call.bind(Array.prototype.slice);
var api = {
    /**
     * This allows for aliases to be created.
     * give pass an object with a key on the left
     * to be substituted and a function or a path
     * on the left and it will resolve.
     *
     * EX.
     * <code>
     * nojector.inject({
     *  args:anyAlias({user:'session$user'})
     * }).resolve(function(user){
     *  //will resolve user to session.user;
     * },...);
     * </code>
     *
     * @param alias
     * @returns {Function}
     */
    anyAlias: function (alias) {
        alias = alias || {};
        return function anyAlias$return(ctx, settings, pos, param) {
            if (param in alias) {
                var val = alias[param];
                if (val === param) {
                    return;
                }
                if (typeof val === 'string') {
                    if (val in alias) {
                        return anyAlias$return.call(this, ctx, settings, pos, val);
                    }
                    //settings, pos, resolvers, parts
                    var parts = val.split('$'), key = parts.shift();
                    if (!(key in settings.resolvers)) {
                        return;
                    }
                    return settings.resolvers[key].call(this, ctx, settings, pos, parts.shift());

                } else {
                    //(obj, str, ctx, advice)
                    return this.invoke(alias[param], slice(arguments, 4), ctx, null)
                }
            }
            return resolvers.args.apply(this, arguments);
        }
    },
    /**
     * A simple resolver that looks at a bean
     * context and attempts to return the correct value.
     * Use in conjunction with alias for a powerful injection
     * system.
     *
     * @param {Object} beans
     */
    bean: function (beans) {
        return function bean$return(ctx, settings, pos, param) {
            return this.invoke.apply(this, [beans, slice(arguments, 3), ctx, null].concat(ctx.args));
        }
    }
}

module.exports = api;