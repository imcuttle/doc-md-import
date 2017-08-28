#!/usr/bin/env node
var program = require('commander');

var nps = require('path');
var fs = require('fs');

var DocImport = require('../index');
var u = require('../lib/utils');
var console = require('./lib/console');
var i18n = require('./lib/i18n');
var langMap = i18n.langMap


program
    .version(require('../package.json').version)

program
    .command('init')
    .option('-f, --force', langMap.initForce)
    .description(langMap.initDesc)
    .action(function (opt) {
        require('./action-factory/init')(opt)
    });

program
    .command('push [files...]')
    .option('-f, --force', langMap.pushForce)
    // .option('-t, --toc', langMap.pushToc)
    .description(langMap.pushDesc)
    .action(function (files, option) {
        require('./action-factory/push')(files, option)
    });

program
    .command('rm [files...]')
    // .option('-t, --toc', langMap.pushToc)
    .description(langMap.rmDesc)
    .action(function (files, option) {
        require('./action-factory/rm')(files, option)
    });

program
    .command('view')
    // .option('-t, --toc', langMap.pushToc)
    .description(langMap.viewDesc)
    .action(function () {
        require('./action-factory/view')()
    });

program
    .command('toc [title]')
    .option('-p, --push', langMap.tocPush)
    .description(langMap.tocDesc)
    .action(function (title, opt) {
        require('./action-factory/toc')(title, opt)
    });

program
    .command('perm [files...]')
    .option('-t, --type', langMap.permissionTypeDesc)
    .description(langMap.permissionDesc)
    .action(function (args, cmd) {
        var obj = require('minimist')(cmd.parent.rawArgs.slice(3));
        require('./action-factory/permission')(obj._, {type: obj.t || obj.type})
    });

program
    // .command('*')
    .action(function (cmd) {
        console.error('不存在的命令 `' + cmd + '`');
    });


// program.on('--help', function () {
// })

program.parse(process.argv)

