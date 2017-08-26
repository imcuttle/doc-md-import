/**
 * @file   index
 * @author yucong02
 */

var langMap = require('./zh_CN');
langMap._i = function (str /* args */) {
    var args = [].slice.call(arguments, 1);
    str = str.replace(/\${([\d+])}/g, function (m, n) {
        return args[n - 1]
    });
    return str;
}

module.exports = {
    switch: function (lange) {
        Object.assign(langMap, require('./' + lange));
    },
    langMap: langMap
}