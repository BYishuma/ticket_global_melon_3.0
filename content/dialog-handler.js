// 弹窗自动处理功能
// 自动检测并点击 "Please try again." 弹窗的确认按钮

// 模拟按 Enter 键来确认弹窗
function simulateEnterKey() {
    try {
        // 创建键盘事件
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        });
        
        const enterEventUp = new KeyboardEvent('keyup', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        });
        
        // 在 document 上触发
        document.dispatchEvent(enterEvent);
        document.dispatchEvent(enterEventUp);
        
        // 也在 window 上触发
        window.dispatchEvent(enterEvent);
        window.dispatchEvent(enterEventUp);
        
        // 尝试在 iframe 中触发
        try {
            if (typeof theFrame === 'function') {
                const frame = theFrame();
                if (frame && frame.document) {
                    frame.document.dispatchEvent(enterEvent);
                    frame.document.dispatchEvent(enterEventUp);
                }
            }
        } catch (e) {
            // 忽略 iframe 错误
        }
        
        return true;
    } catch (e) {
        console.error('模拟 Enter 键时出错:', e);
        return false;
    }
}

// 拦截浏览器原生 alert/confirm 弹窗
function interceptNativeDialogs() {
    // 保存原始函数
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    // 重写 alert - 直接阻止显示，不调用原始函数
    window.alert = function(message) {
        const msg = message ? String(message) : '';
        const msgLower = msg.toLowerCase();
        console.log('拦截到 alert:', msg);
        console.log('检查消息:', msgLower, '包含 please try again:', msgLower.includes('please try again'), '包含 try again:', msgLower.includes('try again'));
        
        if (msgLower.includes('please try again') || msgLower.includes('try again')) {
            console.log('✅✅✅ 检测到 "Please try again." 弹窗，已阻止显示（不显示弹窗）');
            // 直接返回，不调用原始函数，这样弹窗就不会显示
            return;
        }
        console.log('不是目标弹窗，正常显示');
        // 其他 alert 正常显示
        return originalAlert.call(window, message);
    };
    
    // 重写 confirm - 直接返回 true，不显示弹窗
    window.confirm = function(message) {
        console.log('拦截到 confirm:', message);
        if (message && (message.toLowerCase().includes('please try again') || message.toLowerCase().includes('try again'))) {
            console.log('检测到 "Please try again." 确认框，已阻止显示并自动确认');
            // 直接返回 true，不调用原始函数，这样弹窗就不会显示
            return true;
        }
        // 其他 confirm 正常显示
        return originalConfirm.call(window, message);
    };
    
    // 在 iframe 中也拦截
    function interceptFrameDialogs(frame) {
        // frame 可能是 contentWindow 直接传入，也可能是 { window: contentWindow } 对象
        const frameWindow = frame && frame.window ? frame.window : frame;
        if (!frameWindow || typeof frameWindow !== 'object') return;
        
        try {
            if (frameWindow.alert && !frameWindow._alertIntercepted) {
                const originalFrameAlert = frameWindow.alert;
                frameWindow.alert = function(message) {
                    console.log('拦截到 iframe alert:', message);
                    if (message && (message.toLowerCase().includes('please try again') || message.toLowerCase().includes('try again'))) {
                        console.log('检测到 iframe "Please try again." 弹窗，已阻止显示（不显示弹窗）');
                        // 直接返回，不调用原始函数，这样弹窗就不会显示
                        return;
                    }
                    return originalFrameAlert.call(frameWindow, message);
                };
                frameWindow._alertIntercepted = true;
                console.log('✅ 已拦截 iframe alert');
            }
            
            if (frameWindow.confirm && !frameWindow._confirmIntercepted) {
                const originalFrameConfirm = frameWindow.confirm;
                // 立即重写，确保在弹窗调用前就拦截
                Object.defineProperty(frameWindow, 'confirm', {
                    value: function(message) {
                        console.log('拦截到 iframe confirm:', message);
                        if (message && (message.toLowerCase().includes('please try again') || message.toLowerCase().includes('try again'))) {
                            console.log('✅ 检测到 iframe "Please try again." 确认框，已阻止显示并自动确认');
                            // 直接返回 true，不调用原始函数，这样弹窗就不会显示
                            return true;
                        }
                        return originalFrameConfirm.call(frameWindow, message);
                    },
                    writable: true,
                    configurable: true
                });
                frameWindow._confirmIntercepted = true;
                console.log('✅ 已拦截 iframe confirm（使用 defineProperty）');
            }
        } catch (e) {
            // 跨域 iframe 可能无法访问
            console.log('无法拦截 iframe 弹窗（可能是跨域）:', e);
        }
    }
    
    // 立即拦截已存在的 iframe（在document_start阶段可能还没有iframe）
    function interceptExistingIframes() {
        try {
            const iframes = document.querySelectorAll('iframe');
            for (const iframe of iframes) {
                try {
                    const frameWindow = iframe.contentWindow;
                    if (frameWindow) {
                        interceptFrameDialogs(frameWindow);
                    }
                } catch (e) {
                    // 跨域 iframe 无法访问，忽略
                }
            }
        } catch (e) {
            // 忽略错误
        }
    }
    
    // 立即尝试拦截
    interceptExistingIframes();
    
    // 如果document还没准备好，等待一下再拦截
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', interceptExistingIframes);
    }
    
    // 监听 iframe 加载事件
    function setupIframeListener() {
        // 立即拦截一次
        interceptExistingIframes();
        
        const observer = new MutationObserver(() => {
            interceptExistingIframes();
        });
        
        const target = document.body || document.documentElement || document;
        if (target) {
            observer.observe(target, {
                childList: true,
                subtree: true
            });
        }
        
        // 也监听所有iframe的load事件
        const checkIframes = () => {
            const iframes = document.querySelectorAll('iframe');
            for (const iframe of iframes) {
                if (!iframe._listenerAttached) {
                    iframe.addEventListener('load', () => {
                        setTimeout(() => {
                            try {
                                const frameWindow = iframe.contentWindow;
                                if (frameWindow) {
                                    console.log('iframe 加载完成，立即拦截');
                                    interceptFrameDialogs(frameWindow);
                                }
                            } catch (e) {
                                // 跨域 iframe 无法访问，忽略
                            }
                        }, 0);
                    });
                    iframe._listenerAttached = true;
                }
            }
        };
        
        checkIframes();
        setInterval(checkIframes, 100);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupIframeListener);
    } else {
        setupIframeListener();
    }
    
    // 定期检查并拦截 iframe 中的弹窗（非常频繁地检查）
    const frameCheckInterval = setInterval(() => {
        try {
            // 方法1: 通过 theFrame 函数获取 iframe
            if (typeof theFrame === 'function') {
                try {
                    const frame = theFrame();
                    if (frame) {
                        interceptFrameDialogs(frame);
                    }
                } catch (e) {
                    // theFrame可能还没准备好
                }
            }
            
            // 方法2: 直接查找 iframe 元素并拦截
            interceptExistingIframes();
            
            // 方法3: 检查拦截是否仍然有效
            try {
                const iframes = document.querySelectorAll('iframe');
                for (const iframe of iframes) {
                    try {
                        const frameWindow = iframe.contentWindow;
                        if (frameWindow && frameWindow._alertIntercepted) {
                            // 验证拦截是否仍然有效
                            const currentAlert = frameWindow.alert;
                            if (currentAlert && !currentAlert.toString().includes('拦截到 iframe alert')) {
                                console.log('⚠️ 警告：iframe alert 拦截被覆盖，重新拦截');
                                frameWindow._alertIntercepted = false;
                                interceptFrameDialogs(frameWindow);
                            }
                        }
                    } catch (e) {
                        // 跨域 iframe 无法访问，忽略
                    }
                }
            } catch (e) {
                // 忽略错误
            }
        } catch (e) {
            // 忽略错误
        }
    }, 50); // 非常频繁地检查（每50ms，确保在弹窗显示前拦截）
    
    // 保存 interval ID 以便后续清理
    window._frameCheckInterval = frameCheckInterval;
    
    console.log('原生弹窗拦截已启动');
}

