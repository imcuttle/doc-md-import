// process.env.DEBUG = '1'

var actions = require('./lib/actions')
var utils = require('./lib/utils')
var fs = require('fs')

function newDocument(markdown, title) {
    var opt = {
        username: this.username,
        password: this.password,
        address: this.address,
        markdown: markdown,
        title: title
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

function insert(listId, markdown, parentId) {
    if (!listId || !markdown) {
        throw new Error('缺少正确的参数');
    }

    var patch = utils.generateItems(markdown);

    if (parentId != null) {
        patch = patch.map(function (pat) {
            if (!pat.parent_item_id) {
                pat.parent_item_id = parentId
            }
            return pat;
        })
    }

    return actions
        .login(this.username, this.password)
        .then(function (passed) {
            if (passed) {
                return true
            } else {
                return Promise.reject(new Error('登录失败'));
            }
        })
        .then(function () {
            return actions
                .setData('listId', listId)
                .setData('synced', Date.now())
                .patch(patch)
        })
        .then(function (passed) {
            if (passed) {
                return {
                    listId: listId,
                    nodeId: parentId
                }
            } else {
                return Promise.reject(new Error('添加文章内容失败'));
            }
        })
}

function DocImport(username, password, address) {
    this.username = username;
    this.password = password;
    this.address  = address;

    if (!this.username
        || !this.password
        || !this.address) {
        throw new Error('存在未设置的属性');
    }
}

DocImport.prototype.insert = insert;
/**
 *
 * @type {Promise<string>} listId
 */
DocImport.prototype.new = newDocument;

module.exports = DocImport;