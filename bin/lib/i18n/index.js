/**
 * @file   index
 * @author yucong02
 */

var langMap = require('./zh_CN');

module.exports = {
    switch: function (lange) {
        Object.assign(langMap, require('./' + lange));
    },
    langMap: langMap
}