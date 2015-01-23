var Nojector = require('./nojector');
module.exports = function nojector$middleware(nojector, model, after) {
    var whenCB = require('./when').whenCB;
    if (!(nojector instanceof Nojector)) {
        nojector = Nojector(nojector);
    }
    if (!after) after = function (err, req, res, next, data) {
        if (err) {
            return next(err);
        } else {
            res.send(data);
        }
    }

    return function nojector$middleware$handler(req, res, next) {

        var parts = req.url.split('?', 2).shift().split('/');

        if (parts[0] === '') parts.shift();

        nojector.invokeCB(function (e, o) {
            if (e) {
                return after(e, req, res, next);
            }
            whenCB(function (e, o) {
                return after(e, req, res, next, o[0]);
            }, o);
        }, model, parts, {
            req:req,
            res:res,
            args:[req,res,next]
        }, null);

    }
}