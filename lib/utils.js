/**
 * @file   utils
 * @author yucong02
 */

var fs = require('fs')
var nps = require('path')
var mdParse = require('./md-parse')

module.exports = {

    ensureFolder: function (dirname) {
        if (!fs.existsSync(dirname)) {
            this.ensureFolder(nps.dirname(dirname));
            fs.mkdirSync(dirname);
        }
        else if (fs.statSync(dirname).isFile()) {
            throw new Error(dirname + ' 是一个文件, 无法建立文件夹');
        }
    },

    numberToLetter: function (number) {
        number = Math.abs(number) || 0;
        var list = [
            '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨',
            '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱',
            '⑲', '⑳', '⓪'
        ]
        return list[number % list.length]

        // return String.fromCharCode(97 + (number - 1));
    },

    transformValue: function (token) {
        var self = this;
        if (token.type === 'list') {
            token.value = token.value
                .replace(/^([ \t]*)(\d+)(\.[^]*)$/, function (m, a, b, c) {
                    return a + self.numberToLetter(b) + c
                })
                .replace(/^([ \t]*)([*+-])([^]*)$/, function (m, a, b, c) {
                    return a + '☻' + c;
                })
        }
        return token;
    },

    generateItems: function (text) {
        var list = [], tmp, self = this, idx = 1;
        tmp = mdParse(text) || [];

        tmp.forEach(function (token, index) {
            if (token.type === 'empty') {
                return;
            }
            token.value = token.value.replace(/^\n*([^]*?)\n*$/, '$1');
            token = self.transformValue(token);
            list.push({
                content: token.value,
                seq: '' + (idx++),
                // id_sep: idx++,
                id: '' + token.id,
                parent_item_id: token.parent ? ('' + token.parent) : null
            })
        });
        return list;
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