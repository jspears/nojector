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










