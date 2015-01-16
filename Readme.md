#Nojector
A small realtively simple way to do parameter injection in node. Mostly for
web applications.  It looks at the parameter names, and tries to resolve them
with a resolver.  Really take a look at [mers](http://github.com/jspears/mers#develop) for
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
        var nojector = require('nojector').nojector;
        
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

##Invoke
Nojector also allows you to navigate object graphs, executing
functions along the way.  The basics are.

Its arguments are
* obj - The object to decend.
* path (optional)  - a slash delimited string or an array of strings.
* ctx (optional) - A context object
* advice (optional)  - a function that is used for controlling flow
    it will recieve
        * str -> the current array
        * obj -> the curent object
        * next -> a callback.
        * bv -> the next value to be evalated

*args... whatever else args to pass into the function.


```javascript

    var obj = {
        array:[1,2,3,4,5]
    }

    invoker.invoke(obj, 'array/0').then(function (v) {
            v.should.eql(1)
            done();
        })

```

It can go more deeply

```javascript
var obj = {

    stuff: [
        {a: 1},
        {b: 2},
        {
            c: {
                f: function () {
                    return 1;
                }
            }
        },
        {_id: 'abc', c: 1}
    ]
}

 invoker.invoke(obj, 'stuff/2/c/f').then(function (ret) {
        ret.should.eql(1);
  });

```

It will also inject arguments

```javascript

var obj = {
    func: function (str) {
        return {
            abc: str,
            def: function (s, s2) {
                var ret = {}
                ret[str] = s2;
                return ret;
            }
        }
    }
}

invoker.invoke(obj, 'func/def/a', {}, null, 'a', 'b').then(function (ret) {
            ret.should.eql('b');
            done();
 });

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


