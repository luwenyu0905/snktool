// ==UserScript==
// @name         🛡 SNKRDUNK 改价助手加载器
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  授权验证+加载远程混淆脚本
// @match        https://snkrdunk.com/*
// @grant        none
// ==/UserScript==

(function() {
    const AUTH_CODE = prompt("请输入你的授权码");
    const API_URL = 'https://script.google.com/macros/s/AKfycbyQX6PvP6w_IyL-aaSfC4vd6vKYWXkqw6qxxIl1FzVmAJdaNaaHq76ggkRBP6imp222/exec';
    const SCRIPT_URL = 'https://snktool.vercel.app/dist/main.ob.js';

    if (!AUTH_CODE) return alert("❌ 授权码不能为空");

    fetch(`${API_URL}?auth_code=${AUTH_CODE}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'active') {
                const s = document.createElement('script');
                s.src = SCRIPT_URL + `?t=${Date.now()}`;
                document.body.appendChild(s);
                console.log('✅ 授权通过，加载主脚本');
            } else {
                alert('❌ 授权无效或已过期');
            }
        })
        .catch(err => {
            console.error('授权验证失败:', err);
            alert('❌ 授权服务器异常，请稍后再试');
        });
})();
