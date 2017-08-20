// process.env.DEBUG = '1'

var actions = require('./lib/actions')
var utils = require('./lib/utils')
var fs = require('fs')


module.exports = function (opt) {
    if (!opt.username
        || !opt.password
        || !opt.markdown
        || !opt.title
        || !opt.address) {
        return Promise.reject(new Error('存在未设置的配置'));
    }

    if (opt.verbose) {
        process.env.DEBUG = '1'
    } else {
        delete process.env.DEBUG
    }

    return actions
        .set('address', opt.address)
        .login(opt.username, opt.password)
        .then(function (passed) {
            if (passed) {
                return actions.getList()
            } else {
                return Promise.reject(new Error('登录失败'));
            }
        })
        .then(function (passed) {
            if (passed) {
                return actions.rename(opt.title)
            } else {
                return Promise.reject(new Error('获取文章'));
            }
        })
        .then(function (passed) {
            if (passed) {
                var items = utils.generateItems(opt.markdown);
                return actions.patch(items)
            } else {
                return Promise.reject(new Error('修改文章名失败'));
            }
        })
        .then(function (passed) {
            if (passed) {
                return actions.getListId()
            } else {
                return Promise.reject(new Error('添加文章内容失败'));
            }
        })
}