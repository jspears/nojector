var when = require('nojector/lib/when')
module.exports = {
    service: {
        asyncService: function (query$name) {
            var p = when.promise();

            setTimeout(p.resolve.bind(p, null, query$name), 100);


            return p;
        }
    }
}