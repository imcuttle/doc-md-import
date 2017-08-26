#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));

var opt = {
    help: argv.h || argv.help,
    version: argv.v || argv.version,
}

if (argv.debug || argv.d) {
    process.env.DEBUG = '1'
}

var cmd = argv._ && argv._[0];
var default_title = 'Document Import From `docin`'
var default_address = 'http://doc.eux.baidu.com/'

if (opt.help) {
    console.log('');
    console.log(' Usage: docin [options] [command]');
    console.log('  Options:');
    console.log('');
    console.log('     -v --version');
    console.log('     -h --help');
    console.log('     -d --debug');
    console.log('');
    console.log('  Command:');
    console.log('');
    console.log('     set-username [username]');
    console.log('     set-password');
    console.log('     set-address [doc web address]             default: ' + default_address);
    console.log('');
    console.log('     insert [listId] (parentId)');
    console.log('');
    console.log('     [title]                                   default: ' + default_title);
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('     cat markdown.md | docin');
    console.log('     echo "# Hello" | docin');
    console.log('     curl http://example.com/markdown.md | docin');
    console.log('');

    process.exit(0);
}

if (opt.version) {
    console.log(require('../package.json').version);
    process.exit(0);
}

var nps = require('path');
var fs = require('fs');

var DocImport = require('../index');
var u = require('../lib/utils');

var docinPath = u.docPath();
var docinConfPath = nps.join(docinPath, 'conf.json');

u.ensureFolder(docinPath);

var getConfig = u.getConfig.bind(u);

function setConfig(name, value) {
    var conf = {}, prevConf;
    conf[name] = value;

    if (!fs.existsSync(docinConfPath)) {
        fs.writeFileSync(docinConfPath, JSON.stringify(conf, null, 2));
        return;
    }
    try {
        prevConf = require(docinConfPath)
        prevConf[name] = value
    } catch (ex) {

    }
    fs.writeFileSync(docinConfPath, JSON.stringify(prevConf || conf, null, 2));
}

var validCmds = [
    {
        cmd: 'set-username',
        action: function (arg) {
            setConfig('username', arg);
        }
    },
    {
        cmd: 'set-password',
        action: function (arg) {
            var read = require('read')
            return new Promise(function (resolve) {
                read({ prompt: 'Password: ', silent: true }, function(er, password) {
                    setConfig('password', password);
                    resolve();
                })
            })
        }
    },
    {
        cmd: 'set-address',
        action: function (arg) {
            setConfig('address', arg);
        }
    },
    {
        cmd: 'insert',
        action: function (listId, parentId) {
            return insertDoc(listId, parentId)
        }
    }
];

function startFrame(callback) {
    var conf = getConfig(), markdown;
    conf.title = cmd || default_title;
    conf.address = conf.address || default_address;

    if (conf.username && conf.password) {
        console.log('输入markdown文本，之后 `Ctrl+D` + `Enter`.');

        u.concat(process.stdin, function (err, buf) {
            if (err) {
                console.error(err);
                process.exit(1);
            } else {
                markdown = buf.toString();
                if (!markdown.trim()) {
                    console.error('请输入markdown文本！');
                    process.exit(1);
                }

                return callback && callback(
                    new DocImport(conf.username, conf.password, conf.address),
                    markdown,
                    conf
                );
            }
        });

    } else {
        console.error('存在配置未被设置. 请 `docin -h` 查看帮助.');
        process.exit(1);
    }
}

function newDoc() {
    startFrame(function (docImport, markdown, conf) {
        docImport
            .new(markdown, conf.title)
            .then(function (listId) {
                console.log('发布成功，快访问查看吧！ %s', conf.address.replace(/\/+$/, '') + '/app/list/' + listId);
                process.exit(0);
            })
            .catch(function (err) {
                console.error(err);
                process.exit(1);
            });
    })
}

function insertDoc(listId, parentId) {
    return new Promise(function (resolve) {
        startFrame(
            function (docImport, markdown, conf) {
                return docImport
                    .insert(listId, markdown, parentId)
                    .then(function (obj) {
                        console.log(
                            '发布成功，快访问查看吧！ %s',
                            conf.address.replace(/\/+$/, '') + '/app/list/' + obj.listId + (obj.nodeId ? ('/' + obj.nodeId) : '')
                        );
                        resolve();
                    })
                    .catch(function (err) {
                        console.error(err);
                        process.exit(1);
                    });
            }
        );
    });
}

if (cmd) {
    var found = validCmds.find(function (x) {return x.cmd === cmd});
    var ret;
    if (found) {
        ret = found.action.apply(null, argv._.slice(1));
        if (ret && ret.then) {
            ret.then(function() {
                process.exit(0);
            })
        } else {
            process.exit(0);
        }
    } else {
        newDoc();
    }
} else {
    newDoc();
}

