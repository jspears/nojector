var when = require('nojector/lib/when')
module.exports = {
    service: {
        asyncService: function (value) {
            var p = when.promise();

            setTimeout(p.resolve.bind(p, null, value), 100);


            return p;
        }
    }
}