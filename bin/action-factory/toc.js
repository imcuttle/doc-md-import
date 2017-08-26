/**
 * @file   push
 * @author yucong02
 */

var console = require('../lib/console');
var u = require('../../lib/utils');
var DocImport = require('../../index');
var i = require('../lib/i18n').langMap;

var fs = require('fs');
var cp = require('child_process');
var nps = require('path');
var getTitle_Text = require('./push').getTitle_Text;



module.exports = function (title, opt) {
    u.ensureDocFiles();
    var d = u.getPresetData();
    var keys = Object.keys(d.db);
    var list = [];

    keys.forEach(function (file) {
        if (file === './doc-pipe-toc.md') return;
        var listId = d.db[file].listId;
        if (!listId) return;
        file = u.p(file);
        var tt = getTitle_Text(fs.readFileSync(file, {encoding: 'utf-8'}), file);
        var title = tt.title;

        list.push({
            file: file,
            title: title,
            listId: listId
        });
    });

    list = list.sort(function (x, y) {
        return fs.lstatSync(y.file).ctime - fs.lstatSync(x.file).ctime;
    });

    var tocText = generateToc(list, title);
    var ps = u.p('./doc-pipe-toc.md');
    fs.writeFileSync(ps, tocText);

    console.succ(i._i(i.succToc, ps, u.toRelative(ps)));

    if (opt.push) {
        cp.execSync(
            process.argv.slice(0, 2).concat('push', u.toRelative(ps), '-f').join(' '),
            {
                stdio: 'inherit'
            }
        );
    }
};

function generateToc(list, title) {
    var content = '';
    if (title) {
        content += '---\ntitle: ' + title + '\n---\n';
    }

    return content + list.map(function (x) {
        return '@{' + x.listId + '||' + x.title + '}@';
    }).join('\n');
}
