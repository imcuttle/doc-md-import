#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));

var opt = {
    help: argv.h || argv.help,
    version: argv.v || argv.version,
    verbose: argv.d || argv.debug
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
    console.log('     set-password [password]');
    console.log('     set-address [doc web address]             default: ' + default_address);
    console.log('     [title]                              default: ' + default_title);
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('     cat markdown.md | docin');
    console.log('     echo "# Hello" | docin');
    console.log('     curl http://example.com/markdown.md | docin');

    process.exit(0);
}

if (opt.version) {
    console.log(require('../package.json').version);
    process.exit(0);
}

var nps = require('path');
var fs = require('fs');
var u = require('../lib/utils');
var home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
var docinPath = nps.resolve(home, '.docin');
u.ensureFolder(docinPath);
var docinConfPath = nps.join(docinPath, 'conf.json');

function getConfig() {
    var conf = {}
    try {
        conf = JSON.parse(fs.readFileSync(docinConfPath).toString());
    } catch (ex) {
    } finally {
    }
    return conf;
}

function setConfig(name, value) {
    var conf = {}, prevConf;
    conf[name] = value;

    if (!fs.existsSync(docinConfPath)) {
        console.log('not');
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
            setConfig('password', arg);
        }
    },
    {
        cmd: 'set-address',
        action: function (arg) {
            setConfig('address', arg);
        }
    }
];

if (cmd) {
    var found = validCmds.find(function (x) {return x.cmd === cmd});
    if (found) {
        found.action.apply(null, argv._.slice(1));
        process.exit(0);
    } else {
        // console.error('没找到: ' + cmd + ' 命令. 请 `docin -h` 查看帮助.');
        // process.exit(1);
    }
}

var conf = getConfig();
conf.title = cmd || default_title;
conf.address = conf.address || 'http://doc.eux.baidu.com/';

if (conf.username && conf.password) {

    console.log('输入markdown文本，之后 `Ctrl+D`.');
    u.concat(process.stdin, function (err, buf) {
        if (err) {
            console.error(err);
            process.exit(1);
        } else {
            conf.markdown = buf.toString();
            if (!conf.markdown.trim()) {
                console.error('请输入markdown文本！');
                process.exit(1);
            }
            conf.verbose = opt.verbose;
            require('../index')(conf)
                .then(function (listId) {
                    console.log('发布成功，快访问查看吧！ %s', conf.address.replace(/\/+$/, '') + '/app/list/' + listId);
                    process.exit(0);
                })
                .catch(function (err) {
                    console.error(err.message);
                    process.exit(1);
                });
        }
    });

} else {
    console.error('存在配置未被设置. 请 `docin -h` 查看帮助.');
    process.exit(1);
}
