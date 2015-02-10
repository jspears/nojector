# Global





* * *

### chainCB(cb, subordinates) 

Takes a value and a list of functions, values or promises, and
attempts to resolve them in order....

**Parameters**

**cb**: , Takes a value and a list of functions, values or promises, and
attempts to resolve them in order....

**subordinates**: , Takes a value and a list of functions, values or promises, and
attempts to resolve them in order....



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

**Returns**: `*`



* * *










