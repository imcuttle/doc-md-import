# doc-pipe - 管理/同步 树状文档本地/服务器文章 解决方案

## 画个饼

① doc-pipe 是一个本地和服务器两端的一个双向通道，可以从本地推送到服务器(push)，也可以拉取服务器树状文档至本地(pull)

② doc-pipe 可以完成在本地完成对远端文档的同步和管理

③ doc-pipe 自动化生成文章索引

## 目前定位

① 十分适合个人文章(不可协同编辑)的管理和发布，实现本地到远端的同步。

② 如：个人standup、分享报告、总结...

## 困境

① doc-pipe 使用原生 markdown 的列表、标题来形成树形结构，因此不会完全兼容树状文档的写法。

② 由于不完全兼容树状文档的分层逻辑，所以`tree <-> md`的转化不是互逆的。

③ pull实现逻辑的复杂性

④ 由于1的存在，故不适合于多人协同编辑文章的 远端-本地 同步

## 安装使用

```bash
npm install -g doc-md-import
doc-pipe -h
docin -h

# 首先设置远端用户和密码
docin set-username abc
docin set-password
# 进入到某文章工作目录
cd my-doc
# 初始化 doc-pipe
doc-pipe init
# 将当前文件夹下所有以`.md` `.markdown`结尾的文件推送到远端
doc-pipe push
# push `a/` 下的 md 文件
doc-pipe push a/
# push `a/a.md` 文件
# `-f` 表示强制 push
doc-pipe push a/a.md -f
# 根据 push 记录生成索引 (./doc-pipe-toc.md) 
# `--push` 表示自动将 toc push 至远端
doc-pipe toc --push
# 删除所有的 push 记录，同时也会删除远端的数据
doc-pipe rm
# 删除之前提交的 `a/a.md` 记录
doc-pipe rm a/a.md
# 查看当前的提交记录表
doc-pipe view
```

同时，可以利用下面的语法来对文章标题进行设置

```
---
title: 我是标题
---

## 我是内容
```

## Todo

① pull 的实现？
