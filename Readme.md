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

##Using with ExpressJS.
Sometimes it might be useful to expose a model with resolution.
You can doing something like, you can look in the samples dir for more info.

```javascript
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

//Simple inline nojection resolution....  If you want complete control, but
//would like some parameter injection.

app.get('/', resolve(function getFunction(req, res, next, query$name) {

    console.log(query$name);
    next();
}));

app.use('/rest', middleware(nojector, model));

...
```
### Middleware
The above will work but you  may want to use the middleware with other things.

```
    var middleware = nojector.middleware;
   var itemRouter = express.Router({mergeParams: true});

   // you can nest routers by attaching them as middleware:
   userRouter.use('/items', itemRouter);

   userRouter.route('/')
       .get(middleware(nojector, model, function(err, req, res, next, data){
            req.model = data;
            next();
       }),


       function(req,res,next){

           //do something else here like render templates.
       });
       }

```

