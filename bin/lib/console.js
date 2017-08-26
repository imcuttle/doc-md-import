/**
 * @file   console
 * @author yucong02
 */

var chalk = require('chalk')
var i = require('./i18n').langMap



module.exports = {

    log: this.info,

    info: function () {
        console.log.apply(console,
            [chalk.cyan('[' + i.infoPrefix + ']: ')].concat([].slice.call(arguments, 0))
        )
    },

    debug: function () {
        console.log.apply(console,
            [chalk.bgWhite('[' + i.debugPrefix + ']: ')].concat([].slice.call(arguments, 0))
        )
    },

    error: function () {
        console.error.apply(console,
            [chalk.red('[' + i.errorPrefix + ']: ')].concat([].slice.call(arguments, 0))
        )
    },

    warn: function () {
        console.warn.apply(console,
            [chalk.yellow('[' + i.warnPrefix + ']: ')].concat([].slice.call(arguments, 0))
        )
    }
};
