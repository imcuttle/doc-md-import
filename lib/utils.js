/**
 * @file   utils
 * @author yucong02
 */

var fs = require('fs')
var nps = require('path')
var md5 = require('md5')
var mdParse = require('./md-parse')

var defaultFilter = function (file) {
    if (!fs.existsSync(file)) {
        return false;
    }
    if (fs.lstatSync(file).isDirectory()) {
        return !nps.basename(file).startsWith('.')
            && !/node_modules/.test(file);
    }
    else {
        return !nps.basename(file).startsWith('.')
            && /\.(md|markdown)$/.test(file)
    }
}

function s_md5(data) {
    // return data;
    var md5text = md5(data);
    return md5text.substr(0, 18);
}

var home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
var DIRNAME = '.docpipe';

function requireSafe(ps, clear) {
    var conf = {};
    try {
        if (clear) {
            delete require.cache[ps];
        }
        conf = require(ps);
        return conf;
    } catch (ex) {
        return conf;
    }
}


module.exports = {
    p: nps.resolve,
    j: nps.join,

    DIRNAME: DIRNAME,

    getConfig: function () {
        var dir = this.p(this.DIRNAME);
        return Object.assign({}, 
            requireSafe(this.j(dir, 'conf.json')),
            requireSafe(this.j(home, this.DIRNAME, 'conf.json'))
        )
    },

    getPresetData: function () {
       var dir = this.p(this.DIRNAME);
       return {
           conf: this.getConfig(),
           db: requireSafe(this.j(dir, 'db.json'))
       }
    },

    setDB: function (key, value, clear) {
        var dir = this.p(this.DIRNAME);
        var dbPath = this.j(dir, 'db.json');
        var prev = requireSafe(dbPath, true);
        if (clear) {
            prev = {};
        }
        prev[key] = Object.assign(prev[key] || {}, value);
        fs.writeFileSync(dbPath, JSON.stringify(prev, null, 2));
    },

    toRelative: function (file) {
        var cwd = process.cwd();
        return './' + this.p(file)
            .replace(new RegExp('^' + cwd.replace(/\/*$/, '') + '/'), '');
    },

    checkDocPath: function () {
        return fs.existsSync(this.p(DIRNAME))
    },

    flattenFiles: function (dir, filter) {
        filter = filter === undefined ? defaultFilter : filter;
        var p = this.p(dir),
            self = this,
            files,
            ret = [];
        if (!fs.lstatSync(p).isDirectory()) {
            ret.push(p);
            return ret;
        }

        files = fs.readdirSync(p);
        files.forEach(function (f) {
            var abs = self.j(p, f);
            if (!filter || filter(abs) !== false) {
                ret = ret.concat(self.flattenFiles(abs, filter));
            }
        });

        return ret;
    },

    ensureDocFiles: function () {
        var p = this.p(DIRNAME),
            files = [
                {name: 'conf.json', value: '{}'},
                {name: 'db.json', value: '{}'},
                {name: '.gitignore', value: 'conf.json\n'},
            ],
            file,
            self = this;
        this.ensureFolder(p);

        files.forEach(function (f) {
            try {
                file = self.j(p, f.name);
                require(file);
            } catch (ex) {
                fs.writeFileSync(file, f.value);
            }
        });
    },

    docPath: function () {
        var docPath = nps.resolve(DIRNAME)

        if (!fs.existsSync(docPath)) {
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