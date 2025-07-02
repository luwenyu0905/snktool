// ==UserScript==
// @name         🤑 SNKRDUNK 自动改价助手（自动运行版 电脑手机通用）
// @namespace    http://tampermonkey.net/
// @version      2.0.9
// @description  自动启动，无需按钮控制，适配手机；同款同尺码只改一条，随机延迟改价，弹窗自动确认，支持鞋服路径
// @match        https://snkrdunk.com/listings/*
// @match        https://snkrdunk.com/listing/*/edit/*
// @match        https://snkrdunk.com/apparel-listings/*
// @match        https://snkrdunk.com/apparel-listings/*/edit/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    window.confirm = () => true;
    window.alert = () => {};

    const CONFIG = {
        BASE_DELAY_MS: 2000,
        DELAY_RANGE_MS: 1000,
        MAX_RETRY: 3,
        PRICE_DIFF: 1,
        SAFE_MODE: true
    };

    let retryCount = 0;

    function randomDelay(base = CONFIG.BASE_DELAY_MS, range = CONFIG.DELAY_RANGE_MS) {
        return base + Math.floor(Math.random() * range);
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function findOKButton() {
        const buttons = document.querySelectorAll('a.button-type-1.button-collor-black');
        return [...buttons].find(btn => btn.textContent.trim() === 'OK') || null;
    }

    function findSubmitButton() {
        const buttons = document.getElementsByTagName('button');
        for (const btn of buttons) {
            const text = btn.textContent.trim();
            if (text === '変更する' || text === '編集する') {
                return btn;
            }
        }
        return null;
    }

    async function processEditPage() {
        const minPrice = parseInt(sessionStorage.getItem('snkrdunk_minPrice'), 10);
        if (isNaN(minPrice)) {
            console.warn('❌ 无法获取最低价');
            return;
        }
        const newPrice = minPrice - CONFIG.PRICE_DIFF;

        try {
            const priceInput = document.querySelector('input[name="price"]');
            const submitButton = findSubmitButton();
            if (!priceInput || !submitButton) throw new Error('找不到输入框或提交按钮');

            if (CONFIG.SAFE_MODE) {
                const currentPrice = parseFloat(priceInput.value);
                if (currentPrice <= newPrice) {
                    console.log(`✅ 当前价格已最优: ¥${currentPrice}`);
                    return exitToMainPage();
                }
            }

            priceInput.value = newPrice;
            priceInput.dispatchEvent(new Event('input', { bubbles: true }));
            await delay(800);

            submitButton.click();
            console.log('⏳ 正在提交...');
            await delay(1500);

            const okButton = findOKButton();
            if (okButton) {
                okButton.click();
                console.log(`✅ 改价成功: ¥${newPrice}`);
            } else {
                console.log(`✅ 改价成功（无确认按钮）: ¥${newPrice}`);
            }

            await delay(randomDelay());
            exitToMainPage();
        } catch (error) {
            await handleError(error, '编辑页处理失败');
        }
    }

    async function processListPage() {
        try {
            console.log('📦 正在扫描商品...');
            const res = await fetch('https://snkrdunk.com/v1/listing?page=1&perPage=24');
            const data = await res.json();

            const needUpdateItems = data.items.filter(item => item.price > item.minPrice);
            if (needUpdateItems.length === 0) {
                console.log('✅ 所有商品已是最优价格，30秒后重载...');
                await delay(30000);
                return location.reload();
            }

            const groups = {};
            for (const item of needUpdateItems) {
                const key = item.productNumber + '|' + item.sizeText;
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
            }

            const targets = [];
            for (const key in groups) {
                groups[key].sort((a, b) => a.price - b.price);
                targets.push(groups[key][0]);
            }

            const targetItem = targets.find(item => item.price > item.minPrice);
            if (!targetItem) {
                console.log('✅ 所有组最低价商品已是最优价格');
                await delay(30000);
                return location.reload();
            }

            const newPrice = targetItem.minPrice - CONFIG.PRICE_DIFF;
            console.log(`🎯 发现目标: 当前¥${targetItem.price} → 新价¥${newPrice}`);

            const checkUrl = targetItem.checkEditableUrl || '';
            let targetUrl = '';
            if (checkUrl.includes('/apparel-listings/')) {
                targetUrl = `https://snkrdunk.com/apparel-listings/${targetItem.id}?slide=view`;
            } else {
                targetUrl = `https://snkrdunk.com/listing/${targetItem.id}/edit/?slide=view`;
            }

            sessionStorage.setItem('snkrdunk_minPrice', targetItem.minPrice);
            location.href = targetUrl;

        } catch (error) {
            await handleError(error, '列表页处理失败');
        }
    }

    async function exitToMainPage() {
        location.href = 'https://snkrdunk.com/listings/?slide=right';
    }

    async function handleError(error, context = '') {
        retryCount++;
        console.warn(`❌ ${context}: ${error.message}`);
        if (retryCount >= CONFIG.MAX_RETRY) {
            console.error('⛔ 达到最大重试次数，已停止');
            return;
        }
        await delay(3000);
        location.reload();
    }

    async function main() {
        if (location.href.includes('/listings/')) {
            await processListPage();
        } else if ((location.href.includes('/listing/') || location.href.includes('/apparel-listings/')) &&
                   (location.href.includes('/edit') || !location.href.includes('/edit'))) {
            await processEditPage();
        }
    }

    setTimeout(() => {
        main();
    }, 1000);
})();