async function handleTryAgainDialog() {
    try {
        // 确保 theFrame 函数可用
        if (typeof theFrame !== 'function') {
            return false;
        }
        
        const frame = theFrame();
        if (!frame || !frame.document) {
            return false;
        }

        // 查找包含 "Please try again." 文本的元素
        // 可能的选择器：弹窗、对话框、提示框等
        const possibleSelectors = [
            // 常见的弹窗选择器
            '.popup',
            '.dialog',
            '.modal',
            '.alert',
            '.message',
            '[class*="popup"]',
            '[class*="dialog"]',
            '[class*="modal"]',
            '[class*="alert"]',
            '[class*="message"]',
            // 按钮选择器
            'button',
            'a[class*="btn"]',
            'input[type="button"]',
            'input[type="submit"]'
        ];

        // 方法1: 查找包含 "Please try again." 文本的元素
        const allElements = frame.document.querySelectorAll('*');
        for (const element of allElements) {
            const text = element.textContent || element.innerText || '';
            if (text.includes('Please try again.') || text.includes('please try again')) {
                // 检查是否已经处理过这个弹窗（避免重复处理）
                if (element._dialogHandled) {
                    continue;
                }
                element._dialogHandled = true;
                
                console.log('检测到 "Please try again." 弹窗，将在2秒后自动点击确认');
                console.log('弹窗元素:', element);
                
                // 保存元素的引用，避免2秒后找不到
                const savedElement = element;
                const savedFrame = frame;
                
                // 等待2秒后点击确认按钮（模拟人类行为）
                setTimeout(() => {
                    console.log('2秒后自动点击确认按钮 - 开始执行');
                    
                    try {
                        // 重新获取frame（确保frame仍然有效）
                        let currentFrame = savedFrame;
                        console.log('保存的frame:', currentFrame);
                        
                        if (typeof theFrame === 'function') {
                            try {
                                const newFrame = theFrame();
                                if (newFrame && newFrame.document) {
                                    currentFrame = newFrame;
                                    console.log('成功获取新的frame');
                                }
                            } catch (e) {
                                console.log('无法获取frame，使用保存的frame:', e);
                            }
                        }
                        
                        if (!currentFrame || !currentFrame.document) {
                            console.log('Frame无效，尝试使用Enter键');
                            for (let i = 0; i < 10; i++) {
                                setTimeout(() => simulateEnterKey(), i * 50);
                            }
                            return;
                        }
                        
                        console.log('Frame有效，继续查找按钮');
                        
                        // 尝试重新查找元素
                        let currentElement = savedElement;
                        if (!currentElement || !currentElement.parentElement) {
                            console.log('原始元素已失效，重新查找弹窗');
                            // 重新查找包含 "Please try again." 的元素
                            const allElements = currentFrame.document.querySelectorAll('*');
                            for (const el of allElements) {
                                const text = el.textContent || el.innerText || '';
                                if (text.includes('Please try again.') || text.includes('please try again')) {
                                    currentElement = el;
                                    console.log('重新找到弹窗元素');
                                    break;
                                }
                            }
                        }
                        
                        if (!currentElement) {
                            console.log('无法找到弹窗元素，尝试使用Enter键');
                            simulateEnterKey();
                            return;
                        }
                        
                        // 查找确认按钮 - 可能在同一个弹窗容器内
                        let container = currentElement.closest('.popup, .dialog, .modal, .alert, [class*="popup"], [class*="dialog"], [class*="modal"]');
                        if (!container) {
                            container = currentElement.parentElement;
                        }
                        if (!container) {
                            container = currentElement;
                        }
                        
                        console.log('查找按钮，容器:', container, '容器类型:', container.tagName);
                        
                        // 查找按钮 - 扩大搜索范围
                        let buttons = container.querySelectorAll('button, a[class*="btn"], input[type="button"], input[type="submit"], [class*="button"], [role="button"]');
                        console.log('在容器中找到按钮数量:', buttons.length);
                        
                        // 如果容器内没找到，在整个弹窗区域查找
                        if (!buttons || buttons.length === 0) {
                            console.log('容器内未找到按钮，扩大搜索范围');
                            const dialogContainer = currentElement.closest('div, section, article') || currentElement.parentElement;
                            if (dialogContainer) {
                                buttons = dialogContainer.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
                                console.log('在弹窗区域找到按钮数量:', buttons.length);
                            }
                        }
                        
                        // 如果还是没找到，在整个frame中查找所有按钮
                        if (!buttons || buttons.length === 0) {
                            console.log('弹窗区域未找到按钮，在整个frame中查找');
                            buttons = currentFrame.document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
                            console.log('在整个frame中找到按钮数量:', buttons.length);
                        }
                        
                        if (buttons && buttons.length > 0) {
                            console.log(`找到 ${buttons.length} 个按钮，开始检查`);
                            for (let i = 0; i < buttons.length; i++) {
                                const btn = buttons[i];
                                const btnText = (btn.textContent || btn.innerText || btn.value || btn.getAttribute('aria-label') || '').toLowerCase();
                                console.log(`检查按钮 ${i + 1}/${buttons.length}:`, btnText, '按钮元素:', btn);
                                // 查找确认、确定、OK、Close 等按钮
                                if (btnText.includes('confirm') || 
                                    btnText.includes('ok') || 
                                    btnText.includes('确定') || 
                                    btnText.includes('确认') ||
                                    btnText.includes('close') ||
                                    btnText.includes('关闭') ||
                                    btnText === 'ok' ||
                                    btnText === '确认') {
                                    console.log('找到确认按钮，开始点击:', btn, '按钮文本:', btnText);
                                    // 尝试多种点击方式
                                    try {
                                        btn.focus();
                                        btn.click();
                                        console.log('已调用 btn.click()');
                                    } catch (e) {
                                        console.log('btn.click() 失败:', e);
                                    }
                                    
                                    // 也尝试触发鼠标事件
                                    try {
                                        const clickEvent = new MouseEvent('click', {
                                            bubbles: true,
                                            cancelable: true,
                                            view: currentFrame,
                                            detail: 1
                                        });
                                        btn.dispatchEvent(clickEvent);
                                        console.log('已触发 MouseEvent');
                                    } catch (e) {
                                        console.log('MouseEvent 失败:', e);
                                    }
                                    
                                    // 也尝试在frame中触发
                                    try {
                                        const frameClickEvent = new currentFrame.MouseEvent('click', {
                                            bubbles: true,
                                            cancelable: true,
                                            view: currentFrame,
                                            detail: 1
                                        });
                                        btn.dispatchEvent(frameClickEvent);
                                        console.log('已触发 frame MouseEvent');
                                    } catch (e) {
                                        console.log('frame MouseEvent 失败:', e);
                                    }
                                    
                                    console.log('按钮点击完成，等待验证');
                                    return;
                                }
                            }
                            
                            console.log('未找到特定确认按钮，尝试点击第一个可见按钮');
                            // 如果没找到特定按钮，尝试点击第一个可见按钮
                            for (let i = 0; i < buttons.length; i++) {
                                const btn = buttons[i];
                                try {
                                    const style = currentFrame.getComputedStyle(btn);
                                    if (style.display !== 'none' && style.visibility !== 'hidden') {
                                        console.log(`点击第一个可见按钮 (${i + 1}):`, btn);
                                        btn.focus();
                                        btn.click();
                                        const clickEvent = new MouseEvent('click', {
                                            bubbles: true,
                                            cancelable: true,
                                            view: currentFrame,
                                            detail: 1
                                        });
                                        btn.dispatchEvent(clickEvent);
                                        console.log('已点击可见按钮');
                                        return;
                                    }
                                } catch (e) {
                                    console.log(`检查按钮 ${i + 1} 可见性时出错:`, e);
                                }
                            }
                            
                            // 如果所有按钮都不可见，点击第一个
                            if (buttons.length > 0) {
                                console.log('所有按钮都不可见，点击第一个按钮:', buttons[0]);
                                try {
                                    buttons[0].focus();
                                    buttons[0].click();
                                    console.log('已点击第一个按钮');
                                } catch (e) {
                                    console.log('点击第一个按钮失败:', e);
                                }
                            }
                        } else {
                            console.log('未找到任何按钮，尝试使用Enter键（连续10次）');
                            // 多次尝试按Enter
                            for (let i = 0; i < 10; i++) {
                                setTimeout(() => {
                                    console.log(`第 ${i + 1} 次按Enter键`);
                                    simulateEnterKey();
                                }, i * 100);
                            }
                        }
                    } catch (error) {
                        console.error('点击确认按钮时出错:', error);
                        // 出错时尝试使用Enter键（多次）
                        for (let i = 0; i < 5; i++) {
                            setTimeout(() => simulateEnterKey(), i * 100);
                        }
                    }
                }, 2000);
                
                return true;
            }
        }

        // 方法2: 查找常见的弹窗结构并检查文本
        for (const selector of possibleSelectors) {
            const elements = frame.document.querySelectorAll(selector);
            for (const element of elements) {
                const text = (element.textContent || element.innerText || '').toLowerCase();
                if (text.includes('please try again')) {
                    console.log('检测到 "Please try again." 弹窗（方法2），将在2秒后自动点击确认');
                    
                    // 等待2秒后点击确认按钮（模拟人类行为）
                    setTimeout(() => {
                        console.log('2秒后自动点击确认按钮（方法2）');
                        
                        try {
                            // 重新查找元素（因为DOM可能已变化）
                            if (!element || !element.parentElement) {
                                console.log('无法找到弹窗元素，尝试使用Enter键');
                                simulateEnterKey();
                                return;
                            }
                            
                            // 查找按钮
                            const buttons = element.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
                            if (buttons && buttons.length > 0) {
                                // 优先查找确认类按钮
                                for (const btn of buttons) {
                                    const btnText = (btn.textContent || btn.innerText || btn.value || '').toLowerCase();
                                    if (btnText.includes('confirm') || 
                                        btnText.includes('ok') || 
                                        btnText.includes('确定') || 
                                        btnText.includes('确认') ||
                                        btnText === 'ok') {
                                        console.log('找到确认按钮，自动点击');
                                        btn.click();
                                        return;
                                    }
                                }
                                // 如果没找到，点击第一个
                                console.log('点击第一个可用按钮');
                                buttons[0].click();
                            } else {
                                console.log('未找到按钮，尝试使用Enter键');
                                simulateEnterKey();
                            }
                        } catch (error) {
                            console.error('点击确认按钮时出错（方法2）:', error);
                            // 出错时尝试使用Enter键
                            simulateEnterKey();
                        }
                    }, 2000);
                    
                    return true;
                }
            }
        }

        return false;
    } catch (error) {
        console.error('处理弹窗时出错:', error);
        return false;
    }
}

