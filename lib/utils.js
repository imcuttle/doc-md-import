/**
 * @file   utils
 * @author yucong02
 */

var fs = require('fs')
var nps = require('path')
var md5 = require('md5')
var mdParse = require('./md-parse')

var DIRNAME = '.docpipe';

function s_md5(data) {
    // return data;
    var md5text = md5(data);
    return md5text.substr(0, 18);
}

module.exports = {
    p: nps.resolve,
    j: nps.join,

    DIRNAME: DIRNAME,

    checkDocPath: function () {
        return fs.existsSync(this.p(DIRNAME))
    },

    ensureDocFiles: function () {
        var p = this.p(DIRNAME),
            files = ['conf.json', 'db.json'],
            file,
            self = this;
        this.ensureFolder(p);

        files.forEach(function (f) {
            try {
                file = self.j(p, f);
                require(file);
            } catch (ex) {
                fs.writeFileSync(file, '{}');
            }
        });
    },

    docPath: function () {
        var home,
            docPath = nps.resolve(DIRNAME)

        if (!fs.existsSync(docPath)) {
            home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
            return nps.join(home, DIRNAME);
        } else {
            return docPath;
        }
    },

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
        number = Math.abs(number) - 1 || 0;
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
                .replace(/^([ \t]*)(\d+)\.([^]*)$/, function (m, a, b, c) {
                    return a + self.numberToLetter(b) + c
                })
                .replace(/^([ \t]*)([*+-])([^]*)$/, function (m, a, b, c) {
                    return a + '☻' + c;
                })
        }
        var indentSize = 0;
        if (token.type === 'block') {
            if (/^([ \t]*)(~{3,}|`{3,})[^]*?\n[^]*?\1\n?/.test(token.value)) {
                indentSize = RegExp.$1.length;

                token.value = token.value
                    .split('\n')
                    .map(function (line) {
                        var i = 0;
                        while (i++ < indentSize && /^[ \t]/.test(line)) {
                            line = line.substr(1)
                        }
                        return line;
                    })
                    .join('\n')
            }
        }

        return token;
    },

    generateItems: function (text, key) {
        var list = [], tmp, obj, self = this, idx = 1;
        key = key || md5(text);
        tmp = mdParse(text) || [];

        tmp.forEach(function (token, index) {
            if (token.type === 'empty') {
                return;
            }
            token.value = token.value.replace(/^\n*([^]*?)\n*$/, '$1');
            token = self.transformValue(token);
            obj = {
                content: token.value,
                // seq: idx,
                // id_seq: idx,
                // // id_seq: (idx++),
                // // id: '' + token.id //s_md5('' + token.id),
                id: s_md5(key + token.id),

                seq: '' + (idx),
                id_sep: idx,
                // id: '' + token.id,
                parent_item_id: token.parent ? s_md5(key + token.parent) : null
            }
            // if (token.parent) {
            //     // obj.parent_item_id = '' + token.parent //s_md5('' + token.parent)
            //     obj.parent_item_id = s_md5('' + token.parent)
            // }

            list.push(obj);
            idx++
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