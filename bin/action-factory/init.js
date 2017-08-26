/**
 * @file   init
 * @author yucong02
 */

var console = require('../lib/console');
var u = require('../../lib/utils');
var i = require('../lib/i18n').langMap;

var fs = require('fs')



module.exports = function (opt) {
    var docPath = u.p(u.DIRNAME);

    function start() {
        u.ensureDocFiles();
        console.info(i.initDone);
    }

    u.ensureFolder(docPath);

    if (!opt.force) {
        if (u.checkDocPath()) {
            console.error(i.initExistPathError);
            process.exit(1);
        }
        else {
            start();
        }
    }
    else {
        start();
    }
}