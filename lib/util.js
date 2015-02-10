var __ = require('lodash'), toUpperCase = Function.call.bind(String.prototype.toUpperCase),
    funcRe = /\s*function\s*.*\((.*)\).*/, paramRe = /(\/\*\$([^]*?)\$\*\/|\/\*[^]*?\*\/)?\s*([^,]*)?\s*,?\s*/g;
function camelToDash(str) {
    return str.replace(/^[a-z]/, toUpperCase).replace(/([A-Z])/g, function (match, p1, offset, string) {
        return (offset === 0 ? "" : "-") + p1;
    });

}
var api = {
    /**
     * Takes a camel Case string returns a hyphen string
     * @example
     * camelToDash('helloWorld')
     * //result
     * 'Hello-World'
     * @param String str
     * @returns String
     */
    camelToDash: camelToDash,
    /**
     * Converts tring to upperCase
     * @param {String}
     * @return String
     */
    toUpperCase: toUpperCase,
    /**
     * Extracts argument names from a function. Will not
     * work with minifiers.
     *
     * @param {Function}
     * @returns {Array<String>} named arguments;
     */
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