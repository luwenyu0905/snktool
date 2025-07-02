# SNKRDUNK 自动改价助手（商用版）

## 功能

- 自动改价，无需手动操作
- 支持手机和电脑浏览器
- 同款同尺码只改一条
- 随机延迟，弹窗自动确认
- 授权验证，远程加载，防盗用

## 使用说明

### 1. 安装 Tampermonkey

请先安装浏览器插件 Tampermonkey：
https://www.tampermonkey.net/

### 2. 安装加载器脚本

打开链接安装加载器脚本：
```
https://raw.githubusercontent.com/luwenyu0905/SNK/main/loader/loader.user.js
```

### 3. 输入授权码

首次加载时，输入你获得的授权码，授权通过后自动加载主脚本。

---

## 授权管理

- 授权码由管理员统一管理，绑定用户身份
- 授权码可设置过期时间、状态
- 如有异常，请联系管理员

---

## 部署指南

1. 将 `src/main.js` 代码写好后，运行 `obfuscate.js` 生成 `dist/main.ob.js`
2. 将 `dist/main.ob.js` 上传到服务器（如 Vercel）
3. 维护授权验证 Google Apps Script API
4. 发布并推广 `loader.user.js`，用户安装后输入授权码即可使用

---

## 联系

维护人：文羽 陆  
邮箱：luwenyu0905@outlook.com
