#!/usr/bin/env node
var program = require('commander');

var nps = require('path');
var fs = require('fs');

var DocImport = require('../index');
var u = require('../lib/utils');
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
    .option('-t, --toc', langMap.pushToc)
    .description(langMap.pushDesc)
    .action(function (files, option) {
        require('./action-factory/push')(files, option)
    });

// program.on('--help', function () {
// })

program.parse(process.argv)

