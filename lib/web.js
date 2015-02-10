var whenCB = require('./when').whenCB;
/**
 * A little helper to use with
 * express apps, to do parameter injection.
 *
 * <code>
 * var nojector = require('nojector').nojector(), resolve = require('nojector/lib/web')(nojector),;
 *
 * ...
 *
 * //If next is passed.
 * app.get('/path', resolve(function(req,res,next, query$name){
 *    //query$name would be injected.
 *    next();
 *
 *
 * });
 *
 * //Without next.
 *
 * app.get('/path', resolve(function(query$name){
 *    //query$name would be injected, next called automatically.
 *
 *
 *
 * });
 *
 * //This will call next with 'hello' as an argument.  If
 * //null or undefined is resolved it will call next with
 * //no args.
 *
 * app.get('/asyncpath', resolve(function(query$name){
 *    //query$name would be injected, next called automatically.
 *    // when p is resolved.
 *    var p = promise();
 *
 *
 *    setTimeout(function(){
 *      p.resolve(null, 'hello');
 *    }, 100)
 *
 *   return p;
 *
 * });
 *  </code>
 *
 *
 * @param nojector
 * @returns {Function}
 */

module.exports = function web$nojector(nojector) {
    return function web$nojector$resolve(fn, scope) {
        return function (req, res, next) {
            var ctx = {
                req: req,
                res: res,
                args: [req, res, next]
            }
            nojector._resolveArgsCB(function (e, args) {
                if (e)
                    return next(e);

                if (~args.indexOf(next)) {
                    whenCB(function (e, o) {

                        if (e) return next(e);

                        if (o != null)
                            return next(o);

                        return next();
                    }, fn.apply(scope, args));
                } else {
                    fn.apply(scope, args)
                }

            }, fn, scope, ctx);
        }
    }
}
