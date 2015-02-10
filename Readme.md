[![Build Status](https://travis-ci.org/jspears/nojector.svg)](https://travis-ci.org/jspears/nojector)

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
* headers - http headers.

##Custom Resolvers
Resolvers can be added to a nojector instance by passing an object with resolvers property, and a function mapped to
the namespace of the resolver.

```javascript

var nojector = require('nojector');

nojector.nojector({
  resolvers:{
    custom:function(ctx, pos, param, params){
        //return a value or a promise.   If in the search chain than
        //return undefined if a value is not resolved.

    }
  }
});


```

The function can return a promise or a value and has the following arguments.

* ctx - The context object.
* pos - The position of the argument
* param - the parsed name of the param, ie if custom$name, than it would be name.
* params - the rest of the parsed params.




##Usage


```javascript

  var conf = nojector({
            //custom resolvers
            resolvers: {
                async: function (ctx,  pos, param) {
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


##Alias Resolvers
To make this look like a true DI framework, you can "alias" basically
anything to anything

Alias can take an object (the keys will be the resolver, the value will be the value)
or a string and a function,
or a string and a string;

It returns the injector.

```javascript
   var inject = nojector().alias({
                user: 'query$user',
                bob: function (query$qa) {
                    var p = promise();

                    setTimeout(p.resolve.bind(p, null, query$qa), 100);

                    return p;
                }

            }).alias('bean', {...}).alias('aliasedUser', 'user');
        }
    }), ctx = {
        query: {
            user: 'joe',
            qa: 'stuff'
        }
    };
    inject.resolve(function(aliasedUser, bob){
    //should have 'joe' as the value.
    // bob should have stuff.
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
    nojector = require('nojector').alias('bean', beans),
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

# Global





* * *

## Class: Injector


### Injector.alias(name, val) 

Aliases a string to a function resolver.

**Parameters**

**name**: `String`, Aliases a string to a function resolver.

**val**: `Resolver | String`, Aliases a string to a function resolver.

**Returns**: `Injector`

**Example**:
```js
nojector.alias('me', 'query$me');
nojector.alias('m', function(me){
  return me + m;
});
```

### Injector.resolve(fn, scope, ctx) 

Resolves a function in a scope.   Looking at the query parameters.

**Parameters**

**fn**: `function`, Resolves a function in a scope.   Looking at the query parameters.

**scope**: `Object`, Resolves a function in a scope.   Looking at the query parameters.

**ctx**: `Context`, Resolves a function in a scope.   Looking at the query parameters.

**Returns**: `Promise`

**Example**:
```js
nojector.resolve(function(query$name){
  return 'Hello '+ query$name
}, null {req:{query:{name:'Joe'}}}).then(function(val){
   //Hello Joe
  console.log(val);
});
```

### Injector.resolveCB(cb, fn, scope, ctx) 

Same as resolve, but uses a callback.

**Parameters**

**cb**: `Callback`, Same as resolve, but uses a callback.

**fn**: `function`, Same as resolve, but uses a callback.

**scope**: `Object`, Same as resolve, but uses a callback.

**ctx**: `Context`, Same as resolve, but uses a callback.


### Injector.resolveBind(fn, scope) 

Same as resolve except returns a bound function.

**Parameters**

**fn**: `function`, Same as resolve except returns a bound function.

**scope**: `Object`, Same as resolve except returns a bound function.

**Returns**: `CtxFunction`

### Injector.resolveBindCB(fn, scope) 

Same as resolveBind except uses a callback.

**Parameters**

**fn**: `function`, Same as resolveBind except uses a callback.

**scope**: `Object`, Same as resolveBind except uses a callback.

**Returns**: `CtxFunction`

### Injector.invoke(obj, str, ctx, advice) 

Invokes a method, with its parameters in injected.

**Parameters**

**obj**: `Object`, Invokes a method, with its parameters in injected.

**str**: `PathString`, Invokes a method, with its parameters in injected.

**ctx**: `Context`, Invokes a method, with its parameters in injected.

**advice**: `Advice`, Invokes a method, with its parameters in injected.

**Returns**: `Promise`

**Example**:
```js
var obj = {
  a:{
    junk:function(query$name){
      return 'Junk '+query$name;
    }
  }
}

nojector.invoke(obj, 'a/junk', {req:{query:{name:'stuff'}}}).then(function(val){
  //val is Junk stuff
}, function(e){
 //error
})
```

### Injector.invokeCB(cb, obj, str, ctx, advice) 

Same as invoke, but uses a callback instead of promise.

**Parameters**

**cb**: `Callback`, Same as invoke, but uses a callback instead of promise.

**obj**: `Object`, Same as invoke, but uses a callback instead of promise.

**str**: `PathString`, Same as invoke, but uses a callback instead of promise.

**ctx**: `Context`, Same as invoke, but uses a callback instead of promise.

**advice**: `Advice`, Same as invoke, but uses a callback instead of promise.

**Returns**: , undefined

### Injector.stringify(obj, ctx) 

Returns a promise.  Use this to convert a graph with functions,
into an serializable object graph.

**Parameters**

**obj**: `Object`, to stringify

**ctx**: `Context`, to stringify said object in.

**Returns**: `Promise.&lt;Object&gt;`

**Example**:
```js
invoker.stringify({
               a: {
                   stuff: function (query$abc) {
                       return query$abc;
                   },
                   prom: function () {
                       var p = promise();
                       setTimeout(p.resolve.bind(p, null, {
                           a: function (query$abc) {
                               var a = {};
                               a[query$abc] = 'd';
                               return a;
                           },
                           b: 'b'

                       }), 100);
                       return p;
                   }
               }
           }, {
               req: {
                   query: {
                       abc: 'def'
                   }
               }
           }).then(function (res) {
               //   res = JSON.parse(res);
               res.should.have.property('a');

               //res.a.should.have.property('stuff', 'def');

               res.a.should.have.property('prom');
           });
```



* * *










* * *










# Global





* * *

### extractArgNames() 

Extracts argument names from a function. Will not
work with minifiers.

**Parameters**

**extractArgNames**: `function`, Extracts argument names from a function. Will not
work with minifiers.

**Returns**: `Array.&lt;String&gt;`, named arguments;



* * *










# Global





* * *

### exports(nojector) 

A little helper to use with
express apps, to do parameter injection.

<code>
var nojector = require('nojector').nojector(), resolve = require('nojector/lib/web')(nojector),;

...

//If next is passed.
app.get('/path', resolve(function(req,res,next, query$name){
   //query$name would be injected.
   next();


});

//Without next.

app.get('/path', resolve(function(query$name){
   //query$name would be injected, next called automatically.



});

//This will call next with 'hello' as an argument.  If
//null or undefined is resolved it will call next with
//no args.

app.get('/asyncpath', resolve(function(query$name){
   //query$name would be injected, next called automatically.
   // when p is resolved.
   var p = promise();


   setTimeout(function(){
     p.resolve(null, 'hello');
   }, 100)

  return p;

});
 </code>

**Parameters**

**nojector**: , A little helper to use with
express apps, to do parameter injection.

<code>
var nojector = require('nojector').nojector(), resolve = require('nojector/lib/web')(nojector),;

...

//If next is passed.
app.get('/path', resolve(function(req,res,next, query$name){
   //query$name would be injected.
   next();


});

//Without next.

app.get('/path', resolve(function(query$name){
   //query$name would be injected, next called automatically.



});

//This will call next with 'hello' as an argument.  If
//null or undefined is resolved it will call next with
//no args.

app.get('/asyncpath', resolve(function(query$name){
   //query$name would be injected, next called automatically.
   // when p is resolved.
   var p = promise();


   setTimeout(function(){
     p.resolve(null, 'hello');
   }, 100)

  return p;

});
 </code>

**Returns**: `function`



* * *










# Global





* * *

### whenCB(cb, subordinates) 

Given an array of values, promises it creates an array
of values, when the promise is either complete, or the
value is resolved.   If no promises need resolving it will
not create one.

**Parameters**

**cb**: `Callback`, Given an array of values, promises it creates an array
of values, when the promise is either complete, or the
value is resolved.   If no promises need resolving it will
not create one.

**subordinates**: `Array.&lt;Promise&gt;`, Given an array of values, promises it creates an array
of values, when the promise is either complete, or the
value is resolved.   If no promises need resolving it will
not create one.

**Returns**: , undefined


### when(subordinates) 

Given some promises or values it will resolve the promise
when they all resolve

**Parameters**

**subordinates**: `...Array.&lt;Promise&gt; | *`, Given some promises or values it will resolve the promise
when they all resolve

**Returns**: `Promise`


### chainCB(cb, subordinates) 

Takes a value and a list of functions, values or promises, and
attempts to resolve them in order....

**Parameters**

**cb**: `Callback`, Takes a value and a list of functions, values or promises, and
attempts to resolve them in order....

**subordinates**: `...Array.&lt;Promise&gt; | *`, Takes a value and a list of functions, values or promises, and
attempts to resolve them in order....



### chain(cb, subordinates) 

Takes a value and a list of functions, values or promises, and
attempts to resolve them in order, resolving the returned promise.

**Parameters**

**cb**: `Callback`, Takes a value and a list of functions, values or promises, and
attempts to resolve them in order, resolving the returned promise.

**subordinates**: `...Array.&lt;Promise&gt; | *`, Takes a value and a list of functions, values or promises, and
attempts to resolve them in order, resolving the returned promise.

**Returns**: `Promise`


### next(p) 

Returns a new promise, with a promise.
it continues down the promises until a promise
is resolved with a non promise.

If it is called in context of a Promise than
the first argument can be a function, in which
case when that function returns, it will wait
until it returns a non promise.

**Parameters**

**p**: , Returns a new promise, with a promise.
it continues down the promises until a promise
is resolved with a non promise.

If it is called in context of a Promise than
the first argument can be a function, in which
case when that function returns, it will wait
until it returns a non promise.

**Returns**: `Promise`



* * *










