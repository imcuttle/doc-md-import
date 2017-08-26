/**
 * @file   zh_CN
 * @author yucong02
 */

module.exports = {
    infoPrefix: '信息',
    debugPrefix: '调试',
    warnPrefix: '警告',
    succPrefix: '成功',
    errorPrefix: '错误',

    existNullConf: '存在未配置的数据. (如 username/password，请使用`docin -h`查看帮助)',

    initForce: '强制初始化，会覆盖你之前的设置',
    initDesc: 'doc-pipe初始化',
    initExistPathError: '已经存在doc-pipe配置目录，请使用`doc-pipe init -f`强制覆盖',
    initDone: '完成初始化！',

    pushForce: '强制push (将以本地doc为准，来更新远端)',
    pushDesc: 'push本地文档至远端',

    viewDesc: '查看当前有哪些文档记录',

    tocDesc: '根据之前的push记录，生成文章索引在当前文件夹',
    tocPush: '是否在远端生成目录索引文档',
    succToc: '文章索引生成成功，请在${1}文件下查看.'
        + '\n\t如需提交至远端，请执行 `doc-pipe push ${2}`',

    rmDesc: '删除远端的文档',
    succRm: '成功删除远端文档!',

    updateWarnSec1: '文件有更新',
    updateWarnSec2: '本地更新时间',
    updateWarnSec3: '服务器更新时间',

    noUpdate: '服务器没有数据更新',

    succPush: 'push成功! '
}