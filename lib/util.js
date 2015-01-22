var toUpperCase = Function.call.bind(String.prototype.toUpperCase);
function camelToDash(str) {
    return str.replace(/^[a-z]/, toUpperCase).replace(/([A-Z])/g, function (match, p1, offset, string) {
        return (offset === 0 ? "" : "-") + p1;
    });

}
var api = {camelToDash: camelToDash, toUpperCase:toUpperCase};


module.exports = api;