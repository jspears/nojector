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










