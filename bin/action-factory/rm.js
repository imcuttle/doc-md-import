/**
 * @file   push
 * @author yucong02
 */

var console = require('../lib/console');
var u = require('../../lib/utils');
var DocImport = require('../../index');
var i = require('../lib/i18n').langMap;

var fs = require('fs');
var nps = require('path');



module.exports = function (files, opt) {
    u.ensureDocFiles();
    var d = u.getPresetData();
    if (!d.conf.username || !d.conf.password) {
        console.error(i.existNullConf);
        process.exit(1);
    }

    var docImport = new DocImport(d.conf.username, d.conf.password, d.conf.address);

    docImport._login()
        .then(function (passed) {
            if (passed) {
                files = files.length ? files : ['.'];
                var container = [];
                files.forEach(function (fileOrDir) {
                    container = container.concat(u.flattenFiles(fileOrDir))
                });

                return Promise.all(
                    container.map(function (file) {
                        return rm(file, docImport, d.db, opt)
                    })
                );
            }
        })
        .catch(function (err) {
            console.error(err);
            throw err;
        })
}


function rm(file, docIn, db, opt) {
    var relative = u.toRelative(file);

    function succ(listId) {
        console.succ(relative, i.succRm);
        return true;
    }


    if (db[relative] && db[relative].listId) {
        return docIn
            .rm(db[relative].listId, true)
            .then(function (passed) {
                u.setDB(relative, null);
                passed && succ(db[relative].listId);
            })
    }

}