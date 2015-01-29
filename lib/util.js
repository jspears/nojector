var __ = require('lodash'), toUpperCase = Function.call.bind(String.prototype.toUpperCase),
    funcRe = /\s*function\s*.*\((.*)\).*/, paramRe = /(\/\*\$([^]*?)\$\*\/|\/\*[^]*?\*\/)?\s*([^,]*)?\s*,?\s*/g;
function camelToDash(str) {
    return str.replace(/^[a-z]/, toUpperCase).replace(/([A-Z])/g, function (match, p1, offset, string) {
        return (offset === 0 ? "" : "-") + p1;
    });

}
var api = {
    camelToDash: camelToDash,
    toUpperCase: toUpperCase,
    extractArgNames: function extractArgNames(f) {
        if (!f) return [];
        paramRe.lastIndex = funcRe.lastIndex = 0;
        //javascript wtf?
        var me = funcRe.exec(f.toString())[1], match, ret = [];
        while ((match = paramRe.exec(me)) != null && (match[1] || match[2] || match[3] || match[4])) {
            ret.push(__.compact(match.slice(2)).join('$'));
        }
        return ret;
    }
};


module.exports = api;