// ==UserScript==
// @name         哔哩哔哩订阅管理 / 批量取消订阅合集
// @author       安和（AHCorn）
// @namespace    https://github.com/AHCorn/Bilibili-Batch-Unsubscribe
// @version      1.0.3
// @license      MIT
// @description  批量管理哔哩哔哩订阅，可实现一键取消所有订阅。
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @match        https://space.bilibili.com/*/favlist*
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
    #bilibili-batch-unsubscribe-panel {
        position: fixed;
        top: 7%;
        left: 13%;
        right: 13%;
        bottom: 7%;
        z-index: 10000;
        background: #fff;
        padding: 40px;
        overflow: auto;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        transition: all 0.5s ease-in-out;
        transform: scale(1);
        opacity: 1;
    }

    #bilibili-batch-unsubscribe-panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        font-size: 24px;
        color: #333;
        font-weight: bold;
    }

    #bilibili-batch-unsubscribe-panel .close-btn {
        cursor: pointer;
        font-size: 30px;
        color: #999;
        transition: color 0.3s;
    }

    #bilibili-batch-unsubscribe-panel .close-btn:hover {
        color: #666;
    }

    #bilibili-batch-unsubscribe-panel .subscription-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
        gap: 20px;
        overflow: auto;
        padding-bottom: 20px;
    }

    #bilibili-batch-unsubscribe-panel .subscription-item {
        display: flex;
        align-items: center;
        padding: 20px;
        background-color: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 15px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transform: translateZ(0);
    }

    #bilibili-batch-unsubscribe-panel .subscription-item:hover {
        background-color: #f8f8f8;
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0,0,0,0.2);
    }

    #bilibili-batch-unsubscribe-panel .subscription-item input[type='checkbox'] {
        flex: none;
        margin-right: 15px;
        appearance: none;
        width: 24px;
        height: 24px;
        border: 2px solid #4CAF50;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s;
    }

    #bilibili-batch-unsubscribe-panel .subscription-item input[type='checkbox']:checked {
        background-color: #4CAF50;
        border-color: #4CAF50;
    }

    #bilibili-batch-unsubscribe-panel .subscription-item label {
        flex-grow: 1;
        font-size: 16px;
        color: #333;
        transition: color 0.3s;
    }

    #bilibili-batch-unsubscribe-panel .action-buttons {
        display: flex;
        justify-content: flex-end;
        margin-top: auto;
        padding-top: 20px;
    }

    #bilibili-batch-unsubscribe-panel .btn {
        cursor: pointer;
        background: linear-gradient(135deg, #6e8efb, #88c9f9);
        color: #fff;
        border: none;
        padding: 12px 25px;
        margin: 0 10px;
        border-radius: 8px;
        font-weight: 600;
        transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    #bilibili-batch-unsubscribe-panel .btn:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }

    .hidden {
        display: none !important;
    }

    #bilibili-batch-unsubscribe-panel input[type="text"] {
        padding: 10px;
        border: 2px solid #6e8efb;
        border-radius: 5px;
        margin-right: 10px;
        font-size: 16px;
        flex-grow: 1;
        transition: border-color 0.3s, box-shadow 0.3s;
    }

    #bilibili-batch-unsubscribe-panel input[type="text"]:focus {
        border-color: #4CAF50;
        box-shadow: 0 0 5px rgba(0, 128, 0, 0.3);
    }

    #bilibili-batch-unsubscribe-panel .action-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 20px;
    }
    `);

    const panelHTML = `
        <div class="panel-header">
            <div>批量管理订阅</div>
            <div class="close-btn" title="关闭">✖</div>
        </div>
        <div class="subscription-list"></div>
        <div class="action-buttons">
            <input type="text" id="search-input" placeholder="关键字搜索">
            <button class="btn" id="select-all">全选</button>
            <button class="btn" id="deselect-all">取消全选</button>
            <button class="btn" id="unsubscribe-selected">取消订阅</button>
        </div>
    `;

    const panel = document.createElement('div');
    panel.id = 'bilibili-batch-unsubscribe-panel';
    panel.className = 'hidden';
    panel.innerHTML = panelHTML;
    document.body.appendChild(panel);

    const subscriptionList = panel.querySelector('.subscription-list');
    const loadingMessage = panel.querySelector('.loading-message');

    async function confirmAndUnsubscribe(title) {
        const subscriptionItems = Array.from(panel.querySelectorAll('.subscription-item'));
        for (let item of subscriptionItems) {
            const itemTitle = item.querySelector('label').textContent.trim();
            if (itemTitle === title) {
                const fid = item.querySelector('input[type="checkbox"]').value;
                await simulateUnsubscribeByTitle(title, fid);
                break;
            }
        }
    }

    async function simulateUnsubscribeByTitle(title, fid) {
        return new Promise((resolve, reject) => {
            console.log(`正在尝试取消订阅: ${title}`);
            const favItem = document.querySelector(`li[fid="${fid}"] a[title="${title}"]`);
            if (favItem) {
                const unsubscribeButton = favItem.closest('li').querySelector('.be-dropdown-item');
                if (unsubscribeButton) {
                    unsubscribeButton.click();
                    setTimeout(() => {
                        console.log(`取消订阅: ${title} 成功`);
                        resolve();
                    }, 1000);
                } else {
                    console.error('未找到取消订阅按钮');
                    reject('未找到取消订阅按钮');
                }
            } else {
                console.error('未找到对应的订阅项');
                reject('未找到对应的订阅项');
            }
        });
    }

    function togglePanel() {
        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            loadAndDisplaySubscriptions();
        } else {
            panel.classList.add('hidden');
        }
    }

    function loadAndDisplaySubscriptions() {
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.textContent = '正在加载订阅列表，请稍候...';
        panel.appendChild(loadingMessage);
        const containers = Array.from(document.querySelectorAll('.nav-container.fav-container'));
        const targetContainer = containers.find(container => container.querySelector('p')?.textContent.includes('我的收藏和订阅'));
        if (!targetContainer) {
            console.error('指定容器未找到');
            return;
        }

        const favListContainer = targetContainer.querySelector('.fav-list-container');
        if (!favListContainer) {
            console.error('未找到订阅列表');
            return;
        }

        let lastHeight = favListContainer.scrollHeight;
        let attempts = 0;

        const checkScroll = () => {
            const currentHeight = favListContainer.scrollHeight;
            favListContainer.scrollTop += favListContainer.clientHeight / 2;

            if (lastHeight !== currentHeight) {
                lastHeight = currentHeight;
                attempts = 0;
                setTimeout(checkScroll, 10);
            } else if (attempts < 50) {
                attempts++;
                setTimeout(checkScroll, 20);
            } else {
                console.log('没有更多内容');
                displayLoadedSubscriptions(targetContainer);
                panel.removeChild(loadingMessage);
            }
        };

        checkScroll();
    }

    function displayLoadedSubscriptions(container) {
        const items = container.querySelectorAll('.fav-item');
        const subscriptionList = document.querySelector('.subscription-list');
        subscriptionList.innerHTML = '';

        items.forEach((item) => {
            const title = item.querySelector('.text').title;
            const link = item.querySelector('.text').href;
            const fid = item.getAttribute('fid');

            const listItem = document.createElement('div');
            listItem.classList.add('subscription-item');

            listItem.innerHTML = `<input type="checkbox" value="${fid}" class="subscription-checkbox">
                                 <label>${title}</label>
                                 <a href="${link}" target="_blank" class="view-link">查看</a>`;

            subscriptionList.appendChild(listItem);
        });
    }

    // 关闭面板
    const closeBtn = panel.querySelector('.close-btn');
    closeBtn.addEventListener('click', togglePanel);

    // 全选（修复筛选错误问题）
    const selectAllBtn = panel.querySelector('#select-all');
    selectAllBtn.addEventListener('click', () => {
        const visibleCheckboxes = panel.querySelectorAll('.subscription-item:not([style*="display: none"]) input[type="checkbox"]');
        visibleCheckboxes.forEach((checkbox) => {
            checkbox.checked = true;
        });
    });

    // 取消全选
    const deselectAllBtn = panel.querySelector('#deselect-all');
    deselectAllBtn.addEventListener('click', () => {
        const checkboxes = panel.querySelectorAll('.subscription-item input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        });
    });

    const unsubscribeSelectedBtn = panel.querySelector('#unsubscribe-selected');
    unsubscribeSelectedBtn.addEventListener('click', async () => {
        const checkedItems = panel.querySelectorAll('.subscription-item input[type="checkbox"]:checked');
        for (let checkbox of checkedItems) {
            const title = checkbox.nextElementSibling.textContent.trim();
            await confirmAndUnsubscribe(title);
        }

        // 刷新订阅
        loadAndDisplaySubscriptions();
    });

    const searchInput = panel.querySelector('#search-input');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const subscriptionItems = panel.querySelectorAll('.subscription-item');

        subscriptionItems.forEach((item) => {
            const title = item.querySelector('label').textContent.trim().toLowerCase();
            if (title.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    GM_registerMenuCommand('订阅管理', togglePanel);
})();
