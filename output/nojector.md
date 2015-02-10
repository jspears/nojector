# Global





* * *

### extractResolvers(fn, args) 

Returns an array of functions, that correspond to the resolvers.

**Parameters**

**fn**: , Returns an array of functions, that correspond to the resolvers.

**args**: , Returns an array of functions, that correspond to the resolvers.

**Returns**: , [function(ctx)];


## Class: Injector


### Injector.alias(name, val) 

Aliases a string to a function resolver.

**Parameters**

**name**: `String`, Aliases a string to a function resolver.

**val**: `function | String`, Aliases a string to a function resolver.

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

**Returns**: `function`

### Injector.resolveBindCB(fn, scope) 

Same as resolveBind except uses a callback.

**Parameters**

**fn**: `function`, Same as resolveBind except uses a callback.

**scope**: `Object`, Same as resolveBind except uses a callback.

**Returns**: `function`

### Injector.invoke(obj, str, ctx, advice) 

**Parameters**

**obj**: `Object`

**str**: `PathString`

**ctx**: `Context`

**advice**: `Advice`

**Returns**: `Promise`

### Injector.stringify(obj, ctx) 

Returns a promise.  Use this to convert a graph with functions,
into an serializable object graph.

**Parameters**

**obj**: , Returns a promise.  Use this to convert a graph with functions,
into an serializable object graph.

**ctx**: , Returns a promise.  Use this to convert a graph with functions,
into an serializable object graph.

**Returns**: `MPromise`



* * *










