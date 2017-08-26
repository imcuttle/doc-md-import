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
                        return push(file, docImport, d.db, opt)
                    })
                );
            }
        })
        .catch(function (err) {
            console.error(err);
            throw err;
        })
}


function push(file, docIn, db, opt) {
    var text = fs.readFileSync(file, {encoding: 'utf-8'}),
        relative = u.toRelative(file),
        title = nps.basename(file).replace(/\.(md|markdown)$/, '');

    text = text.replace(/^\s*@title:(.*?)/i, function (m, t) {
        title = t.trim();
        return '';
    });

    function addr(listId) {
        return docIn.address.replace(/\/+$/, '') + '/app/list/' + listId
    }

    function succ(listId) {
        console.succ(relative, i.succPush, addr(listId));
        return true;
    }

    function newList() {
        return docIn
            .newWithoutLogin(text, title)
            .then(function (listId) {
                u.setDB(relative, {listId: listId});
                return docIn
                    .get(listId, true)
            })
            .then(function (list) {
                // list.id
                // list.items
                // list.title
                u.setDB(relative, {updated: list.updated});
                return succ(list.id);
            });
    }

    if (!db[relative] || !db[relative].listId) {
        return newList();
    }
    else {
        var listId = db[relative].listId;
        var updated = db[relative].updated;
        if (opt.force) {
            docIn
                .get(listId, true)
                .then(function (list) {
                    if (!list.updated) {
                        return newList();
                    }
                    else {
                        return docIn.empty(listId, true)
                            .then(function (passed) {
                                if (passed) {
                                    return docIn.insert(listId, text, null, true)
                                        .then(function (passed) {
                                            return passed && succ(listId);
                                        });
                                }
                            })
                    }
                })
        }
        else {
            docIn
                .get(listId, true)
                .then(function (list) {
                    if (!list.updated) {
                        return newList();
                    }
                    else {
                        if (updated !== list.updated) {
                            console.warn(
                                i._i(
                                    '${1}${2}!${3}:${4},${5}:${6}',
                                    relative, i.updateWarnSec1, i.updateWarnSec2, updated, i.updateWarnSec3, list.updated
                                ),
                                '\n\t' + addr(listId)
                            );
                            // u.setDB(relative, {updated: list.updated});
                        } else {
                            console.info(
                                relative,
                                i.noUpdate,
                                addr(listId)
                            );
                        }
                    }
                })
        }
    }
}