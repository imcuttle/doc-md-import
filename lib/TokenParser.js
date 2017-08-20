/**
 * @start-def: ~MatchResult
 *  members: {}
 *      matcher: #@~Matcher
 *      match: RegExpMatchResult
 *      value: string
 *      rest: string
 */
var MatchResult = function (matcher, match, rest) {
    this.matcher = matcher;
    this.match = match;
    this.value = match[0];
    this.rest = rest;
};

/**
 * @start-def: .prototype: {}
 */
MatchResult.prototype = {

    /**
     *
     * @def: appendTo: tokens, type, value, extra => rest
     *  tokens: [#@~Token]  // 是要把该 match result 快速添加到的目标 token 列表
     *  rest: string        // 匹配后剩余内容
     */
    appendTo: function (tokens, type, value, extra) {
        tokens.push(this.token(type, value, extra));

        return this.rest;
    },

    /**
     *
     * @def: .token: type, value, extra => tokenReturn
     *  type: string                // 必选参数
     *  value: string | undefind    // 如为空, 使用 this.value
     *
     *  tokenReturn: {} & {otherKey: otherValue}
     *
     *      // 从 extra 中提取并 extend 到 tokenReturn 里
     *      otherKey: string
     *      otherValue: string
     *  extra:
     */
    token: function (type, value, extra) {
        if (typeof value === 'undefined') {
            value = this.value;
        }

        var token = {type: type, value: value};

        for (var key in extra) {
            token[key] = extra[key];
        }

        return token;
    }
};

/**
 * @start-def: ~Matcher
 */
var Matcher = function (key, rgx) {
    this.key = key;
    this.rgx = rgx;
};

/**
 * @start-def: .prototype
 */
Matcher.prototype = {
    /**
     *
     * @def: exec: content => match
     *  content: string     // 要匹配的对象内容, 只限字符串
     *
     *  // null 代表没有匹配到结果
     *  match: RegExpMatchResult | null
     */
    exec: function (content) {
        var match = this.rgx.exec(content);

        return match;
    }
};


/**
 * @start-def: TokenParserV2Inner: class
 *  members: {}
 *      methods: #@.creator.methods
 *      rgx: #@.creator.rgx
 *      find: #@.creator.find
 */
var TokenParserV2Inner = function () {
    var self = this;

    this.methods = {};
    this.rgx = {};
    this.find = {};
};

/**
 * @start-def: .prototype: {}
 */
TokenParserV2Inner.prototype = {

    /**
     *
     * @def: .process: content, methodName => {tokens, rest, status}
     *  content: any        // 欲处理的内容
     *  methodName: string  // 与 @#.create.methods.otherName 相应, 如果没有设置, 默认为 'start', 即触发 start 的处理逻辑
     *  tokens: [#@~Token]
     *  rest: any     // 处理后的剩余内容
     *  status: 'fail' | 'ok'   // 处理的结果状态
     */
    process: function (content, methodName) {
        methodName = methodName || 'start';

        return this.methods[methodName](content);
    },

    inject: function (rgx) {
        var self = this;

        for (var key in rgx) {
            if (this.rgx[key]) {
                self.log('warn', '发现重复的 pattern rgx 键值定义, 请确保不要定义有歧义的键值!');
            }
            this.rgx[key] = new Matcher(key, rgx[key]);
        }
    },

    /**
     * // 打印出 debug 信息
     * // 用 #@TokenParserV2.debug 控制
     * @def: .log: level, ...args => undefind
     *  level: 'warn' | 'info' | 'debug'
     *  args: [any]     // 要控制台输出的信息
     */
    log: function (level) {
        if (TokenParserV2.debug === 'on' || this.debug === 'on' || level !== 'debug') {
            var args = Array.prototype.slice.call(arguments, 1);

            // 排除掉 level 位置的信息
            for (var i = 0; i < args.length; i++) {
                if (args[i].__type__ === 'to-json') {
                    args[i] = JSON.stringify(args[i].value);
                }
            }
            args.unshift(level.toUpperCase() + ' @ [token parser] : ');

            console.log.apply(console, args);
        }
    },

    toJSON: function (value) {
        if (TokenParserV2.debug === 'on' || this.debug === 'on') {
            return {
                __type__: 'to-json',
                value: value
            }
        }
        return false;
    }
};


/**
 * @start-def: TokenParserV2: {}
 */
