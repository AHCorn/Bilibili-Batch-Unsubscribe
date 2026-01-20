// ==UserScript==
// @name         哔哩哔哩订阅管理 / 批量取消订阅合集
// @author       安和（AHCorn）
// @namespace    https://github.com/AHCorn/Bilibili-Batch-Unsubscribe
// @version      2.3
// @license      GPL-3.0
// @description  批量管理哔哩哔哩订阅，可实现一键取消所有订阅。
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_download
// @match        https://space.bilibili.com/*/favlist*
// @run-at       document-end
// @downloadURL https://github.com/AHCorn/Bilibili-Batch-Unsubscribe/raw/refs/heads/main/Bilibili-Batch-Unsubscribe.user.js
// @updateURL https://github.com/AHCorn/Bilibili-Batch-Unsubscribe/raw/refs/heads/main/Bilibili-Batch-Unsubscribe.user.js
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
        background: linear-gradient(135deg, #f6f8fa, #e9ecef);
        border-radius: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06);
        padding: 40px;
        display: flex;
        flex-direction: column;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        transform: scale(1);
        opacity: 1;
        backdrop-filter: blur(10px);
    }

    #bilibili-batch-unsubscribe-panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        font-size: 28px;
        color: #00a1d6;
        font-weight: 700;
        text-align: center;
        padding: 32px;
        background: #fff;
        border-radius: 24px;
        border-bottom: 2px solid rgba(0, 161, 214, 0.1);
    }

    #bilibili-batch-unsubscribe-panel .panel-header .title-container {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    #bilibili-batch-unsubscribe-panel .panel-header .github-link {
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: opacity 0.2s ease;
    }

    #bilibili-batch-unsubscribe-panel .panel-header .github-link:hover {
        opacity: 0.8;
    }

    #bilibili-batch-unsubscribe-panel .panel-header .github-icon {
        width: 28px;
        height: 28px;
        fill: #00a1d6;
    }

    #bilibili-batch-unsubscribe-panel .close-btn {
        cursor: pointer;
        font-size: 30px;
        color: #999;
        transition: all 0.2s ease;
    }

    #bilibili-batch-unsubscribe-panel .close-btn:hover {
        color: #666;
        transform: rotate(90deg);
    }

    #bilibili-batch-unsubscribe-panel .subscription-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        flex: 1 1 auto;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 20px;
        margin: 0;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 161, 214, 0.3) transparent;
        min-height: 0;
        align-content: start;
    }

    #bilibili-batch-unsubscribe-panel .subscription-item {
        display: flex;
        align-items: center;
        padding: 16px;
        background-color: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        cursor: pointer;
        user-select: none;
        position: relative;
        overflow: hidden;
        height: auto;
        min-height: 60px;
        flex-shrink: 0;
    }

    #bilibili-batch-unsubscribe-panel .subscription-item:hover {
        background-color: #f8f8f8;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: rgba(0, 161, 214, 0.3);
    }

    #bilibili-batch-unsubscribe-panel .subscription-item.selected {
        background: rgba(0, 161, 214, 0.05);
        border-color: #00a1d6;
    }

    #bilibili-batch-unsubscribe-panel .subscription-item input[type='checkbox'] {
        display: none;
    }

    #bilibili-batch-unsubscribe-panel .subscription-item label {
        flex: 1;
        font-size: 14px;
        color: #18191c;
        margin: 0 12px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 24px;
    }

    #bilibili-batch-unsubscribe-panel .subscription-item .view-link {
        padding: 6px 12px;
        background: rgba(0, 161, 214, 0.1);
        border-radius: 6px;
        color: #00a1d6;
        font-size: 13px;
        transition: all 0.2s ease;
        text-decoration: none;
        white-space: nowrap;
        opacity: 0;
        transform: translateX(10px);
    }

    #bilibili-batch-unsubscribe-panel .subscription-item:hover .view-link {
        opacity: 1;
        transform: translateX(0);
    }

    #bilibili-batch-unsubscribe-panel .subscription-item .view-link:hover {
        background: rgba(0, 161, 214, 0.2);
    }

    #bilibili-batch-unsubscribe-panel .action-buttons {
        display: flex;
        gap: 12px;
        padding: 24px;
        border-top: 2px solid rgba(0, 161, 214, 0.1);
        margin-top: auto;
        background: #fff;
        position: relative;
        z-index: 1;
        border-radius: 24px;
    }

    #bilibili-batch-unsubscribe-panel #search-input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid rgba(0, 161, 214, 0.2);
        border-radius: 12px;
        font-size: 14px;
        color: #18191c;
        transition: all 0.2s ease;
        background: #ffffff;
    }

    #bilibili-batch-unsubscribe-panel #search-input:focus {
        border-color: #00a1d6;
        box-shadow: 0 0 0 3px rgba(0, 161, 214, 0.1);
        outline: none;
    }

    @media screen and (min-width: 1440px) {
        #bilibili-batch-unsubscribe-panel .subscription-list {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 24px;
        }

        #bilibili-batch-unsubscribe-panel .subscription-item {
            padding: 20px;
        }

        #bilibili-batch-unsubscribe-panel .subscription-item label {
            font-size: 15px;
        }
    }

    @media screen and (max-width: 1200px) {
        #bilibili-batch-unsubscribe-panel .subscription-list {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            padding: 16px;
        }

        #bilibili-batch-unsubscribe-panel .subscription-item {
            padding: 14px;
        }
    }

    @media screen and (max-width: 768px) {
        #bilibili-batch-unsubscribe-panel {
            left: 5%;
            right: 5%;
        }

        #bilibili-batch-unsubscribe-panel .subscription-list {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 12px;
        }

        #bilibili-batch-unsubscribe-panel .action-buttons {
            flex-wrap: wrap;
            padding: 16px;
        }

        #bilibili-batch-unsubscribe-panel #search-input {
            width: 100%;
            margin-bottom: 12px;
        }

        #bilibili-batch-unsubscribe-panel .btn {
            flex: 1;
            min-width: 0;
            padding: 10px 16px;
            font-size: 13px;
        }
    }

    @media screen and (max-width: 480px) {
        #bilibili-batch-unsubscribe-panel {
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            border-radius: 0;
        }

        #bilibili-batch-unsubscribe-panel .subscription-list {
            padding: 10px;
            gap: 10px;
        }

        #bilibili-batch-unsubscribe-panel .subscription-item {
            padding: 12px;
        }

        #bilibili-batch-unsubscribe-panel .action-buttons {
            padding: 12px;
        }

        #bilibili-batch-unsubscribe-panel .btn {
            padding: 8px 12px;
            font-size: 12px;
            border-radius: 8px;
        }
    }

    #bilibili-batch-unsubscribe-panel .subscription-list::-webkit-scrollbar {
        width: 6px;
    }

    #bilibili-batch-unsubscribe-panel .subscription-list::-webkit-scrollbar-track {
        background: transparent;
    }

    #bilibili-batch-unsubscribe-panel .subscription-list::-webkit-scrollbar-thumb {
        background-color: rgba(0, 161, 214, 0.3);
        border-radius: 3px;
    }

    #bilibili-batch-unsubscribe-panel .subscription-list::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 161, 214, 0.5);
    }

    #bilibili-batch-unsubscribe-panel .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: #00a1d6;
        color: #ffffff;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 161, 214, 0.2);
    }

    #bilibili-batch-unsubscribe-panel .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 161, 214, 0.3);
        background: #00b5e5;
    }

    #bilibili-batch-unsubscribe-panel .btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 161, 214, 0.2);
    }

    #bilibili-batch-unsubscribe-panel #select-all,
    #bilibili-batch-unsubscribe-panel #deselect-all {
        background: rgba(0, 161, 214, 0.1);
        color: #00a1d6;
        box-shadow: none;
    }

    #bilibili-batch-unsubscribe-panel #select-all:hover,
    #bilibili-batch-unsubscribe-panel #deselect-all:hover {
        background: rgba(0, 161, 214, 0.2);
        box-shadow: 0 4px 12px rgba(0, 161, 214, 0.1);
    }

    #bilibili-batch-unsubscribe-panel #unsubscribe-selected {
        background: #fb7299;
        box-shadow: 0 2px 8px rgba(251, 114, 153, 0.2);
    }

    #bilibili-batch-unsubscribe-panel #unsubscribe-selected:hover {
        background: #fc8bab;
        box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
    }

    #bilibili-batch-unsubscribe-panel #export-csv {
        background: #00c4a7;
        box-shadow: 0 2px 8px rgba(0, 196, 167, 0.2);
    }
    #bilibili-batch-unsubscribe-panel #export-csv:hover {
        background: #00d7b9;
        box-shadow: 0 4px 12px rgba(0, 196, 167, 0.3);
    }

    #bilibili-batch-unsubscribe-panel .progress-container {
        margin-top: 20px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.98);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        border: 1px solid rgba(0, 161, 214, 0.1);
        display: none;
        backdrop-filter: blur(10px);
    }

    #bilibili-batch-unsubscribe-panel .progress-title {
        font-size: 16px;
        color: #00a1d6;
        margin-bottom: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
    }

    #bilibili-batch-unsubscribe-panel .progress-title::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        background: #00a1d6;
        border-radius: 50%;
        margin-right: 8px;
        animation: pulse 2s infinite;
    }

    #bilibili-batch-unsubscribe-panel .progress-bar {
        width: 100%;
        height: 6px;
        background: #f0f2f5;
        border-radius: 3px;
        overflow: hidden;
        margin: 10px 0;
    }

    #bilibili-batch-unsubscribe-panel .progress-bar-inner {
        height: 100%;
        background: linear-gradient(90deg, #6e8efb, #00a1d6);
        width: 0%;
        transition: width 0.3s ease;
        border-radius: 3px;
        box-shadow: 0 0 10px rgba(0, 161, 214, 0.3);
    }

    #bilibili-batch-unsubscribe-panel .progress-info {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
        font-size: 14px;
        color: #666;
    }

    #bilibili-batch-unsubscribe-panel .progress-count {
        font-family: 'Segoe UI', 'Roboto', sans-serif;
    }

    #bilibili-batch-unsubscribe-panel .progress-percentage {
        font-weight: 600;
        color: #00a1d6;
    }

    #bilibili-batch-unsubscribe-panel .button-container {
        display: flex;
        justify-content: center;
        margin-top: 15px;
        gap: 10px;
    }

    #bilibili-batch-unsubscribe-panel .abort-button,
    #bilibili-batch-unsubscribe-panel .return-button {
        padding: 8px 16px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        width: 100%;
    }

    #bilibili-batch-unsubscribe-panel .abort-button {
        background: #f25d8e;
        color: white;
    }

    #bilibili-batch-unsubscribe-panel .abort-button:hover {
        background: #e74d7b;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(242, 93, 142, 0.2);
    }

    #bilibili-batch-unsubscribe-panel .return-button {
        background: #00a1d6;
        color: white;
        display: none;
    }

    #bilibili-batch-unsubscribe-panel .return-button:hover {
        background: #0091c2;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 161, 214, 0.2);
    }

    #bilibili-batch-unsubscribe-panel .progress-container.completed .progress-title::before {
        animation: none;
        background: #00a1d6;
    }

    #bilibili-batch-unsubscribe-panel .progress-container.completed .progress-title {
        color: #00a1d6;
    }

    @keyframes pulse {
        0% { transform: scale(0.95); opacity: 0.5; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.5; }
    }

    #unsubscribe-progress {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 320px;
        background: rgba(255, 255, 255, 0.98);
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        padding: 20px;
        z-index: 10001;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 161, 214, 0.1);
        animation: progressFadeIn 0.3s ease-out;
        display: none;
    }

    #bilibili-batch-unsubscribe-panel.hidden ~ #unsubscribe-progress {
        display: block;
    }

    @keyframes progressFadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    #unsubscribe-progress .progress-title {
        font-size: 16px;
        color: #00a1d6;
        font-weight: 600;
        margin-bottom: 16px;
    }

    #unsubscribe-progress .progress-bar {
        height: 6px;
        background: rgba(0, 161, 214, 0.1);
        border-radius: 3px;
        overflow: hidden;
        margin: 12px 0;
        position: relative;
    }

    #unsubscribe-progress .progress-bar-inner {
        height: 100%;
        background: linear-gradient(90deg, #00a1d6, #00b5e5);
        border-radius: 3px;
        width: 0%;
        transition: width 0.3s ease-out;
    }

    #unsubscribe-progress .progress-info {
        display: flex;
        justify-content: space-between;
        margin: 12px 0;
        font-size: 14px;
        color: #666;
    }

    #unsubscribe-progress .progress-percentage {
        color: #00a1d6;
        font-weight: 600;
    }

    #unsubscribe-progress .button-container {
        display: flex;
        gap: 8px;
        margin-top: 16px;
    }

    #unsubscribe-progress .abort-button,
    #unsubscribe-progress .return-button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    #unsubscribe-progress .abort-button {
        background: #fb7299;
        color: #ffffff;
    }

    #unsubscribe-progress .abort-button:hover {
        background: #fc8bab;
        transform: translateY(-1px);
    }

    #unsubscribe-progress .return-button {
        background: #00a1d6;
        color: #ffffff;
    }

    #unsubscribe-progress .return-button:hover {
        background: #00b5e5;
        transform: translateY(-1px);
    }

    .hidden {
        display: none !important;
        opacity: 0;
        visibility: hidden;
    }

    #unsubscribe-progress,
    #bilibili-batch-unsubscribe-panel .progress-container {
        display: none;
    }

    #bilibili-batch-unsubscribe-panel .loading-message {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 20px 40px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        font-size: 16px;
        color: #00a1d6;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
    }

    #bilibili-batch-unsubscribe-panel .loading-message::before {
        content: '';
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #00a1d6;
        border-top-color: transparent;
        border-radius: 50%;
        animation: loading-spin 1s linear infinite;
    }

    @keyframes loading-spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 1200px) {
        #bilibili-batch-unsubscribe-panel .subscription-list {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        #bilibili-batch-unsubscribe-panel .subscription-list {
            grid-template-columns: 1fr;
        }
    }
    `);

    const panelHTML = `
        <div class="panel-header">
            <div class="title-container">
                <div>批量管理订阅</div>
                <a href="https://github.com/AHCorn/Bilibili-Batch-Unsubscribe" target="_blank" class="github-link" title="⭐">
                    <svg class="github-icon" viewBox="0 0 16 16" version="1.1" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                </a>
            </div>
            <div class="close-btn" title="关闭">✖</div>
        </div>
        <div class="subscription-list"></div>
        <div class="action-buttons">
            <input type="text" id="search-input" placeholder="关键字搜索">
            <button class="btn" id="select-all">全选</button>
            <button class="btn" id="deselect-all">取消全选</button>
            <button class="btn" id="unsubscribe-selected">取消订阅</button>
            <button class="btn" id="export-csv">导出CSV</button>
        </div>
        <div class="progress-container">
            <div class="progress-title">正在取消订阅</div>
            <div class="progress-bar">
                <div class="progress-bar-inner"></div>
            </div>
            <div class="progress-info">
                <span class="progress-count">0/0</span>
                <span class="progress-percentage">0%</span>
            </div>
            <div class="button-container">
                <button class="abort-button">中止操作</button>
                <button class="return-button">返回管理面板</button>
            </div>
        </div>
    `;

    const panel = document.createElement('div');
    panel.id = 'bilibili-batch-unsubscribe-panel';
    panel.className = 'hidden';
    panel.innerHTML = panelHTML;
    document.body.appendChild(panel);

    const subscriptionList = panel.querySelector('.subscription-list');
    const loadingMessage = panel.querySelector('.loading-message');

    async function simulateMouseEvents(element, events = ['mouseover', 'mouseenter', 'mousemove']) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let eventType of events) {
            try {
                element.dispatchEvent(new Event(eventType, {
                    bubbles: true,
                    cancelable: true
                }));

                if (eventType === 'mouseover') {
                    element.dispatchEvent(new Event('mouseenter', {
                        bubbles: false,
                        cancelable: true
                    }));
                }
            } catch (error) {
                console.error(`创建${eventType}事件失败:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async function confirmAndUnsubscribe(title) {
        const isNewUI = document.querySelector('.vui_collapse_item') !== null;

        if (!isNewUI) {
            const subscriptionItems = Array.from(panel.querySelectorAll('.subscription-item'));
            for (let item of subscriptionItems) {
                const itemTitle = item.querySelector('label').textContent.trim();
                if (itemTitle === title) {
                    const fid = item.querySelector('input[type="checkbox"]').value;
                    await simulateUnsubscribeByTitle(title, fid);
                    break;
                }
            }
            return;
        }

        const subscriptionItems = Array.from(panel.querySelectorAll('.subscription-item'));
        for (let item of subscriptionItems) {
            const itemTitle = item.querySelector('label').textContent.trim();
            if (itemTitle === title) {
                const originalItem = document.querySelector(`div[title="${title}"]`);
                if (originalItem) {
                    const titleArea = originalItem.querySelector('.vui_ellipsis.multi-mode');
                    if (titleArea) {
                        try {
                            await new Promise(async (resolve, reject) => {
                                let moreIcon = null;
                                let iconVisible = false;
                                let dialogObserver = null;
                                let unsubscribeClicked = false;
                                let confirmClicked = false;
                                let retryCount = 0;
                                const MAX_RETRIES = 3;
                                const TIMEOUT_DURATION = 5000;
                                let timeoutId;

                                dialogObserver = new MutationObserver((mutations) => {
                                    if (unsubscribeClicked && !confirmClicked) {
                                        const dialogs = document.querySelectorAll('.vui_dialog--content');
                                        for (const dialog of dialogs) {
                                            const title = dialog.querySelector('.vui_dialog--title');
                                            const body = dialog.querySelector('.vui_dialog--body');
                                            if (title?.textContent === '确认提示' &&
                                                body?.textContent === '确定取消订阅吗？') {
                                                const confirmBtn = dialog.querySelector('.vui_button--blue.vui_dialog--btn-confirm');
                                                if (confirmBtn) {
                                                    confirmClicked = true;
                                                    clearTimeout(timeoutId);
                                                    setTimeout(() => {
                                                        try {
                                                            confirmBtn.click();
                                                            setTimeout(() => {
                                                                const modalRoot = dialog.closest('.vui_dialog--root');
                                                                if (modalRoot) {
                                                                    const modalContainer = modalRoot.parentElement;
                                                                    if (modalContainer) {
                                                                        modalContainer.remove();
                                                                    }
                                                                }
                                                                dialogObserver.disconnect();
                                                                resolve();
                                                            }, 300);
                                                        } catch (error) {
                                                            console.error('点击确认按钮失败:', error);
                                                            reject(error);
                                                        }
                                                    }, 200);
                                                }
                                            }
                                        }
                                    }
                                });

                                dialogObserver.observe(document.body, {
                                    childList: true,
                                    subtree: true,
                                    attributes: true,
                                    attributeFilter: ['style', 'class']
                                });

                                const observer = new MutationObserver(async (mutations) => {
                                    if (!iconVisible) {
                                        moreIcon = originalItem.querySelector('.sic-BDC-more_vertical_fill');
                                        if (moreIcon && window.getComputedStyle(moreIcon).display !== 'none') {
                                            iconVisible = true;
                                            await simulateMouseEvents(moreIcon, ['mouseenter', 'mouseover']);
                                        }
                                    }

                                    if (iconVisible && !unsubscribeClicked) {
                                        const menuPanel = document.querySelector('.menu-popover__panel');
                                        if (menuPanel) {
                                            const unsubscribeButton = Array.from(menuPanel.querySelectorAll('.menu-popover__panel-item'))
                                                .find(btn => btn.textContent.trim() === '取消订阅');

                                            if (unsubscribeButton) {
                                                unsubscribeClicked = true;
                                                observer.disconnect();
                                                unsubscribeButton.click();
                                            }
                                        }
                                    }
                                });

                                observer.observe(document.body, {
                                    childList: true,
                                    subtree: true,
                                    attributes: true,
                                    attributeFilter: ['style', 'display']
                                });

                                const trySimulateEvents = async () => {
                                    try {
                                        await simulateMouseEvents(titleArea);
                                    } catch (error) {
                                        if (retryCount < MAX_RETRIES) {
                                            retryCount++;
                                            await new Promise(resolve => setTimeout(resolve, 500));
                                            await trySimulateEvents();
                                        } else {
                                            reject('模拟鼠标事件失败，已达到最大重试次数');
                                        }
                                    }
                                };

                                await trySimulateEvents();

                                timeoutId = setTimeout(() => {
                                    if (!confirmClicked) {
                                        observer.disconnect();
                                        dialogObserver.disconnect();
                                        if (retryCount < MAX_RETRIES) {
                                            retryCount++;
                                            console.log(`重试第 ${retryCount} 次...`);
                                            trySimulateEvents();
                                        } else {
                                            reject('操作超时，已达到最大重试次数');
                                        }
                                    }
                                }, TIMEOUT_DURATION);
                            });

                            await new Promise(resolve => setTimeout(resolve, 500));

                        } catch (error) {
                            console.error(`取消订阅失败: ${title}`, error);
                            throw error;
                        }
                    }
                }
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

    function getLoadMoreButton(scrollContainer) {
      return scrollContainer.querySelector('.fav-collapse-more');
    }

    async function tryLoadAllSubscriptionsByClickLoadMore(scrollContainer) {
      if (!scrollContainer) {
        return;
      }
      const innerScrollContainer = scrollContainer.querySelector('.vui_sidebar');
      let loadMoreButton = getLoadMoreButton(scrollContainer);
      if (!loadMoreButton) {
        return;
      }

      let currentHeight = innerScrollContainer.scrollHeight;
      let attempts = 0;
      const MAX_ATTEMPTS = 10;
      while (attempts < MAX_ATTEMPTS) {
        loadMoreButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        const newHeight = innerScrollContainer.scrollHeight;
        if (newHeight > currentHeight) {
          currentHeight = newHeight;
          attempts = 0;
        } else {
          attempts++;
        }

        loadMoreButton = getLoadMoreButton(scrollContainer);
        if (!loadMoreButton) {
          break;
        }
      }
    }

    async function loadAndDisplaySubscriptions() {
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.textContent = '正在加载订阅列表，请稍候...';
        panel.appendChild(loadingMessage);

        const collapseHeaders = Array.from(document.querySelectorAll('.vui_collapse_item_header'));
        const targetHeader = collapseHeaders.find(header => header.textContent.includes('我追的合集/收藏夹'));
        let favListContainer;

        if (targetHeader) {
            const collapseItem = targetHeader.closest('.vui_collapse_item');

            const scrollContainer = collapseItem.querySelector('.vui_collapse_item_content');

            if (scrollContainer && getLoadMoreButton(scrollContainer)) {
              await tryLoadAllSubscriptionsByClickLoadMore(scrollContainer);
            }
            else if (scrollContainer) {
                let lastHeight = scrollContainer.scrollHeight;
                let attempts = 0;
                const MAX_ATTEMPTS = 50;

                await new Promise((resolve) => {
                    const tryScroll = () => {
                        const currentHeight = scrollContainer.scrollHeight;
                        scrollContainer.scrollTop = currentHeight;

                        if (lastHeight !== currentHeight) {
                            lastHeight = currentHeight;
                            attempts = 0;
                            setTimeout(tryScroll, 100);
                        } else if (attempts < MAX_ATTEMPTS) {
                            attempts++;
                            setTimeout(tryScroll, 100);
                        } else {
                            resolve();
                        }
                    };
                    tryScroll();
                });
            }

            const sidebarItems = collapseItem.querySelectorAll('.fav-sidebar-item');
            favListContainer = document.createElement('div');
            favListContainer.className = 'fav-list-container';

            sidebarItems.forEach(item => {
                const title = item.getAttribute('title');
                const link = item.querySelector('.vui_sidebar-item-title')?.parentElement?.closest('a')?.href || '#';
                const count = item.querySelector('.vui_sidebar-item-right')?.textContent.trim() || '0';

                const favItem = document.createElement('div');
                favItem.className = 'fav-item';
                favItem.setAttribute('fid', title);

                favItem.innerHTML = `                    <a class="text" title="${title}" href="${link}">${title}</a>
                    <span class="be-dropdown-item">取消订阅</span>
                `;

                favListContainer.appendChild(favItem);
            });
        } else {
            const containers = Array.from(document.querySelectorAll('.nav-container.fav-container'));
            const targetContainer = containers.find(container => container.querySelector('p')?.textContent.includes('我的收藏和订阅'));

            if (targetContainer) {
                favListContainer = targetContainer.querySelector('.fav-list-container');

                if (favListContainer) {
                    let lastHeight = favListContainer.scrollHeight;
                    let attempts = 0;

                    await new Promise((resolve) => {
                        const checkScroll = () => {
                            const currentHeight = favListContainer.scrollHeight;
                            favListContainer.scrollTop += favListContainer.clientHeight / 2;

                            if (lastHeight !== currentHeight) {
                                lastHeight = currentHeight;
                                attempts = 0;
                                setTimeout(checkScroll, 100);
                            } else if (attempts < 50) {
                                attempts++;
                                setTimeout(checkScroll, 100);
                            } else {
                                console.log('没有更多内容');
                                displayLoadedSubscriptions(targetContainer);
                                panel.removeChild(loadingMessage);
                                resolve();
                            }
                        };
                        checkScroll();
                    });
                    return;
                }
            }
        }

        if (!favListContainer) {
            console.error('未找到订阅列表');
            panel.removeChild(loadingMessage);
            return;
        }

        displayLoadedSubscriptions(favListContainer);
        panel.removeChild(loadingMessage);
    }

    function displayLoadedSubscriptions(container) {
        const items = container.querySelectorAll('.fav-item');
        const subscriptionList = document.querySelector('.subscription-list');
        subscriptionList.innerHTML = '';

        const isNewUI = document.querySelector('.vui_collapse_item') !== null;

        items.forEach((item) => {
            const title = item.querySelector('.text').title;
            const link = item.querySelector('.text').href;
            const fid = item.getAttribute('fid');

            const listItem = document.createElement('div');
            listItem.classList.add('subscription-item');

            listItem.innerHTML = `<input type="checkbox" value="${fid}" class="subscription-checkbox">
                                 <label>${title}</label>
                                 <a href="javascript:void(0)" class="view-link">查看</a>`;

            listItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('view-link')) {
                    if (isNewUI) {
                        const originalItem = document.querySelector(`div[title="${title}"]`);
                        if (originalItem) {
                            panel.style.display = 'none';
                            panel.classList.add('hidden');

                            const progressElement = document.getElementById('unsubscribe-progress');
                            if (progressElement) {
                                progressElement.style.display = 'block';
                                progressElement.querySelector('.progress-title').textContent = '正在查看订阅';
                                progressElement.querySelector('.progress-bar').style.display = 'none';
                                progressElement.querySelector('.progress-info').style.display = 'none';
                                progressElement.querySelector('.abort-button').style.display = 'none';
                                const returnButton = progressElement.querySelector('.return-button');
                                returnButton.style.display = 'block';
                                returnButton.textContent = '返回订阅管理';
                            }

                            const titleLink = originalItem.querySelector('.vui_sidebar-item-title');
                            if (titleLink) {
                                titleLink.click();
                            }
                        }
                    } else {
                        window.open(link, '_blank');
                    }
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                const checkbox = listItem.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                listItem.classList.toggle('selected', checkbox.checked);
            });

            subscriptionList.appendChild(listItem);
        });
    }

    const closeBtn = panel.querySelector('.close-btn');
    closeBtn.addEventListener('click', togglePanel);

    const selectAllBtn = panel.querySelector('#select-all');
    selectAllBtn.addEventListener('click', () => {
        const visibleItems = panel.querySelectorAll('.subscription-item:not([style*="display: none"])');
        visibleItems.forEach((item) => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.checked = true;
            item.classList.add('selected');
        });
    });

    const deselectAllBtn = panel.querySelector('#deselect-all');
    deselectAllBtn.addEventListener('click', () => {
        const items = panel.querySelectorAll('.subscription-item');
        items.forEach((item) => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.checked = false;
            item.classList.remove('selected');
        });
    });

    let isAborting = false;

    const progressHTML = `
        <div id="unsubscribe-progress">
            <div class="progress-title">正在取消订阅</div>
            <div class="progress-bar">
                <div class="progress-bar-inner"></div>
            </div>
            <div class="progress-info">
                <span class="progress-count">0/0</span>
                <span class="progress-percentage">0%</span>
            </div>
            <div class="button-container">
                <button class="abort-button">中止操作</button>
                <button class="return-button">返回管理面板</button>
            </div>
        </div>
    `;

    function initializeProgress() {
        const oldProgress = document.getElementById('unsubscribe-progress');
        if (oldProgress) {
            oldProgress.remove();
        }

        document.body.insertAdjacentHTML('beforeend', progressHTML);

        const progressElement = document.getElementById('unsubscribe-progress');
        const returnButton = progressElement.querySelector('.return-button');

        progressElement.style.display = 'none';

        returnButton.addEventListener('click', () => {
            progressElement.style.display = 'none';
            panel.style.display = 'flex';
            panel.classList.remove('hidden');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProgress);
    } else {
        initializeProgress();
    }

    function updateProgress(current, total) {
        requestAnimationFrame(() => {
            const progressElement = document.getElementById('unsubscribe-progress');
            if (!progressElement) {
                console.error('进度窗口未找到，重新初始化...');
                initializeProgress();
                return;
            }

            const progressBar = progressElement.querySelector('.progress-bar-inner');
            const progressCount = progressElement.querySelector('.progress-count');
            const progressPercentage = progressElement.querySelector('.progress-percentage');

            const percentage = Math.round((current / total) * 100);

            progressBar.style.width = `${percentage}%`;
            progressCount.textContent = `${current}/${total}`;
            progressPercentage.textContent = `${percentage}%`;
        });
    }

    const unsubscribeSelectedBtn = panel.querySelector('#unsubscribe-selected');
    unsubscribeSelectedBtn.addEventListener('click', async () => {
        const checkedItems = panel.querySelectorAll('.subscription-item input[type="checkbox"]:checked');
        if (checkedItems.length === 0) return;

        const isNewUI = document.querySelector('.vui_collapse_item') !== null;

        if (isNewUI) {
            panel.style.display = 'none';
            panel.classList.add('hidden');

            let progressElement = document.getElementById('unsubscribe-progress');
            if (!progressElement) {
                initializeProgress();
                progressElement = document.getElementById('unsubscribe-progress');
            }

            progressElement.style.display = 'block';

            isAborting = false;

            const abortButton = progressElement.querySelector('.abort-button');
            const returnButton = progressElement.querySelector('.return-button');
            const titleElement = progressElement.querySelector('.progress-title');
            const progressBarContainer = progressElement.querySelector('.progress-bar');
            const progressInfo = progressElement.querySelector('.progress-info');

            progressElement.classList.remove('completed');
            progressBarContainer.style.display = 'block';
            progressInfo.style.display = 'block';
            abortButton.style.display = 'block';
            returnButton.style.display = 'none';
            titleElement.textContent = '正在取消订阅';

            const progressBar = progressElement.querySelector('.progress-bar-inner');
            progressBar.style.width = '0%';

            abortButton.removeEventListener('click', abortButton.abortHandler);
            returnButton.removeEventListener('click', returnButton.returnHandler);

            const abortHandler = () => {
                isAborting = true;
                progressElement.style.display = 'none';
                panel.style.display = 'flex';
                panel.classList.remove('hidden');
            };
            abortButton.abortHandler = abortHandler;
            abortButton.addEventListener('click', abortHandler);

            const returnHandler = () => {
                progressElement.style.display = 'none';
                panel.style.display = 'flex';
                panel.classList.remove('hidden');
            };
            returnButton.returnHandler = returnHandler;
            returnButton.addEventListener('click', returnHandler);

            let current = 0;
            const total = checkedItems.length;

            for (let checkbox of checkedItems) {
                if (isAborting) break;

                const title = checkbox.nextElementSibling.textContent.trim();
                await confirmAndUnsubscribe(title);

                current++;
                updateProgress(current, total);
            }

            if (!isAborting) {
                progressElement.classList.add('completed');
                titleElement.textContent = '取消订阅完成';
                abortButton.style.display = 'none';
                returnButton.style.display = 'block';
            }
        } else {
            for (let checkbox of checkedItems) {
                const title = checkbox.nextElementSibling.textContent.trim();
                const fid = checkbox.value;
                await simulateUnsubscribeByTitle(title, fid);
            }
        }

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

    function exportToCSV() {
        try {
            console.log('开始导出CSV');
            const items = document.querySelectorAll('.subscription-item');
            if (items.length === 0) {
                alert('没有可导出的订阅内容！');
                return;
            }

            const csvContent = [
                ['标题', '合集ID'].join(','),
                ...Array.from(items).map((item) => {
                    const title = item.querySelector('label')?.textContent?.trim() || '未知标题';
                    const fid = item.querySelector('input')?.value || '未知ID';
                    return `"${title.replace(/"/g, '""')}",${fid}`;
                })
            ].join('\n');

            if (!csvContent || csvContent.trim().length === 0) {
                throw new Error('CSV 内容为空');
            }

            const filename = `哔哩订阅列表_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.csv`;

            if (typeof GM_download !== 'undefined') {
                const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent("\uFEFF" + csvContent)}`;
                GM_download({
                    url: dataUrl,
                    name: filename,
                    saveAs: true,
                    onload: () => console.log('GM下载完成')
                });
            } else {
                const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 5000);
            }
        } catch (error) {
            console.error('导出CSV失败:', error);
            alert(`导出失败: ${error.message}`);
        }
    }

    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'export-csv') {
            exportToCSV();
        }
    });
})();
