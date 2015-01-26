//application specific modules.
var beans = require('./beans'),
    model = require('./model'),
//Nojector includes
    nojector = require('nojector'),

    inject = nojector.nojector().alias('bean', beans),
    resolve = nojector.web(inject),
    middleware = nojector.middleware,
//Express
    app = require('express')();

app.use(require('body-parser').json());

app.get('/', resolve(function getFunction(req, res, next, query$name) {

    res.send({
        name:query$name
    });
}));

app.use('/rest', middleware(inject, model));

module.exports = app;