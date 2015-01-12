#Nojector
A small realtively simple way to do parameter injection in node. Mostly for
web applications.  It looks at the parameter names, and tries to resolve them
with a resolver.  Really take a look at (mers)[http://github.com/jspears/mers#develop] for
a better idea of why and how to use it.

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
var nojector = require('nojector').nojector({
    //custom resolvers
    resolvers:{
        hello:function(ctx, settings, pos, param){
            return 'hello '+param;
        }
    }
});
//method you want to inject
var a = function(stuff$hello){
 return stuff$hello;
}
nojector.resolve(a).then(function(val){
    console.log(val);
}, function(){
    //error handler;
}

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