// 定期检查弹窗
let dialogCheckInterval = null;

function startDialogWatcher() {
    // 如果已经有监控在运行，先清除
    if (dialogCheckInterval) {
        clearInterval(dialogCheckInterval);
    }
    
    // 更频繁地检查弹窗（每200ms）
    dialogCheckInterval = setInterval(async () => {
        await handleTryAgainDialog();
    }, 200);
    
    console.log('弹窗监控已启动');
}

function stopDialogWatcher() {
    if (dialogCheckInterval) {
        clearInterval(dialogCheckInterval);
        dialogCheckInterval = null;
        console.log('弹窗监控已停止');
    }
}

// 页面加载完成后启动监控
// 注意：由于 dialog-handler.js 在 seat.js 之前加载，theFrame() 函数可能还未定义
// 所以监控会在 waitFirstLoad() 中启动，或者延迟启动
if (typeof window !== 'undefined') {
    // 立即启动原生弹窗拦截（不依赖其他函数）
    interceptNativeDialogs();
    
    // 延迟启动 HTML 弹窗监控，等待其他脚本加载完成
    const delayedStart = () => {
        // 检查 theFrame 函数是否已定义
        if (typeof theFrame === 'function') {
            startDialogWatcher();
        } else {
            // 如果还没定义，再等一会儿
            setTimeout(delayedStart, 500);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(delayedStart, 1500);
        });
    } else {
        setTimeout(delayedStart, 1500);
    }
    
    // 暴露函数到全局作用域
    window.handleTryAgainDialog = handleTryAgainDialog;
    window.startDialogWatcher = startDialogWatcher;
    window.stopDialogWatcher = stopDialogWatcher;
    window.interceptNativeDialogs = interceptNativeDialogs;
}
