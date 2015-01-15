var api = {

    wrapDone: function wrapDone(fn, done) {
        return function () {
            try {
                fn.apply(this, arguments);
            } catch (e) {
                return done(e);
            }
            done();
        };
    }
}
module.exports = api;