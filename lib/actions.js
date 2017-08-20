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
    var method, resData
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

    _setData: function (x) {
        data = x
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

    getList: function () {
        var url = conf.address + 'ajax/getList'
        var date = new Date()
        return _request('getList', 'get', url, {
            data: {
                list: -1,
                appVersion: date.getTime(),
                updated: date.getFullYear() + '-' + fill(date.getMonth() + 1, 2) + '-' + fill(date.getDate(), 2) + ' '
                + fill(date.getHours(), 2) + ':' + fill(date.getMinutes(), 2) + ':' + fill(date.getSeconds(), 2)
            }
        }, 'json')
            .then(function (json) {
                data.listId = json.data.list.id
                data.synced = json.data.synced
                return json.flag === 'ok'
            })
    },

    rename: function (title) {
        if (!data.listId) {
            debug && console.error('rename blocked: because listId not be preset')
            return Promise.resolve(false)
        }
        var url = conf.address + 'ajax/saveListTitle'
        return _request('rename', 'post', url, {
            data: {
                title: title,
                listId: data.listId
            }
        }, 'json')
            .then(function (json) {
                return json.flag === 'ok'
            })
    },

    patch: function (patch) {
        if (!data.listId) {
            debug && console.error('patch blocked: because listId not be preset')
            return Promise.resolve(false)
        }

        var date = new Date();
        var url = conf.address + 'ajax/sync';
        return _request('patch', 'post', url, {
            data: {
                req: {
                    patch: patch.map(function (x) {
                        if (!x.id) {
                            x.id = md5(JSON.stringify(x))
                        }
                        return x
                    }),
                    // userHash: '3l28stc',
                    listId: data.listId,
                    lastSynced: data.synced,
                    today: date.getFullYear() + fill(date.getMonth() + 1, 2) + fill(date.getDate(), 2),
                    now: date.getTime()
                }
            }
        }, 'json')
        .then(function (res) {
            if (res.flag === 'ok') {
                data.synced = res.synced

                return true
            }
        })
    },

    _request: _request

}