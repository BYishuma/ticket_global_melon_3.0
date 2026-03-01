// 邮件发送功能
// 邮箱配置：直接在代码中配置，无需在控制台设置

// 默认邮箱配置（直接在代码中修改）
const DEFAULT_EMAIL_CONFIG = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwFFTV2FyHMJ0RSZAQA91tvKuz0ATGSqKXRiuwtmLIxgk8zPm8Xvo82ppcc3faHX2inZQ/exec',
    recipientEmail: 'mayishu896231044@gmail.com'
};

// 使用 fetch 的替代方法（因为 no-cors 模式无法读取响应）
async function sendEmailNotificationWithForm(concertInfo = {}) {
    try {
        // 优先使用代码中配置的默认值
        const recipientEmail = DEFAULT_EMAIL_CONFIG.recipientEmail;
        const scriptUrl = DEFAULT_EMAIL_CONFIG.scriptUrl;
        
        if (!scriptUrl || scriptUrl.includes('YOUR_')) {
            console.log('邮件功能未配置：请在 content/email.js 中配置 scriptUrl');
            return;
        }

        // 使用表单提交方式（Google Apps Script 需要处理 GET 请求）
        const params = new URLSearchParams({
            to: recipientEmail,
            subject: encodeURIComponent('🎫 票务提醒 - 找到票了！'),
            body: encodeURIComponent(`恭喜！系统检测到有票可用。

演唱会信息：
${concertInfo.concertName || '未知演唱会'}
${concertInfo.date ? `日期：${concertInfo.date}` : ''}
${concertInfo.time ? `时间：${concertInfo.time}` : ''}
${concertInfo.section ? `区域：${concertInfo.section}` : ''}

请尽快查看并完成购票流程！

检测时间：${new Date().toLocaleString('zh-CN')}`)
        });

        // 使用 GET 请求（Google Apps Script 更容易处理）
        const url = `${scriptUrl}?${params.toString()}`;
        
        await fetch(url, {
            method: 'GET',
            mode: 'no-cors'
        });

        console.log('邮件发送请求已发送到:', recipientEmail);
    } catch (error) {
        console.error('发送邮件时出错:', error);
    }
}

// 将函数暴露到全局作用域，方便在控制台中测试
if (typeof window !== 'undefined') {
    window.sendEmailNotificationWithForm = sendEmailNotificationWithForm;
}
