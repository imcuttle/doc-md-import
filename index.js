process.env.DEBUG = '1'

var actions = require('./lib/actions')
var utils = require('./lib/utils')
var fs = require('fs')

var text = fs.readFileSync('./test/md.md').toString();
var pwd = fs.readFileSync('./password').toString();

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
            return actions.rename('Doc Import Test')
        }
    })
    .then(function (passed) {
        if (passed) {
            var items = utils.generateItems(text);
            actions.patch(items)
            // return Promise.all([
            //     actions.patch(items.slice(0, 20)),
            //     actions.patch(items.slice(20))
            // ])
        }
    })
    .then(function () {
        // if (obj.passed) {
        //     var items = obj.items;
        //     return actions.patch(items.slice(0, 20));
        // }
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
