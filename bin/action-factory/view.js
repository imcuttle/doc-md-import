/**
 * @file   push
 * @author yucong02
 */

var console = require('../lib/console');
var u = require('../../lib/utils');
var DocImport = require('../../index');
var i = require('../lib/i18n').langMap;
var getTT = require('./push').getTitle_Text

var fs = require('fs');
var nps = require('path');
var Table = require('cli-table2');
var chalk = require('chalk');


module.exports = function (files, opt) {
    u.ensureDocFiles();
    var d = u.getPresetData();
    var keys = Object.keys(d.db);
    var table = new Table({
        head: ['#', 'File', 'Title', 'Address'/*, 'Updated Time'*/],
    });

    function addr(listId) {
        return (d.conf.address || DocImport.defaultAddress).replace(/\/+$/, '') + '/app/list/' + listId
    }

    keys.forEach(function (key, i) {
        var tt = getTT(fs.readFileSync(key, {encoding: 'utf-8'}), u.p(key));
        var address = d.db[key].listId && addr(d.db[key].listId);
        if (address) {
            table.push([
                i + 1, chalk.green(key), tt.title, address//, d.db[key].updated || '-'
            ]);
        }
    })

    process.stdout.write(table.toString() + '\n');
}