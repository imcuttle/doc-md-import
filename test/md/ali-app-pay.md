---
title: 支付宝第三方支付，App支付教程
date: 2017-03-29 14:35:58
categories:
tags:
cover:
keywords:
---

1. 进入蚂蚁金服开放平台主页  
[开放平台主页](https://openhome.alipay.com/platform/manageHome.htm)
2. 点击进入开发者中心  
<img src="https://ooo.0o0.ooo/2017/03/29/58db572b1c099.jpg" width="1436" height="674"/>
3. 创建支付应用  
<img src="https://ooo.0o0.ooo/2017/03/29/58db57afbe3c3.jpg" width="1430" height="406"/>
4. 输入应用名称, 上传应用logo后
<img src="https://ooo.0o0.ooo/2017/03/29/58db5d67798de.jpg" width="126" height="126"/>
5. 在功能列表中选择“我是商户，自己开发并使用功能”，确定包含“App支付”，并同意协议
<img src="https://ooo.0o0.ooo/2017/03/29/58db58901d9f6.jpg" width="1337" height="368"/>
6. 在开发配置中设置公钥私钥
<img src="https://ooo.0o0.ooo/2017/03/29/58db593c7d6c5.jpg" width="1255" height="513"/>
身份验证后，配置应用网关，填写公钥后，填写网关`http://yc.dev.mydocumate.com/resume/default/gate`，加签方式设置为 `RSA2(SHA256)`
    - 公钥
    ```
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnT9eKtlXxw9gCedtKsCh41wtGaHiLVpzFfq+iYJTDQw3H0hGfKcwkPCv1AasDjPUZiTGtcQtXv5z90hWE5bknDP5is9hFUKRV+zvvzaBxOqerzwY6/+6O+vGIZ94ViqMJ3yaK/D4JA+dBEH/YS2lDcN/cVfJWcMxrr7odmh24F+VWkpqhIs9e2lEtK7fUVEhjBB+1S7weQHUDF1X9WEQVarS42P/Eva7SXvryYL5snkMM4xU3sLDlSaeAjVztvzsLgMU24tibjFLvD8OpKq2J8etP9Lq/GhG4EyJ0U8U9AyVT1T6hG1cS99QF81SJt+UY3pkTx4OkThJeaj5KOyXOwIDAQAB
    ```
<img src="https://ooo.0o0.ooo/2017/03/29/58db5a28b9158.jpg" width="726" height="455"/>

7. 最后提交申请，审核通过后
需要提供 **AppID** 与 **支付宝公钥**
<img src="https://ooo.0o0.ooo/2017/03/29/58db5b5ce6105.jpg" width="1042" height="175"/>
<img src="https://ooo.0o0.ooo/2017/03/29/58db5b75ea782.jpg" width="792" height="512"/>
    