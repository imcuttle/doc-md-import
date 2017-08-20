/**
 * @file   md-parse
 * @author yucong02
 */
var splitParser = require('./parser-factory/md-to-tree')

module.exports = function mdParse(markdown) {
    return splitParser.process(markdown)
}