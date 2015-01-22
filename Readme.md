#Nojector
A small realtively simple way to do parameter injection in node. Mostly for
web applications.  It looks at the parameter names, and tries to resolve them
with a resolver.  Really take a look at (mers)[http://github.com/jspears/mers#develop] for
a better idea of why and how to use it.  The unit tests might give some ideas also.


##Resolvers

Built in resovlers:
* query - query string values.
* session - session values.
* body - body values.
* params - Parameters.
* args - additional arguments.
* require - requires a module.

Optional resolvers:
* bean - allows for external context lookups.
* alias - allows for parameters to be aliased to other parameters.

##Custom Resolvers
Resolvers can be added to a nojector instance by passing an object with resolvers property, and a function mapped to
the namespace of the resolver.

```javascript

var nojector = require('nojector');

nojector.nojector({
  resolvers:{
    custom:function(ctx, settings, pos, param){

    }

  }
});


```

The function can return a promise or a value and has the following arguments.

* ctx - The context object.
* settings - The nojection settings.
* pos - The position of the argument
* param - the parsed name of the param, ie if custom$name, than it would be name.





##Usage


```javascript

  var conf = nojector({
            //custom resolvers
            resolvers: {
                async: function (ctx, settings, pos, param) {
                    var obj = {};
                    //pos is the positional argument.
                    obj[param] = ctx.args[pos];
                    var p = promise();
                    setTimeout(function () {
                        //using mpromise, it has a funny resolve.
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

#Nested Objects
So nested graphs can be navigated with nojection, and injected.

```javascript

var obj = {
  something:function(query$name){
    var ret = {

    }

    ret[query$name] = {
        hello:'world'
    }
    return ret;
  }

},
ctx = {
    query:{
        name:'bob'
    }
}

nojector.inject(obj, 'obj/something/bob', null, ctx).then(function(ret){
 ret.should.have.property('hello', 'world');
});
```


##Document Based Resolution.
Occassionally it would be nice to have smart JSON documents. An object that is serializable yet contains functions for
logic and such.  Nojector has an answer.

```javascript

var doc = {
  a:12,
  b:function(query$name, bean$service){
    return {
      name:query$name,
      value:bean$service
    }

  }

}
nojector.stringify(doc, ctx).then(function(res){
//res -- will be a fully a object that can be JSON.stringified.

});


nojector.stringify(doc, ctx).then(JSON.stringify).then(function(res){
//res -- will be a fully stringified document.



});

```


##Optional Resolvers
To make this look like a true DI framework, there are a couple of optional resolvers.

* Alias - Allows for an unqualified method, resolve to a qualified method.

```javascript
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

```javascript
   var inject = nojector({
        resolvers: {
            bean: optional.bean({
                service: function (query$qa) {
                    var p = promise();

                    setTimeout(p.resolve.bind(p, null, query$qa), 100);

                    return p;
                }
            })
        }
    }), ctx = {
        query: {
            user: 'joe',
            qa: 'stuff'
        }
    };
    inject.resolve(function(bean$service){
    //should have 'joe' as the value.

    });

```

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
    resolve = nojector.web({
        resolvers: {
            args: optional.anyAlias({}),
            bean: optional.bean(beans)
        }
    }),
//Express
    app = require('express')();

app.use(require('body-parser').json());

//Simple inline nojection resolution. If you want complete control, but
//would like some parameter injection.
app.get('/', resolve(function (req, res, next, query$name) {

    console.log(query$name);
    next();
}));

```


### Middleware
The above will work but you  may want to use the middleware with other things.
```javascript
var model = require('./model');
//will resolve any url under /rest to the corresponding path in model.
app.use('/rest', middleware(nojector, model));

```

An optional third argument let's you capture the last return and do something with it
```javascript
var model = require('./model');
//will resolve any url under /rest to the corresponding path in model.
app.get('/rest', middleware(nojector, model, function(err,req,res,next, data){
  res.model = data;
  next();
}, //other handlers here);

```

