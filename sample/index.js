require('http').createServer(require('./app')).listen(3001, function () {
    console.log('Express server listening on port 3000');
});