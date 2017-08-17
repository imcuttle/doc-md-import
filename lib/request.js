/**
 * @file   request
 * @author yucong02
 */
var http = require('http')
var https = require('https')
var nUrl = require('url')
var qs = require('querystring')

var debug = !!process.env.DEBUG

module.exports = {

    getProtocol: function (url) {
        return nUrl.parse(url).protocol
    },

    post: function (url, options, callback) {
        if (options.headers && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
        }

        return this.request.call(this, 'POST', url, options, callback)
    },

    get: function (url, options, callback) {
        var query;

        if (options.data) {
            query = nUrl.parse(url, true).query
            url = url.replace(/\?.*?$/, '')
            url = url + '?' + qs.stringify(Object.assign({}, query, options.data))
            delete options.data
        }

        return this.request.call(this, 'GET', url, options, callback)
    },

    /**
     * @param method
     * @param url
     * @param options {}
     *                  headers: {}
     *                  data: {}
     * @param callback
     */
    request: function (method, url, options, callback) {
        var reqPack = this.getProtocol(url).startsWith('https') ? https : http

        var urlParsed = nUrl.parse(url)
        var reqOptions = Object.assign({}, urlParsed, {
            method: method || 'GET',
            headers: options.headers
        })

        debug && console.log('send to: ', url)
        debug && console.log('send headers: ', options.headers)
        debug && console.log('send data: \n', JSON.stringify(options.data, null, 2))

        var req = reqPack.request(reqOptions)
        for (var key in options.data) {
            if (options.data[key] instanceof Object) {
                options.data[key] = JSON.stringify(options.data[key])
            } else {
                options.data[key] = options.data[key]
            }
        }

        req.end(options.data ? qs.stringify(options.data) : undefined)
        req.on('response', function (res) {
            callback && callback(null, res)
        })
        req.on('error', function (err) {
            callback && callback(err)
        })
    }
    
}