var TokenParserV2 = {
    /**
     * ///
     * create 执行完毕之后, token parser 会返回一个 #@~TokenParserV2Inner 的实例对象
     * ///
     * @def: .create: creator => undefined
     *  creator: (methods, rgx, utils) => undefined
     *
     *      // methods 在 creator 中初始时是一个空的对象
     *      // 需要在 creator 中逐步去挂入处理流程
     *      methods: {start} & {otherName: method}
     *          start: content => {tokens, rest, status}  // start 是主入口, 必须要定义了
     *              content: any     // 输出的欲处理内容, **注意** 不限于 string
     *              tokens: [token]  // 返回一组 (可能具有嵌套形式) 的 token
     *                  token: {type} & {otherKey: any} #@~Token
     *                      type: string        // token 的类别
     *
     *                      // 但常用的是 : 'value' | 'name' | 'key' | 'text' 等
     *                      // 尽可能用常用的名称
     *                      otherKey: string    // token 的任何其他的信息的属性名称, 自行定义
     *              rest: string                // 返回未匹配完的部分
     *              status: 'ok' | 'fail'
     *
     *          otherName: string       // 其他的方法
     *
     *          // 但一般也是推荐 content => {tokens, rest, status} 的形式
     *          method: function        // 函数的接口可以自己定制
     *
     *      rgx: {name: matcher}
     *          name: string            // 与 inject 的内容对应, 未来会被用于 find.pack 方法中, 实现 find.$name 方法
     *          matcher: #@~Matcher
     *
     *      utils: {}
     *          inject: patterns => undefined
     *              patterns: {name: RegExp}
     *                  name: string        // name of the unit match pattern
     *
     *          // 方便的 wrap 方法, rest 默认为 '', status 默认为 'ok'
     *          result: tokens, rest, status => {tokens, rest, status}
     *
     *          tokenTypes: tokens, type | typeMap => undefined
     *              tokens: [#@~Token]
     *              type: string                // 把所有 tokens type 改为 type
     *              typeMap: {source: target}   // 把所有 匹配到的 source type 改为 target
     *
     *          concatTokens: parentTokens, result => rest
     *              result: {tokens, rest, status}
     *                  tokens: [#@~Tokens]     // 会被插入到 parentTokens 里
     *                  rest: string            // result 里返回的剩余内容
     *
     *          token: #@~MatcherResult.prototype.token
     *
     *          pack: groupName, [matcher] => undefined
     *              groupName: string       // 用于定义一个未来可用的 group match 的方法
     *              matcher: #@~Matcher
     *
     *          find: {pack} & {name: findNext}
     *              name: string                // 跟 #@.pack.groupName 对应
     *              findNext: {}
     *                  // undefined 代表没有匹配中
     *                  type: #@~Matcher | undefined       // 用 matcher 来自动注入匹配中的类型
     *                  match: RegExpMatchResult | undefined
     *                  value: string | undefined          // 匹配命中的部分
     *              rest: string | undefined           // 匹配之后剩余的部分
     */
    create: function (creator) {
        var innerParser = new TokenParserV2Inner();

        creator(
            innerParser.methods,
            innerParser.rgx,
            {
                inject: innerParser.inject.bind(innerParser),
                result: function (tokens, rest, status) {
                    return {
                        tokens: tokens,
                        rest: rest || '',
                        status: status || 'ok'
                    }
                },

                tokenTypes: function(tokens, typeMap) {
                    if (typeof typeMap === 'string') {
                        tokens.forEach(function (token) {
                            token.type = typeMap
                        });
                    }
                    else {
                        tokens.forEach(function (token) {
                            if (typeMap[token.type]) {
                                token.type = typeMap[token.type];
                            }
                        });
                    }
                },

                concatTokens: function (tokens, result) {
                    result.tokens.forEach(function (token) {
                        tokens.push(token);
                    });

                    return result.rest;
                },

                pack: function (groupName, matchers) {
                    matchers.forEach(function (matcher, index) {
                        if (!matcher) {
                            innerParser.log('warn', groupName + ' : 中第 ' + (index + 1) + ' 个 matcher 没有初始化成功, 请注意!');
                        }
                    });

                    innerParser.find[groupName] = function (content) {
                        var result = {};

                        innerParser.log('debug', groupName + ' : 开始匹配', innerParser.toJSON(content.substr(0, 50)));
                        matchers.some(function (matcher) {
                            var match = matcher.exec(content);

                            innerParser.log('debug', groupName + ' : 匹配 ', matcher.key, ' # ', matcher.rgx, match ? '成功' : '失败');
                            if (match) {
                                result = new MatchResult(matcher, match, content.substr(match[0].length));

                                // console.log('@@d', match.lastIndex, matcher.rgx.source);
                                return true;
                            }
                        });

                        return result;
                    }
                },
                token: MatchResult.prototype.token,
                find: innerParser.find
            }
        );

        return innerParser;
    },

    /**
     * ///
     * 默认是 'off' 关闭,
     *
     * 设为 'once' 的话, 单次 process 会打印出 debug 信息, 结束后自动归为 'off'
     *
     * 如为 'on', 则需要手动设回 'off'
     * ///
     * @def: .debug: 'once' | 'on' | 'off'
     */
    debug: 'off'
};


module.exports = TokenParserV2;