var fs = require('fs')
// var mdParse = require('../lib/md-parse')
//
// fs.writeFileSync('./result.json', JSON.stringify(
//         mdParse(
//             fs.readFileSync('./md.md').toString()
//         ),
//         null,
//         2
//     )
// )

process.env.DEBUG = '1';


var DocImport = require('../index');
var nps = require('path');

var docin = new DocImport('yucong02', fs.readFileSync(nps.join(__dirname, '../password'), {encoding: 'utf-8'}));

docin.empty('01c5e599526de4d6e1');