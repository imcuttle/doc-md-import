// process.env.DEBUG = '1'

var actions = require('./lib/actions')
var utils = require('./lib/utils')
var fs = require('fs')

var text = fs.readFileSync('/Users/yucong02/moka-blog/source/_articles/guide-of-gojs.md').toString()
var pwd = fs.readFileSync('./password').toString()

actions
    .login('yucong02', pwd)
    /*.then(function (passed) {
        if (passed) {
            return actions.newDocument('GoJS Detail')
        }
    })*/

    .then(function (passed) {
        if (passed) {
            return actions.getList()
        }
    })
    .then(function (passed) {
        if (passed) {
            return actions.rename('GoJS Detail')
        }
    })
    .then(function (passed) {
        if (passed) {
            return actions.addItems(utils.generateItems(text))
        }
    })


/*actions
    .login('yucong02', pwd)
    .then(function (p) {
        if (p) {
            actions._setData({
                listId: '217945995420ed3411',
                synced: Date.now()
            })
            var id_seq = 1696648
            actions.addItems(utils.generateItems(text))
        }
    })*/
