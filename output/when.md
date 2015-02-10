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










