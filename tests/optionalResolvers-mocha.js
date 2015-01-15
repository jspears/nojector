var nojector = require('../lib/nojector'),
    should = require('should'),
    promise = require('../lib/when').promise,
    optional = require('../lib/optionalResolvers');

describe('optionalResolvers', function () {
    var inject = nojector({
        resolvers: {
            args: optional.anyAlias({
                user: 'query$user',
                bob: function (query$qa) {
                    var p = promise();

                    setTimeout(p.resolve.bind(p, null, query$qa), 100);

                    return p;
                },
                aliased: 'user'
            }),
            bean: optional.bean({
                stuff: function (bob) {
                    return bob;
                }
            })
        }
    }), ctx = {
        query: {
            user: 'joe',
            qa: 'stuff'
        }
    };
    it.only('should resolve bean$stuff', function () {
        return inject.resolve(function(bean$stuff){
           bean$stuff.should.be.eq('stuff')
        });
    })
    it('should resolve an aliased arg', function () {
        return inject.resolve(function (user) {
            return user;
        }, {}, ctx).then(function (user) {
            user.should.be.eql('joe');
        })
    });

    it('should resolve an aliased arg and others', function () {
        return inject.resolve(function (a, user) {
            user.should.be.eql('joe');
            a.should.be.eql(1);
        }, {}, ctx, 1)
    });

    it('should resolve an aliased arg and async value', function () {
        return inject.resolve(function (a, bob) {
            bob.should.be.eql('stuff');
            a.should.be.eql(1);
        }, {}, ctx, 1)
    });
    it('should handle aliased aliases', function () {
        return inject.resolve(function (aliased) {
            return aliased
        }, {}, ctx).then(function (arg) {
            arg.should.be.eql('joe');
        })
    })
})