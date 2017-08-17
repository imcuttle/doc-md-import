/**
 * @file   request
 * @author yucong02
 */


module.exports = {
    // simplify
    generateItems: function (text, id_seq) {
        var lines = text.split('\n')
        var list = []
        var tokens = []
        var match = []
        id_seq = id_seq || 1
        var idx = 1

        lines.forEach(function (line) {
            if (tokens.length) {
                var backQuoteNum = tokens[0].tag.length

                if (match = line.match(new RegExp("^\\s*?[`]{" + backQuoteNum + "}[\s\n]*")) ) {
                    tokens.push({
                        content: line,
                        type: 'back quote end'
                    })

                    list.push({
                        seq: idx++,
                        content: tokens.map(function (tk) {
                            return tk.content
                        }).join('\n'),
                        id_seq: id_seq++
                    })

                    tokens = []
                } else {
                    tokens.push({
                        content: line,
                        type: 'back quote content'
                    })
                }
            }
            else if (match = line.match(/^\s*?(```[`]*?).*/)) {
                tokens.push({
                    content: line,
                    tag: RegExp.$1,
                    type: 'back quote start'
                })
            }
            else {
                line = line
                    .replace(/^(\s*[\d]+\.)\s/, '$1')
                    // .replace(/^(\s*)[+-]\s/, '$1')
                if (line.trim() !== '') {
                    list.push({
                        seq: idx++, content: line, id_seq: id_seq++
                    })
                }

            }
        })
        return list
    },

    concat: function (stream, callback) {
        stream.setEncoding('utf-8')
        var data = ''
        stream.on('data', function (chunk) {
            data += chunk
        })
        stream.on('end', function () {
            callback && callback(null, data)
        })
        stream.on('error', function (err) {
            callback && callback(err)
        })
    }
    
}