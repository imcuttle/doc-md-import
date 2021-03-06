/**
 * @file   action
 * @author yucong02
 */
var nps = require('path')
var ag = require('./request')
var utils = require('./utils')
var md5 = require('md5')


function log() {
    !!process.env.DEBUG && console.log.apply(console, arguments)
}
function error() {
    !!process.env.DEBUG && console.error.apply(console, arguments)
}

var conf = {
    address: 'http://doc.eux.baidu.com/'
}

function regenerateHeaders() {
    var o = require('url').parse(conf.address)
    var _headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Host': o.host,
        'Origin': conf.address
    }
    return _headers;
}

// preset headers
var headers = regenerateHeaders()

var data = {}

function fill(src, size, placeholder) {
    placeholder = placeholder || '0'
    src = src.toString()
    var len = src.length
    if (len === size) {
        return src
    }
    if (len > size) {
        return src.substr(0, size)
    }
    for (var i = 0; i < size - len; i++) {
        src = placeholder + src
    }
    return src
}


function _request(keyName, methodName, url, options, dataType) {
    var method, resData;
    method = methodName.toLowerCase() === 'get' ? ag.get : ag.post

    options.headers = Object.assign({},
        headers,
        options.headers
    )

    return new Promise(function (resolve, reject) {
        method.call(ag, url, options, function (err, res) {
            if (err) {
                error(keyName, 'response error: ', err)
                reject(err)
            }
            else {
                log(keyName, 'response success: ', res.statusCode, res.statusMessage)
                if (dataType === 'json') {
                    utils.concat(res, function (err, data) {
                        if (err) reject(err)
                        else {
                            try {
                                resData = JSON.parse(data)
                            } catch (ex) {
                                console.error(ex);
                                resolve({});
                                return;
                            }
                            log(keyName, 'response json: ', resData)
                            resolve(resData)
                        }
                    })
                }
                else {
                    resolve(res)
                }
            }
        })
    })
}

function parseCookie(cookie) {
    var spans = cookie.split(';')
    if (spans) {
        return spans[0]
    }
    return cookie
}

module.exports = {

    set: function (key, val) {
        if (key === 'address') {
            val = val.replace(/\/+$/, '/');
            conf[key] = val;
            regenerateHeaders();
        } else {
            conf[key] = val;
        }
        return this;
    },

    get: function (key) {
        return conf[key] || data[key]
    },

    setData: function (key, val) {
        data[key] = val;
        return this;
    },

    getListId: function () {
        return data.listId
    },

    login: function (name, password) {
        var url = conf.address + 'login'
        return _request('login', 'post', url, {data: {user: name, pass: password}})
            .then(function (res) {
                if (res.headers['set-cookie']) {
                    headers['Cookie'] = res.headers['set-cookie'].map(parseCookie).join('; ')
                    return true
                }
            })
    },

    newDocument: function (title) {
        var url = conf.address + 'app/new'
        return _request('newDocument', 'get', url, {data: {title: title}})
            .then(function (res) {
                return true
            })
    },

    getList: function (list) {
        var url = conf.address + 'ajax/getList'
        var date = new Date()
        return _request('getList', 'get', url, {
            data: {
                list: list || -1,
                appVersion: date.getTime(),
                updated: date.getFullYear() + '-' + fill(date.getMonth() + 1, 2) + '-' + fill(date.getDate(), 2) + ' '
                + fill(date.getHours(), 2) + ':' + fill(date.getMinutes(), 2) + ':' + fill(date.getSeconds(), 2)
            }
        }, 'json')
            .then(function (json) {
                data.listId = json.data.list.id;
                data.synced = json.data.synced;
                json.data.list.maxId = json.data.maxId;
                return (json.flag === 'ok', json.data.list)
            })
    },

    rename: function (title, listId) {
        // if (!data.listId) {
        //     error('rename blocked: because listId not be preset')
        //     return Promise.resolve(false)
        // }
        var url = conf.address + 'ajax/saveListTitle';

        return _request('rename', 'post', url, {
                    data: {
                        title: title,
                        listId: listId || data.listId
                    }
                },
                'json'
            )
            .then(function (json) {
                return json.flag === 'ok'
            })
    },

    rmList: function (listId) {
        var url = conf.address + 'ajax/remove_list';
        return _request('rmList', 'post', url, {
            data: {
                listId: listId || data.listId
            }
        }, 'json')
        .then(function(res) {return res.flag === 'ok'})
    },

    perm: function (listId, type) {
        var url = conf.address + 'ajax/set_permission';
        return _request('perm', 'post', url, {
            data: {
                listId: listId || data.listId,
                shareType: type
            }
        }, 'json')
        .then(function(res) {return res.flag === 'ok'})
    },

    patch: function (patch, listId, maxId) {
        // if (!data.listId) {
        //     error('patch blocked: because listId not be preset')
        //     return Promise.resolve(false)
        // }
        maxId = maxId || 1;

        var date = new Date();
        var url = conf.address + 'ajax/sync';
        return _request('patch', 'post', url, {
            data: {
                req: {
                    patch: patch.map(function (x, i) {
                        if (!x.id) {
                            x.id = md5(JSON.stringify(x))
                        }
                        x.id_seq = ++maxId;
                        // x.seq = +x.seq;
                        if (patch.length === 1) {
                            delete x.seq;
                        }
                        // delete x.id_seq;
                        return x
                    }),
                    dicts: [],
                    newDicts: [],
                    listId: listId || data.listId,
                    lastSynced: data.synced || date.getTime(),
                    today: date.getFullYear() + fill(date.getMonth() + 1, 2) + fill(date.getDate(), 2),
                    now: date.getTime()
                }
            }
        }, 'json')
        .then(function (res) {
            if (res.flag === 'ok') {
                data.synced = res.data.synced
                res.data.maxId = maxId;
                return res.data
            }
        })
    },

    _request: _request

}