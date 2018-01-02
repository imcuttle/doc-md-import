
## a
### b
# c

1. 多叉树  
    ```
        root
    /   |  \
    a1   a2   a3
    |    / \    \
    null b1  b2   b3
        |     \     \
        null   null   null
    ```
    
    > sds
    > ssss

    ```
        root
    /   |  \
    a1   a2   a3
    |    / \    \
    null b1  b2   b3
        |     \     \
        null   null   null
    ```

- item a<space><space>

    childB of a

  ```
  i'm child of a
  ```

i'm not child of a

- item b
    childB of b

    i'm child of b


i'm not child of b


- c
   - d
 - e

# a   
aaaaaa

### b 
bbbbbb
## c  
ccccc
## d 
dddddd 
# e   
eeeee

#ss
i'm an apple.     
i'm an egg.       
> ```             
> code A           
> ```      
```
code C
```

|sds|xsd|
|--|:--:|
|sd|xxxx|

 ## A-1             
                  
text in A-1       
                  
1. A-1-1           
description1 in A-1-1   
description2 in A-1-1
2. A-1-2
description in A-1-2

#ss
3. A-1-3

 - ssds  
  - xxxsw 
## xx是多少
    - ### sssd

## ssx
not description

~~~
code B
~~~

---
title: Offer入职项目复盘 (余聪)
datetime: 2018-01-02 21:27:42
---

## i18n

我的 i18n 从无到有的过程如下：  
1. 提取需要翻译的 i18n (含中文) 文本  
    使用方法:  
     `matriks2 gen-zh src/frontend/OfferHandling/**/*.js > zh_list.js`
2. PM 提供翻译完成的 excel 文件（或者其他格式）
3. 利用 tingcen 的 [cyou-i18n](https://www.npmjs.com/package/cyou-i18n) 批量替换 `_i('xxx')`
4. 后续部分的修改利用**i18n在线编辑**修改（可以提供给PM）  
    使用方法：
    - 在url上加上`?i18n-edit-live=true` 或者 `localStorage.setItem('i18n-edit-live', true)`, 然后刷新页面
    - 默认只在 **生产环境** 中生效


## 深链及其相关 hoc/decorator/models

### HOC

|名|描述|使用|参数|
|--|-----|---|--|
|lazy-render|延迟渲染，可以用于Loading的渲染，延迟500ms，才真正显示Loading| `@lazyrender(timeout: number)`|timeout: 800|
|uncontrolled|用于非控制组件，绑定componentWillReceiveProps，同步props到state| `@uncontrolled(...name: oneOfType([array, string))`|name: 需要绑定的props的keyName，可以是string，array；如需将props.a 同步到 state.b，则传入['a', 'b']|
|style-useable-hmr|起初使用该hoc是为了解决样式的HMR问题，主要在生命周期中绑定style.use/unuse方法|`@suh(style: object)`|style: usable 的 style 对象|
|state-in-out|将State或者new State传入，并加上一些与视图绑定的生命周期钩子，state实例中应该有`init/update/exit`方法对应View层中的`componentWillMount/componentWillReceiveProps/componentWillUnmont`|`@sio(ClassOrInstance, name: string, initialData)`|ClassOrInstance可以是方法或者State实例；name是绑定在View中的key名，默认为`localState`|
**注意：** state-in-out中的`init/update/exit`方法是下面decorator autorun/url-sync 的前提条件

### decorator

|名|描述|使用|参数
|-|----|----|---
|url-sync|深链: 在state中需要init/update/exit来同步视图的生命周期。同时提供在react View中使用的decorator|`@urlsync(rename: string, { initialWrite: false }) prop = 'xx'`|rename: 重命名，默认为prop名；initialWrite: 是否初始是写在url上
|autorun| 对mobx的封装，加上了dispose的生命周期控制，要求同url-sync。同时提供在react View中使用的decorator|`@autorun method(dispose) {}`|dispose: 调用dispose 会销毁该autorun，初始dispose为undefined

### models

|名|描述|使用
|-|----|----
|Root|提供`toJSON/setValue/assignShallow/assign/init/exit`方法| `class State extends Root`

## babel-preset-es2015-ie

兼容 ie>=9 环境下的 babel 插件预设。  
可能会遇到的坑：
https://www.npmjs.com/package/babel-plugin-transform-es2015-classes#loose

## ie9-polyfill

1. ie9 不能使用 `console.log.apply`
2. ie9 不能使用[dom4](https://www.w3.org/TR/dom/)标准的方法属性，如classList

```html
<!--[if lte IE 9]>
    <script src="../extra/ie9-polyfill.js"></script>
<![endif]-->
```









