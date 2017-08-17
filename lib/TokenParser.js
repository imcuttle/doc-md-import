/**
 * @file   token-parser
 * @author yucong02
 */

/**
 * ///
 * 本类, 用于规范进行 tokenize 处理的整个流程
 *
 * 基本的思路是,
 *
 * 1. 设置一系列的 状态树 (token 匹配),
 * 2. content + current token node => new content + token result
 * 3. 一直处理到最终 content == ''
 * 4. 如果处理不完, 或者 new content 返回之后跟 content 保持不变, 则抛错
 *
 * ///
 * @start-def: TokenParser: constructor(patternList);
 *  patternList: [patternNode]
 *      patternNode: {} as ~PatternNode
 *          rgx: RegExp             // 用于尝试匹配下一个 token
 *
 *          // process 返回 undefined, 意味着虽然 rgx 匹配成功, 但还是相当于该匹配是无效的
 *          process: match, context => currentToken | undefined
 *              match: RegExpMatch
 *              context: {prevToken, tokens, key: any} as ~ProcessContext
 *                  key: string         // 其他的 context 内容, 会被传递到下一个处理中
 *
 *                  prevToken: {type, key: value} as ~Token
 *                      type: string    // token 的类别
 *                      key: string     // 其他任何的 key
 *                      value: any      // 其他任何相关信息
 *
 *                      // 如果 token 中包含 newContentPrefix, 则添加至 newContent 的前面,
 *                      // 并将其删除
 *                      newContextPrefix: string
 *
 *                  tokens: [#@~Token]  // 按照先后顺序, 包含 prevToken
 *              currentToken: #@~Token
 *
 */
var TokenParser = function (patternList) {
    this.patternList = patternList;

    /**
     * @def: .members.debug: 'once' | 'on' | 'off'
     */
    this.debug = 'off';
};

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
TokenParser.debug = 'off';

// @start-def: TokenParser.prototype;
TokenParser.prototype = {
    /**
     * 当前解析行号
     * @def: ~_lineNum: number
     */
    _lineNum: 1,
    /**
     * 当前解析字符号
     * @def: ~_charNum: number
     */
    _charNum: 0,
    /**
     * @def: .process: content => tokens throws error
     *  content: string     // 用于处理的内容
     *  tokens: [#@Token]   // 按照出现先后顺序, 得到的 token 列表
     *  error: Error
     *      type: 'content-not-reduced'
     */
    process: function (content) {
        var context = {
            prevToken: undefined,
            tokens: []
        };

        this._lineNum = 1;
        this._onProcessStart && this._onProcessStart(context);

        this.log('开始解析');
        while (content) {
            var newContent = this.processNext(content, context);

            // console.log('-----------------------\n', newContent);
            if (newContent === content) {
                throw new Error('content-not-reduced', '剩余结果为 ' + content);
            }

            content = newContent;
        }
        this.log('结束解析');

        if (TokenParser.debug === 'once') {
            TokenParser.debug = 'off';
        }

        if (this.debug === 'once') {
            this.debug = 'off';
        }

        return context.tokens;
    },

    /**
     * // 设置的 callback 会在 process 时被调用
     * @def: .onProcessStart: callback => undefined
     *  callback: context => undefined
     *
     *      // 用于后续处理的上下文对象
     *      // 此时, prevToken = undefined, tokens = []
     *      context: #@~ProcessContext
     */
    onProcessStart: function (callback) {
        this._onProcessStart = callback;
    },

    /**
     * @def: .processNext: content => newContent throws error
     *  newContent: string  // 去除 token 匹配后的剩余内容
     *  error: Error
     *      type: 'content-unresolved'
     */
    processNext: function (content, context) {
        var self = this;
        var match, token, newContent, lines;

        self.log('开始单次解析, 部分 content 内容为: ', this.toJSON(content.substr(0, 50)));
        var found = self.patternList.some(function (patternNode) {
            match = patternNode.rgx.exec(content);
            self.log('尝试用 rgx: ', patternNode.rgx, ' 解析, 结果为: ', match ? '成功' : '失败');
            // console.log(match);

            if (match) {
                newContent = context.newContent = content.substr(match[0].length);
                token = patternNode.process(match, context);
                self.log('命中规则 process 返回 token 为 :', token);
                if (token) {
                    context.prevToken = token;
                    context.tokens.push(token);
                    return true;
                }
            }
        });

        if (!found) {
            throw new Error('content-unresolved', '剩余结果为 ' + '(' + this._lineNum + ':' + this._charNum + '): ' + content + '');
        }

        if (token.newContentPrefix) {
            self.log('发现 newContentPrefix : ', token.newContentPrefix);
            match[0] = match[0].replace(token.newContentPrefix, '')
            newContent = token.newContentPrefix + newContent;
            delete token.newContentPrefix;
        }
        else if (context.newContent !== newContent) {
            newContent = context.newContent;
        }



        lines = match[0].split('\n')
        self._lineNum += lines.length - 1
        self._charNum = lines[lines.length - 1].length + 1

        self.log('结束单次解析');
        return newContent;
    },

    /**
     * // 打印出 debug 信息
     * // 用 #@TokenParser.debug 控制
     * @def: .log: ...arguments => undefind
     */
    log: function () {
        if (TokenParser.debug === 'on' || TokenParser.debug === 'once' || this.debug === 'on' || this.debug === 'once') {
            var args = Array.prototype.slice.apply(arguments);
            for(var i = 0; i < args.length; i++) {
                if (args[i].__type__ === 'to-json') {
                    args[i] = JSON.stringify(args[i].value);
                }
            }
            args.unshift('[token parser] : ');

            console.log.apply(console, args);
        }
    },

    toJSON: function(value) {
        if (TokenParser.debug === 'on' || TokenParser.debug === 'once' || this.debug === 'on' || this.debug === 'once') {
            return {
                __type__: 'to-json',
                value: value
            }
        }
        return false;
    }
};

module.exports = TokenParser;