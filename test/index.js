var fs = require('fs')
// var mdParse = require('../lib/md-parse')

// fs.writeFileSync('./result.json', JSON.stringify(
//         mdParse(
//             fs.readFileSync('../Changelog.md').toString()
//         ),
//         null,
//         2
//     )
// )

process.env.DEBUG = '1';


var DocImport = require('../index');
var nps = require('path');

var docin = new DocImport('yucong02', fs.readFileSync(nps.join(__dirname, '../password'), {encoding: 'utf-8'}));
var listId = '7bcf759a19a3f66a84';

docin.empty(listId)
    .then(function (p) {
        return p && docin.insert(listId, fs.readFileSync('../Changelog.md').toString(), null, true, p.maxId)
    });