var superagent = require('superagent'), when = require('../lib/when');

describe('web', function () {


    var agent;
    beforeEach(function () {
        agent = superagent.agent();
    });

    before(function (done) {
        require('http').createServer(require('./support/app')).listen(3002, function () {
            console.log('Express server listening on port 3002');
            done();
        });
    })
    it('should make a request to /', function (done) {
        agent.get('http://localhost:3002/?name=joe')
            .set('Accept', 'application/json')
            .send().end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('name', 'joe');
                done();
            });

    });
    it('should make a request to /rest/doThis', function (done) {
        agent.get('http://localhost:3002/rest/doThis?name=joe')
            .set('Accept', 'application/json')
            .send().end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('hello', 'joe');
                done();
            });

    });
    it('should make a request to /rest/doThis/hello?name=joe', function (done) {
        agent.get('http://localhost:3002/rest/doThis/hello?name=joe')
            //.set('Accept', 'application/json')
            .send().end(function (err, res) {
                if (err) return done(err);
                res.text.should.eql('joe');
                done();
            });

    });
});
