var Nojector = require('./nojector');
module.exports = function (nojector, model, after) {
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

    return function (req, res, next) {
        var parts = req.url.split('?', 2).shift().split('/');
        if (parts[0] === '') parts.shift();
        //cb, obj, str, ctx, advice)
        nojector.invokeCB(function (e, o) {
            if (e) {
                return after(e, req, res, next);
            }
            whenCB(function (e, o) {
                return after(e, req, res, next, o[0]);
            }, o);
        }, model, parts, req, null, req, res, next);

    }
}