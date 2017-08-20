var TokenParser = require('../TokenParser')
/**
 * markdown -> tree
 */
var md2Tree = TokenParser.create(function (methods, rgx, utils) {
    utils.inject({
        // inline syntax
        // related tree depth
        headNewline: /^[ \t]*(#{1,}) .*?\n/,
        headEnd: /^[ \t]*(#{1,}) .*?$/,
        disorderItemNewline: /^([ \t]*)[+-] .*?\n/,
        disorderItemEnd: /^([ \t]*)[+-] .*?$/,
        orderItemNewline: /^([ \t]*)\d+\. .*?\n/,
        orderItemEnd: /^([ \t]*)\d+\. .*?$/,

        // block syntax
        // @todo -> \s{4} code\n\s{4} code
        blockCode: /^[ \t]*(~{3,}|`{3,})[^]*?\n[^]*?\1/,
        blockQuote: /^([ \t]*> .*\n)+/,
        blockQuoteEnd: /^([ \t]*> .*\n)+\s*> .*$/,
        table: /^[ \t]*\|.*\|\s*\n\s*\|:?-+:?\|.*?\n(\s*\|.*\|\s*\n)*/,

        // unrelated inline
        empty: /^[ \t]*\n/,
        emptyEnd: /^[ \t]*$/,
        unrelatedInline: /^.*\n/,
        unrelatedInlineEnd: /^.*$/
    });

    utils.pack('main', [
        rgx.headNewline,
        rgx.headEnd,
        rgx.disorderItemNewline,
        rgx.disorderItemEnd,
        rgx.orderItemNewline,
        rgx.orderItemEnd,

        rgx.blockCode,
        rgx.blockQuote,
        rgx.blockQuoteEnd,
        rgx.table,

        rgx.empty,
        rgx.emptyEnd,
        rgx.unrelatedInline,
        rgx.unrelatedInlineEnd
    ]);

    methods.start = function (content) {
        var t, tokens = [], id = 1, extra = {};
        var par, level, tmp, last;

        function findParentChain(match, type) {
            var isLast = type === 'last';
            var temp = par, matchNode;
            while (temp) {
                if (match && match(temp)) {
                    if (isLast) {
                        matchNode = temp;
                    } else {
                        return temp;
                    }
                }
                temp = temp.parent;
            }
            return matchNode;
        }

        function backToParent() {
            if (!par) {
                return
            }
            var lastListPar;
            if (par.type === 'list' && last && last.type === 'empty') {
                par = par.parent;

                lastListPar = findParentChain(function (node) {
                    return node.type === 'list';
                }, 'last');
                if (lastListPar) {
                    par = lastListPar.parent
                }
            }
        }

        while (content && (t = utils.find.main(content))) {
            t.appendTo = t.appendTo.bind(t, tokens)
            extra = {id: id};
            last = tokens[tokens.length - 1]
            switch (t.matcher) {
                case rgx.headNewline:
                case rgx.headEnd:
                    level = t.match[1].length
                    backToParent();
                    if (par) {

                        if (par.type === 'head') {
                            if (level > par.level) {
                                t.appendTo('head', undefined, {id: id, parent: par.id});
                            }
                            else {
                                var firstMatch = findParentChain(function (node) {
                                    return node.level <= level;
                                }, 'first');

                                if (firstMatch) {
                                    if (firstMatch.level === level) {
                                        t.appendTo('head', undefined, {id: id, parent: firstMatch.parent ? firstMatch.parent.id : undefined});
                                        par = firstMatch.parent;
                                    }
                                    else {
                                        t.appendTo('head', undefined, {id: id, parent: firstMatch.id});
                                        par = firstMatch;
                                    }
                                }
                                else {
                                    t.appendTo('head', undefined, {id: id, parent: par.id});
                                }
                            }

                        }
                        else {
                            t.appendTo('head', undefined, {id: id, parent: par.id});
                        }
                    } else {
                        t.appendTo('head', undefined, extra);
                    }
                    par = {level: level, id: id, type: 'head', parent: par};

                    break;

                case rgx.disorderItemNewline:
                case rgx.disorderItemEnd:
                case rgx.orderItemNewline:
                case rgx.orderItemEnd:
                    level = t.match[1].length

                    tmp = par;
                    while (tmp) {
                        if (tmp.type === 'list') {
                            if (tmp.level === level) {
                                tmp = tmp.parent
                                // t.appendTo('list', undefined, {id: id, parent: prevPar.id});
                            } else {
                                t.appendTo('list', undefined, {id: id, parent: tmp.id});
                                break;
                            }
                        } else {
                            t.appendTo('list', undefined, {id: id, parent: tmp.id});
                            break;
                        }
                    }
                    if (!par) {
                        t.appendTo('list', undefined, extra);
                    }

                    par = {level: level, id: id, type: 'list', parent: par};
                    break;

                case rgx.blockCode:
                case rgx.blockQuote:
                case rgx.blockQuoteEnd:
                case rgx.table:

                    if (par) {
                        backToParent();
                        t.appendTo('block', undefined, {id: id, parent: par.id});
                    } else {
                        t.appendTo('block', undefined, extra);
                    }

                    break;

                case rgx.empty:
                case rgx.emptyEnd:

                    if (par) {
                        backToParent();
                        t.appendTo('empty', undefined, {id: id, parent: par.id});
                    } else {
                        t.appendTo('empty', undefined, extra);
                    }

                    break;

                case rgx.unrelatedInline:
                case rgx.unrelatedInlineEnd:
                    if (par) {
                        backToParent();
                        t.appendTo('unrelated', undefined, {id: id, parent: par.id});
                    } else {
                        t.appendTo('unrelated', undefined, extra);
                    }

                    break;
            }

            id++;
            content = t.rest;
        }

        return tokens
    };

});

module.exports = md2Tree;