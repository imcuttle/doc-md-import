/**
 * @file   md-parse
 * @author yucong02
 */
var TokenParser = require('./TokenParser')

var globalParser = new TokenParser([
    {
        // case: ##  head
        rgx: /^\s*(#+)\s[^]*\n(?=[\s*#])/,
        process: function (match, context) {

        }
    },
    {
        rgx: /^\s*(#+)\s.*/,
        process: function (match, context) {
            return {
                type: 'head',
                content: match[0]
            }
        }
    },
    {

    }
])


module.exports = function mdParse(markdown) {

}