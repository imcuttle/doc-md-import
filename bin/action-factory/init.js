/**
 * @file   init
 * @author yucong02
 */

var console = require('../lib/console');
var u = require('../../lib/utils');
var i = require('../lib/i18n').langMap;

var fs = require('fs');
var fse = require('fs-extra');



module.exports = function (opt) {
    function start() {
        u.ensureDocFiles();
        console.succ(i.initDone);
    }

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
        fse.emptyDirSync(u.p(u.DIRNAME));
        start();
    }
}