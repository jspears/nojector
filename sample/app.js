//application specific modules.
var beans = require('./beans'),
    model = require('./model'),
//Nojector includes
    nojector = require('nojector'),

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

    console.log(query$name);
    next();
}));

app.use('/rest', middleware(inject, model));

module.exports = app;