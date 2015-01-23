/**
 * See what an express app might look like
 *
 * @type {{service: {asyncService: Function}}}
 */
var beans = {
    service: {
        asyncService: function (query$name) {
            var p = when.promise();
            setTimeout(p.resolve.bind(p, null, query$name), 100);
            return p;
        }
    }
}
//application specific modules.
var model = require('../../sample/model'),
//Nojector includes
    nojector = require('../../'),

    optional = nojector.optional,
    inject = nojector.nojector({
        resolvers: {
            args: optional.anyAlias({}),
            bean: optional.bean(beans)
        }
    }),
    resolve = nojector.web(inject),
    middleware = nojector.middleware,
//Express
    app = require('express')();

app.use(require('body-parser').json());

app.get('/', resolve(function getFunction(req, res, next, query$name) {

    res.send({
        name: query$name
    });
}));

app.use('/rest', middleware(inject, model));
module.exports = app
