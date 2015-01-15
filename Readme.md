#Nojector
A small realtively simple way to do parameter injection in node. Mostly for
web applications.  It looks at the parameter names, and tries to resolve them
with a resolver.  Really take a look at (mers)[http://github.com/jspears/mers#develop] for
a better idea of why and how to use it.  The unit tests might give some ideas also.


Built in resovlers:
* query - query string values.
* session - session values.
* body - body values.
* params - Parameters.
* args - additional arguments.
* require - requires a module.

##Usage
###Basic


```
        var conf = nojector({
            //custom resolvers
            resolvers: {
                async: function (ctx, settings, pos, param) {
                    var obj = {};
                    //pos is the positional argument.
                    obj[param] = ctx.args[pos];
                    var p = promise();
                    setTimeout(function () {
                        p.resolve(null,obj);
                    }, 100);
                    return p;
                }
            }
        });
        //method you want to inject
        var a = function (async$user) {
            return async$user;
        }
        conf.resolve(a, {}, null, 2).then(function (val) {
        //    val.should.have.property('user', 2);
            done();
        });
```

###Express context

```
var a = {

   stuff:function(session$user){
//        do something with session$user;

   }

}
app.get('/stuff', function(req,res,next){

nojector.resolve(a.stuff, req).then(function(response){
  //do something with response;
  next();
}, next);

```

##Navigation

```


```

##Optional Resolvers
To make this look like a true DI framework, there are a couple of optional resolvers.

* Alias - Allows for an unqualified method, resolve to a qualified method.
```
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
    inject.resolve(function(user){
    //should have 'joe' as the value.

    });

```

* Bean - This resolver is basically a statically scoped resolver.


