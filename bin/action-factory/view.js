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
var Table = require('cli-table');
var chalk = require('chalk');


module.exports = function (files, opt) {
    u.ensureDocFiles();
    var d = u.getPresetData();
    var keys = Object.keys(d.db);
    var table = new Table({
        head: ['#', 'File', 'Address', 'Updated Time'],
        // colWidths: [100, 200]
    });

    function addr(listId) {
        return (d.conf.address || DocImport.defaultAddress).replace(/\/+$/, '') + '/app/list/' + listId
    }

    keys.forEach(function (key, i) {
        var address = d.db[key].listId && addr(d.db[key].listId);
        if (address) {
            table.push([
                i + 1, chalk.green(key), address, d.db[key].updated || '-'
            ]);
        }
    })

    process.stdout.write(table.toString() + '\n');
}