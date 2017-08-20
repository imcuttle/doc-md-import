/**
 * @file   md-parse
 * @author yucong02
 */
var md2Tree = require('./parser-factory/md-to-tree')

module.exports = function mdParse(markdown) {
    return md2Tree.process(markdown)
}