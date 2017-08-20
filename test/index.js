var fs = require('fs')
var mdParse = require('../lib/md-parse')

fs.writeFileSync('./result.json', JSON.stringify(
        mdParse(
            fs.readFileSync('./md.md').toString()
        ),
        null,
        2
    )
)

