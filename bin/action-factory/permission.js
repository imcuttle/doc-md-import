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

var typeMap = {
    'pri': 'private',
    'ro': 'readonly',
    'pub': 'public',
    's-pub': 'semi-public'
}

module.exports = function (files, opt) {
    u.ensureDocFiles();
    var d = u.getPresetData();
    if (!d.conf.username || !d.conf.password) {
        console.error(i.existNullConf);
        process.exit(1);
    }

    if (!opt.type || !typeMap[opt.type]) {
        console.error(i.errorPermissionType);
        process.exit(1);
    }
    else {
        opt.type = typeMap[opt.type];
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
                        return perm(file, docImport, d.db, opt)
                    })
                );
            }
        })
        .catch(function (err) {
            console.error(err);
            throw err;
        })
}


function perm(file, docIn, db, opt) {
    var relative = u.toRelative(file);

    function addr(listId) {
        return docIn.address.replace(/\/+$/, '') + '/app/list/' + listId
    }

    function succ(listId) {
        console.succ(relative, i.succPermission, opt.type, ',', addr(listId));
        return true;
    }

    function fail(listId) {
        console.error(relative, i.failPermission, opt.type, ',', addr(listId));
        return false;
    }

    if (db[relative] && db[relative].listId) {
        return docIn
            .permission(db[relative].listId, opt.type, true)
            .then(function (passed) {
                passed && succ(db[relative].listId);
                !passed && fail(db[relative].listId);
            })
    } else {
        console.error(relative, i.failPermission, opt.type)
    }

}