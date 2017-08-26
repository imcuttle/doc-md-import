// process.env.DEBUG = '1'

var actions = require('./lib/actions')
var utils = require('./lib/utils')
var fs = require('fs')

function newMultiDocument(mdTextList) {
    return this._login()
        .then(function (passed) {
            if (passed) {
                return Promise.all(
                    mdTextList.map(function (o) {
                        return newDocument(o.markdown, o.title);
                    })
                )
            }
        })
}

function login() {
    return actions
        .set('address', this.address)
        .login(this.username, this.password)
        .then(function (passed) {
            if (!passed) {
                return Promise.reject(new Error('登录失败'));
            } else {
                return passed
            }
        })
}

function newDocument(markdown, title) {
    var opt = {
        markdown: markdown,
        title: title
    };

    var id, maxId;

    return actions
        .getList()
        .then(function (list) {
            if (list) {
                id = list.id;
                maxId = list.maxId;
                return actions.rename(opt.title, id)
            } else {
                return Promise.reject(new Error('获取文章'));
            }
        })
        .then(function (passed) {
            if (passed) {
                var items = utils.generateItems(opt.markdown);
                return actions.patch(items, id, maxId);
            } else {
                return Promise.reject(new Error('修改文章名失败'));
            }
        })
        .then(function (passed) {
            if (passed) {
                return id;
            } else {
                return Promise.reject(new Error('添加文章内容失败'));
            }
        })
}

function insert(listId, markdown, parentId, noLogin, maxId) {
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

    return (noLogin ? Promise.resolve(true) : this._login())
        .then(function (passed) {
            if (passed) {
                return actions
                    // .setData('listId', listId)
                    // .setData('synced', Date.now())
                    .patch(patch, listId, maxId)
            }
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

function getList(listId, nologin) {
    var p = nologin ? Promise.resolve(true) : this._login();
    return p
        .then(function (passed) {
            if (passed) {
                return actions
                    .getList(listId)
            }
        })
}

function emptyList(listId, noLogin) {
    var p = noLogin ? Promise.resolve(true) : this._login();
    return p
        .then(function (passed) {
            if (passed) {
                return actions
                    .getList(listId)
            }
        })
        .then(function (list) {
            var patch = list.items
                .map(function (a, i) {
                    return {
                        removed: '1',
                        id: a.id,
                        seq: a.seq || i + 1,
                        id_seq: a.id_seq || i + 1
                    }
                });

            return actions.patch(patch, listId, list.maxId);
        })
}

function rmList(listId, noLogin) {
    var p = noLogin ? Promise.resolve(true) : this._login();
    return p
        .then(function (passed) {
            if (passed) {
                return actions
                    .rmList(listId)
            }
        })
}

function DocImport(username, password, address) {
    this.username = username;
    this.password = password;
    this.address  = address || DocImport.defaultAddress;

    if (!this.username
        || !this.password
        || !this.address) {
        throw new Error('存在未设置的属性');
    } else {
        // this.login()
    }
}

DocImport.defaultAddress = 'http://doc.eux.baidu.com/';


DocImport.prototype.insert = insert;
/**
 *
 * @type {Promise<string>} listId
 */
DocImport.prototype.new = function (markdown, title) {
    return this._login()
        .then(function (passed) {
            if (passed) {
                return newDocument(markdown, title);
            }
        })
};

DocImport.prototype.newWithoutLogin = newDocument
DocImport.prototype.newMultiDoc = newMultiDocument;
DocImport.prototype.rename = function (title, listId) {
    return actions.rename(title, listId)
};
DocImport.prototype.get = getList;
DocImport.prototype.empty = emptyList;
DocImport.prototype.rm = rmList;
DocImport.prototype._login = login;

module.exports = DocImport;